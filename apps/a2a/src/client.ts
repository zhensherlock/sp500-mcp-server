import assert from 'node:assert/strict'
import { Message, TaskState, taskStateToJSON, type Task } from '@a2a-js/sdk'
import { ClientFactory } from '@a2a-js/sdk/client'

const client = await new ClientFactory().createFromUrl('http://127.0.0.1:4100')
const card = await client.getAgentCard()
console.log(`Discovered ${card.name} (A2A ${client.protocolVersion})`)
assert.equal(card.capabilities?.streaming, false)

async function send(text: string, task?: Task) {
  const message = Message.fromJSON({
    role: 'ROLE_USER',
    messageId: crypto.randomUUID(),
    taskId: task?.id,
    contextId: task?.contextId,
    parts: [{ text }],
  })
  const result = await client.sendMessage(
    { message, tenant: '', configuration: undefined, metadata: undefined },
    { signal: AbortSignal.timeout(45_000) },
  )
  assert.ok('id' in result)
  if (task) {
    assert.equal(result.id, task.id)
    assert.equal(result.contextId, task.contextId)
  }
  console.log(`\n${text} → ${taskStateToJSON(result.status?.state ?? TaskState.TASK_STATE_UNSPECIFIED)} (${result.id})`)
  const prompt = result.status?.message?.parts[0]?.content
  if (prompt?.$case === 'text') console.log(prompt.value)
  return result
}

function expectBrief(task: Task, symbol: string) {
  assert.equal(task.status?.state, TaskState.TASK_STATE_COMPLETED)
  assert.equal(task.artifacts.length, 1)
  const [dataPart, textPart] = task.artifacts[0].parts
  const data = dataPart?.content
  assert.ok(data?.$case === 'data')
  assert.equal(data.value?.symbol, symbol)
  assert.ok(
    data.value && 'longBusinessSummary' in data.value && 'financials' in data.value && 'latestNews' in data.value,
  )
  assert.ok(textPart?.content?.$case === 'text')
  assert.match(textPart.content.value, /Company brief\nSector:/)
  assert.match(textPart.content.value, /\nAnnual financials/)
  assert.match(textPart.content.value, /\nLatest available news\n/)
  return textPart.content.value
}

expectBrief(await send('XOM'), 'XOM')
expectBrief(await send('查询 apple 公司简报'), 'AAPL')
expectBrief(await send('帮我看一下苹果公司的简报'), 'AAPL')

const pending = await send('Bank')
assert.equal(pending.status?.state, TaskState.TASK_STATE_INPUT_REQUIRED)
const options = pending.status.message?.parts[1]?.content
assert.ok(options?.$case === 'data' && Array.isArray(options.value?.options) && options.value.options.includes('BAC'))
assert.equal((await send('XOM', pending)).status?.state, TaskState.TASK_STATE_INPUT_REQUIRED)
const result = await send('bac', pending)
expectBrief(result, 'BAC')
const task = await client.getTask({ id: result.id, tenant: '' }, { signal: AbortSignal.timeout(5_000) })
const brief = expectBrief(task, 'BAC')
assert.match(brief, /period ended \d{4}-\d{2}-\d{2}/)
assert.match(brief, /Revenue: [\d.,]+[KMBT]?.*Net income: [\d.,]+[KMBT]?/)
assert.match(brief, /Latest available news\n- \d{4}-\d{2}-\d{2}/)
console.log(`\n${brief}`)

const missing = await send('Aple')
assert.equal(missing.status?.state, TaskState.TASK_STATE_INPUT_REQUIRED)
const retryPrompt = missing.status.message?.parts[0]?.content
assert.ok(retryPrompt?.$case === 'text' && retryPrompt.value.includes('Send another company name or ticker.'))
expectBrief(await send('AAPL', missing), 'AAPL')
