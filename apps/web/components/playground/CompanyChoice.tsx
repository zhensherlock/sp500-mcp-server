'use client'

import { useId, useState } from 'react'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Spinner } from '@workspace/ui/components/spinner'
import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group'

export function CompanyChoice({
  prompt,
  options,
  disabled = false,
  onChoose,
  onCancel,
}: {
  prompt: string
  options: readonly { id: string; label: string }[]
  disabled?: boolean
  onChoose: (id: string) => unknown | Promise<unknown>
  onCancel?: () => void
}) {
  const labelId = useId()
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const choose = async (id: string) => {
    if (!id || submitting || disabled) return
    setValue(id)
    setSubmitting(true)
    setError(undefined)
    try {
      await onChoose(id)
    } catch (error) {
      setValue('')
      setError(error instanceof Error ? error.message : 'Could not submit your choice. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle id={labelId}>{prompt}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ToggleGroup
          type="single"
          variant="outline"
          size="lg"
          aria-labelledby={labelId}
          disabled={disabled || submitting}
          value={value}
          onValueChange={choose}
          className="max-w-full flex-wrap"
        >
          {options.map(option => (
            <ToggleGroupItem key={option.id} value={option.id} className="h-auto min-h-11 whitespace-normal">
              {submitting && value === option.id && <Spinner aria-hidden="true" />}
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      {onCancel && (
        <CardFooter>
          <Button variant="ghost" disabled={submitting} onClick={onCancel}>
            Cancel
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
