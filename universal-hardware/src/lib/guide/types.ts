/**
 * Product Guide integration contract.
 *
 * The site ships with `LocalGuideEngine` — deterministic rules over the
 * site's own product and branch data. A production "AI Employee" (e.g. a
 * hosted agent or a secured backend that routes enquiries to staff)
 * implements the same interface, so the panel UI does not change. Nothing in
 * the local engine performs network I/O.
 */
export type Lang = 'en' | 'es';

export interface GuideLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface GuideReply {
  /** Plain text. Blank lines separate paragraphs; lines starting with "• " render as bullets; **bold** supported. */
  text: string;
  links?: GuideLink[];
  /** Branch details card to render under the message. */
  branches?: ('spanish-lookout' | 'belize-city')[];
  /** Suggested quick replies. */
  chips?: string[];
}

export interface GuideState {
  topic?: string;
  slots: Record<string, string>;
  lang: Lang;
  turns: number;
}

export interface GuideEngine {
  id: string;
  /** Shown in the panel header so visitors know what they are talking to. */
  label: string;
  description: string;
  initialState(lang: Lang): GuideState;
  welcome(state: GuideState): GuideReply;
  reply(input: string, state: GuideState): { reply: GuideReply; state: GuideState };
}
