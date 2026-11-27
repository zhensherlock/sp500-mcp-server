import { A2A_PROTOCOL_VERSION, AGENT_CARD_PATH, Role, TaskState, type AgentCard, type Part } from '@a2a-js/sdk'
import { TaskNotCancelableError, UnsupportedOperationError } from '@a2a-js/sdk/errors'
import { AgentEvent, DefaultRequestHandler, InMemoryTaskStore, type AgentExecutor } from '@a2a-js/sdk/server'
import { agentCardHandler, jsonRpcHandler, UserBuilder } from '@a2a-js/sdk/server/express'
import express from 'express'
import { buildCompanyBrief } from './company-brief.js'
import { getCompanyInfo, type CompanyChoice } from './company-info.js'
import { companyLookupQuery, extractCompanyName } from './company-query.js'

const host = '127.0.0.1'
const port = 4100
const localOrigin = `http://${host}:${port}`
const origin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : localOrigin
const taskStore = new InMemoryTaskStore()
const choicesByTask = new Map<string, CompanyChoice>()
type StepState = 'running' | 'completed' | 'waiting' | 'empty' | 'unavailable'

const card: AgentCard = {
  name: 'S&P 500 Company Brief',
  description: 'Find a company by name or ticker and get a brief with annual financials and the latest available news.',
  version: '0.1.0',
  supportedInterfaces: [
    { url: `${origin}/a2a`, protocolBinding: 'JSONRPC', protocolVersion: A2A_PROTOCOL_VERSION, tenant: '' },
  ],
  provider: undefined,
  capabilities: { streaming: false, extensions: [] },
  securitySchemes: {},
  securityRequirements: [],
  defaultInputModes: ['text/plain'],
  defaultOutputModes: ['text/plain', 'application/json'],
  skills: [
    {
      id: 'company-info',
      name: 'Company brief',
      description:
        'Ask for a company brief or send a company name or ticker. Choose a ticker if multiple companies match.',
      tags: ['company', 'financials', 'news'],
      examples: ['Bank', '帮我看一下苹果公司的简报', 'XOM'],
      inputModes: [],
      outputModes: [],
      securityRequirements: [],
    },
  ],
  signatures: [],
}

function textPart(value: string): Part {
  return { content: { $case: 'text', value }, mediaType: 'text/plain', filename: '', metadata: undefined }
}

function dataPart(value: Record<string, unknown>): Part {
  return { content: { $case: 'data', value }, mediaType: 'application/json', filename: '', metadata: undefined }
}

