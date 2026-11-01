/**
 * Universal AI (assistant) integration contract.
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
  /** Picture cards shown under the message: Shop products (with Add to cart), categories, brands, listed models, events. */
  cards?: GuideCard[];
  /** Cart changes the panel carries out when this reply arrives (the customer asked for them). */
  actions?: GuideAction[];
  /** Offer a WhatsApp handoff to a branch, with the conversation summarised in the message. */
  handoff?: 'sales' | 'service';
}

export type GuideCard =
  | { kind: 'product'; id: string }
  | { kind: 'category'; slug: string }
  | { kind: 'brand'; id: string }
  | { kind: 'listed'; model: string }
  | { kind: 'event'; id: string };

export type GuideAction =
  | { type: 'add'; id: string; qty: number; colour?: string }
  | { type: 'request'; text: string; qty: number };

/** What the page tells the engine about the visitor's session (never sent anywhere). */
export interface GuideContext {
  cart?: { kind?: 'request'; id?: string; text?: string; colour?: string; qty: number }[];
  /** For tests: the time to use for "open now". */
  now?: Date;
}

export interface GuideState {
  topic?: string;
  slots: Record<string, string>;
  /** Shop product ids shown in the last reply, so "add it" or "the second one" can refer to them. */
  lastShown?: string[];
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
  reply(input: string, state: GuideState, ctx?: GuideContext): { reply: GuideReply; state: GuideState };
}
