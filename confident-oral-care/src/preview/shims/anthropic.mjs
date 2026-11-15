// Browser stand-in for @anthropic-ai/sdk (single-file preview only: it runs the demo assistant, never Claude).
export default class Anthropic {
  constructor() { throw new Error('The Claude API is not available in the preview file'); }
}
Anthropic.APIError = class APIError extends Error {};
Anthropic.RateLimitError = class RateLimitError extends Anthropic.APIError {};