const executor: AgentExecutor = {
  async execute({ taskId, contextId, userMessage, task }, eventBus) {
    const input = userMessage.parts.find(part => part.content?.$case === 'text')?.content
    const text = input?.$case === 'text' ? input.value.trim() : ''
    const scope = { taskId, contextId, metadata: undefined }
    const progress: Partial<Record<'company' | 'financials' | 'news', StepState>> = {}
    eventBus.publish(
      AgentEvent.task({
        ...task,
        id: taskId,
        contextId,
        history: task?.history ?? [],
        artifacts: task?.artifacts ?? [],
        metadata: task?.metadata,
        status: { state: TaskState.TASK_STATE_SUBMITTED, timestamp: new Date().toISOString(), message: undefined },
      }),
    )

    function publishStatus(state: TaskState, message: string, data?: Record<string, unknown>) {
      eventBus.publish(
        AgentEvent.statusUpdate({
          ...scope,
          status: {
            state,
            timestamp: new Date().toISOString(),
            message: {
              ...scope,
              messageId: crypto.randomUUID(),
              role: Role.ROLE_AGENT,
              parts: [textPart(message), dataPart({ ...data, progress: { ...progress } })],
              extensions: [],
              referenceTaskIds: [],
            },
          },
        }),
      )
    }

    function askForChoice(choice: CompanyChoice, prefix = '') {
      progress.company = 'waiting'
      const message = `${prefix}${choice.prompt}\nReply with a ticker from this list.`
      publishStatus(TaskState.TASK_STATE_INPUT_REQUIRED, message, { options: choice.symbols })
    }

    const pending = choicesByTask.get(taskId)
    const symbol = text.toUpperCase()
    if (pending && !pending.symbols.includes(symbol)) {
      askForChoice(pending, 'Please choose one of the listed companies.\n\n')
      return
    }
    if (!text) {
      progress.company = 'waiting'
      publishStatus(TaskState.TASK_STATE_INPUT_REQUIRED, 'Send a company name or ticker.')
      return
    }

    const selection = pending && { symbol, requestState: pending.requestState }
    const lookup = (query: string) =>
      getCompanyInfo(query, selection).catch(error => {
        console.error(`MCP company lookup failed for task ${taskId}:`, error)
        return undefined
      })

    let query = pending?.query ?? companyLookupQuery(text)
    progress.company = 'running'
    publishStatus(TaskState.TASK_STATE_WORKING, 'Looking up the company.')
    let result = await lookup(query)
    if (result?.kind === 'not_found' && !pending) {
      let companyName
      try {
        companyName = await extractCompanyName(text)
      } catch (error) {
        console.error(`Company name extraction failed for task ${taskId}:`, error instanceof Error ? error.name : error)
        progress.company = 'unavailable'
        publishStatus(
          TaskState.TASK_STATE_INPUT_REQUIRED,
          'Company name extraction is temporarily unavailable. Send the company name or ticker to continue.',
        )
        return
      }
      if (companyName === null) {
        progress.company = 'waiting'
        publishStatus(TaskState.TASK_STATE_INPUT_REQUIRED, 'Send one company name or ticker to continue.')
        return
      }
      const extractedQuery = companyName && companyLookupQuery(companyName)
      if (extractedQuery && extractedQuery !== query) {
        query = extractedQuery
        result = await lookup(query)
      }
    }
    if (!result) {
      progress.company = 'unavailable'
      publishStatus(
        TaskState.TASK_STATE_INPUT_REQUIRED,
        `Company lookup is temporarily unavailable. Send ${pending ? 'your chosen ticker' : 'the company name or ticker'} again to retry.`,
      )
      return
    }
    if (result.kind === 'choose') {
      choicesByTask.set(taskId, result.choice)
      askForChoice(result.choice)
      return
    }

    choicesByTask.delete(taskId)
    if (result.kind === 'not_found' || (pending && result.company.symbol !== symbol)) {
      progress.company = 'empty'
      publishStatus(
        TaskState.TASK_STATE_INPUT_REQUIRED,
        `No companies matched "${pending ? symbol : query}". Send another company name or ticker.`,
      )
      return
    }

    const { company } = result
    progress.company = 'completed'
    progress.financials = 'running'
    progress.news = 'running'
    publishStatus(TaskState.TASK_STATE_WORKING, `Fetching annual financials and recent news for ${company.symbol}.`)
    const brief = await buildCompanyBrief(company, (section, status) => {
      progress[section] = status === 'available' ? 'completed' : status
      publishStatus(TaskState.TASK_STATE_WORKING, `Preparing the company brief for ${company.symbol}.`)
    })
    eventBus.publish(
      AgentEvent.artifactUpdate({
        ...scope,
        append: false,
        lastChunk: true,
        artifact: {
          artifactId: 'company-info',
          name: 'Company brief',
          description: 'Company profile, annual financials and latest available news from the S&P 500 MCP server.',
          parts: [dataPart(brief.data), textPart(brief.text)],
          metadata: undefined,
          extensions: [],
        },
      }),
    )
    publishStatus(TaskState.TASK_STATE_COMPLETED, `Company brief ready for ${company.symbol}.`)
  },
  async cancelTask(taskId) {
    throw new TaskNotCancelableError(`Cancellation is not supported for task ${taskId}.`)
  },
}

class CompanyRequestHandler extends DefaultRequestHandler {
  private readonly resuming = new Set<string>()

  override async sendMessage(...args: Parameters<DefaultRequestHandler['sendMessage']>) {
    const [{ message }, context] = args
    const taskId = message?.taskId
    if (!taskId) return super.sendMessage(...args)

    const busy = () => new UnsupportedOperationError(`Task ${taskId} is already processing a message.`)
    if (this.resuming.has(taskId)) throw busy()
    this.resuming.add(taskId)
    try {
      const task = await taskStore.load(taskId, context)
      const state = task?.status?.state
      if (state === TaskState.TASK_STATE_SUBMITTED || state === TaskState.TASK_STATE_WORKING) throw busy()
      return await super.sendMessage(...args)
    } finally {
      this.resuming.delete(taskId)
    }
  }
}

const requestHandler = new CompanyRequestHandler(card, taskStore, executor)
const app = express()

app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }))
app.use('/a2a', jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }))

if (!process.env.VERCEL) {
  app.listen(port, host, error => {
    if (error) throw error
    const agentCardUrl = `${localOrigin}/${AGENT_CARD_PATH}`
    console.log(`Agent Card: ${agentCardUrl}`)
    process.send?.(agentCardUrl)
  })
}

export default app
