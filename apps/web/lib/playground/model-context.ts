// Verified against https://developers.openai.com/api/docs/models/gpt-6-luna
// Keep capacities tied to exact model IDs; unknown models need an explicit override.
const contextWindows = new Map([['gpt-6-luna', 1_050_000]])

export function modelContextWindow(model: string, override?: string) {
  const configured = Number(override)
  return Number.isSafeInteger(configured) && configured > 0 ? configured : contextWindows.get(model)
}
