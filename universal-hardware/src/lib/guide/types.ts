/**
 * Product Guide integration contract.
 *
 * The concept ships with `LocalGuideEngine` — deterministic rules over public
 * website information. A production "AI Employee" (e.g. an Austere-hosted
 * Chatbase agent or a secured backend) implements the same interface, so the
 * panel UI does not change. Nothing in the local engine performs network I/O.
 */
export type Lang = 'en' | 'es';

export type GuideAction =
  | { type: 'add-enquiry'; slug: string; context?: string; label: string }
  | { type: 'open-enquiry'; label: string }
  | { type: 'copy-summary'; label: string };

export interface GuideLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface GuideReply {
  /** Plain text. Blank lines separate paragraphs; lines starting with "• " render as bullets; **bold** supported. */
  text: string;
  links?: GuideLink[];
  actions?: GuideAction[];
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
  reply(input: string, state: GuideState, context: { enquiryCount: number }): { reply: GuideReply; state: GuideState };
}
