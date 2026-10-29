import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { RefObject } from 'preact';
import { CATEGORIES, CATEGORY_BY_SLUG } from '../data/categories';
import { BRANCHES, BRANCH_BY_ID, type BranchId } from '../data/branches';
import { iconSvg, type IconName } from '../lib/icons';
import {
  OPEN_ENQUIRY,
  OPEN_GUIDE,
  TOAST,
  addCategory,
  buildSummary,
  copyText,
  flushUiQueue,
  getDraft,
  removeCategory,
  resetDraft,
  setField,
  subscribe,
  type EnquiryDraft,
} from '../lib/enquiry-store';
import type { GuideEngine, GuideReply, GuideState, Lang } from '../lib/guide/types';
import { CHATBASE_AGENT_ID, LIVE_AI_DISCLAIMER, loadChatbase } from '../lib/guide/chatbase-adapter';

const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => (
  <span class="i" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }} />
);

const NOTHING_SENT = 'Concept demonstration only. Nothing has been sent or submitted.';
const USES = ['Home or household', 'Trade or contracting', 'Farm or ranch', 'Business or industrial', 'Personal transport'];

/* ---------------- helpers ---------------- */
function setBackgroundInert(on: boolean) {
  document.querySelectorAll<HTMLElement>('body > .utility, body > .site-header, body > main, body > .site-footer, body > .skip-link').forEach((el) => {
    if (on) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
  document.documentElement.classList.toggle('is-locked', on);
}

function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean, onEscape: () => void, trap = true) {
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')).filter(
        (x) => x.offsetParent !== null || x === document.activeElement,
      );
    const t = window.setTimeout(() => {
      const target = el.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0];
      target?.focus();
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!trap && !el.contains(document.activeElement)) return;
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key === 'Tab' && trap) {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [active, trap]);
}

function useMedia(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    setM(mq.matches);
    const h = () => setM(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [q]);
  return m;
}

/** Minimal safe rich text: paragraphs, "• " bullets and **bold**. */
function Rich({ text }: { text: string }) {
  const bold = (line: string) =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part) => (part.startsWith('**') && part.endsWith('**') ? <strong>{part.slice(2, -2)}</strong> : part));
  return (
    <>
      {text.split(/\n{2,}/).map((para) => {
        const lines = para.split('\n');
        const bullets = lines.filter((l) => l.startsWith('• '));
        if (bullets.length && bullets.length === lines.length) {
          return <ul>{lines.map((l) => <li>{bold(l.slice(2))}</li>)}</ul>;
        }
        if (bullets.length) {
          const head = lines.filter((l) => !l.startsWith('• '));
          return (
            <>
              <p>{head.map((l, i) => <>{i > 0 && <br />}{bold(l)}</>)}</p>
              <ul>{bullets.map((l) => <li>{bold(l.slice(2))}</li>)}</ul>
            </>
          );
        }
        return <p>{lines.map((l, i) => <>{i > 0 && <br />}{bold(l)}</>)}</p>;
      })}
    </>
  );
}

/* ---------------- Root ---------------- */
interface ToastState {
  id: number;
  message: string;
  action?: 'open-enquiry';
}

export default function GlobalUI() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guidePrompt, setGuidePrompt] = useState<{ text: string; n: number } | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [draft, setDraft] = useState<EnquiryDraft>(() => getDraft());
  const toastTimer = useRef<number>(0);

  useEffect(() => {
    const unsub = subscribe(setDraft);
    const onOpenEnq = () => {
      setToast(null);
      setGuideOpen(false);
      setEnquiryOpen(true);
    };
    const onOpenGuide = (e: Event) => {
      const p = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      setToast(null);
      setEnquiryOpen(false);
      setGuideOpen(true);
      if (p) setGuidePrompt({ text: p, n: Date.now() });
    };
    const onToast = (e: Event) => {
      const d = (e as CustomEvent<{ message: string; action?: 'open-enquiry' }>).detail;
      window.clearTimeout(toastTimer.current);
      setToast({ id: Date.now(), message: d.message, action: d.action });
      toastTimer.current = window.setTimeout(() => setToast(null), 4200);
    };
    window.addEventListener(OPEN_ENQUIRY, onOpenEnq);
    window.addEventListener(OPEN_GUIDE, onOpenGuide);
    window.addEventListener(TOAST, onToast);
    document.documentElement.classList.add('ui-ready');
    flushUiQueue();
    return () => {
      unsub();
      window.removeEventListener(OPEN_ENQUIRY, onOpenEnq);
      window.removeEventListener(OPEN_GUIDE, onOpenGuide);
      window.removeEventListener(TOAST, onToast);
    };
  }, []);

  return (
    <>
      <EnquiryDrawer open={enquiryOpen} onClose={() => setEnquiryOpen(false)} draft={draft} />
      <GuidePanel
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        prompt={guidePrompt}
        enquiryCount={draft.items.length}
        draft={draft}
      />
      {!guideOpen && (
        <button type="button" class="guide-launcher" onClick={() => setGuideOpen(true)} aria-haspopup="dialog">
          <span class="guide-launcher__icon"><Icon name="guide" size={20} /></span>
          <span class="guide-launcher__text">
            <span class="guide-launcher__title">Product Guide</span>
            <span class="guide-launcher__sub">Interactive concept</span>
          </span>
        </button>
      )}
      <div class="toast-region" role="status" aria-live="polite">
        {toast && (
          <div class="toast" key={toast.id}>
            <Icon name="check" size={16} />
            <span>{toast.message}</span>
            {toast.action === 'open-enquiry' && (
              <button
                type="button"
                class="toast__action"
                onClick={() => {
                  setToast(null);
                  setGuideOpen(false);
                  setEnquiryOpen(true);
                }}
              >
                View summary
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- Enquiry drawer ---------------- */
function EnquiryDrawer({ open, onClose, draft }: { open: boolean; onClose: () => void; draft: EnquiryDraft }) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [confirmReset, setConfirmReset] = useState(false);
  const [addSlug, setAddSlug] = useState('');
  const previewRef = useRef<HTMLTextAreaElement>(null);
  const summary = useMemo(() => buildSummary(draft), [draft]);
  useFocusTrap(ref, open, onClose);
  useEffect(() => {
    setBackgroundInert(open);
    if (!open) {
      setConfirmReset(false);
      setCopied('idle');
    }
  }, [open]);
  useEffect(() => {
    if (!confirmReset) return;
    const t = window.setTimeout(() => setConfirmReset(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirmReset]);

  const available = CATEGORIES.filter((c) => !draft.items.some((i) => i.slug === c.slug));

  const doCopy = async () => {
    const ok = await copyText(summary);
    setCopied(ok ? 'ok' : 'fail');
    if (!ok) {
      previewRef.current?.focus();
      previewRef.current?.select();
    }
    window.setTimeout(() => setCopied('idle'), 3500);
  };

  return (
    <div class="drawer-root" data-open={open ? '' : undefined}>
      <div class="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div class="drawer" role="dialog" aria-modal="true" aria-labelledby="enq-title" aria-describedby="enq-desc" ref={ref} hidden={!open}>
        <header class="drawer__head">
          <div>
            <p class="drawer__kicker mono">Demo only · stays in this browser</p>
            <h2 id="enq-title" class="drawer__title">Enquiry Summary</h2>
          </div>
          <button type="button" class="icon-btn" onClick={onClose} aria-label="Close enquiry summary" data-autofocus>
            <Icon name="x" />
          </button>
        </header>

        <div class="drawer__body">
          <p class="notice drawer__notice" id="enq-desc">
            <Icon name="info" />
            <span>
              <strong>{NOTHING_SENT}</strong> Build a summary of what you need, then copy it and send it to the branch yourself. No personal details are
              requested or stored.
            </span>
          </p>

          <section class="drawer__section" aria-labelledby="enq-cats">
            <h3 id="enq-cats" class="drawer__h">
              Categories <span class="drawer__count">{draft.items.length}</span>
            </h3>
            {draft.items.length === 0 ? (
              <div class="drawer__empty">
                <p>No categories yet. Add them from any category page, the product finder or the Product Guide.</p>
                <div class="drawer__empty-actions">
                  <a class="btn btn--sm" href="/products/">Explore Products</a>
                  <a class="btn btn--sm btn--ghost" href="/find/">Use the finder</a>
                </div>
              </div>
            ) : (
              <ul class="enq-items">
                {draft.items.map((i) => {
                  const c = CATEGORY_BY_SLUG[i.slug];
                  return (
                    <li class="enq-item">
                      <div>
                        <a href={`/products/${c.slug}/`} class="enq-item__name">{c.name}</a>
                        {i.context && <p class="enq-item__ctx">{i.context}</p>}
                      </div>
                      <button type="button" class="icon-btn enq-item__remove" onClick={() => removeCategory(i.slug)} aria-label={`Remove ${c.name}`}>
                        <Icon name="x" size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {available.length > 0 && (
              <form
                class="drawer__add"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (addSlug) addCategory(addSlug);
                  setAddSlug('');
                }}
              >
                <label class="sr-only" for="enq-add">Add a category</label>
                <select id="enq-add" class="select" value={addSlug} onChange={(e) => setAddSlug((e.target as HTMLSelectElement).value)}>
                  <option value="">Add a category…</option>
                  {available.map((c) => (
                    <option value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <button type="submit" class="btn btn--ghost" disabled={!addSlug}>
                  <Icon name="plus" size={16} /> Add
                </button>
              </form>
            )}
          </section>

          <section class="drawer__section">
            <div class="field">
              <label for="enq-use">Intended use</label>
              <select id="enq-use" class="select" value={USES.includes(draft.intendedUse) ? draft.intendedUse : ''} onChange={(e) => setField('intendedUse', (e.target as HTMLSelectElement).value)}>
                <option value="">Not specified</option>
                {USES.map((u) => (
                  <option value={u}>{u}</option>
                ))}
              </select>
            </div>
          </section>

          <section class="drawer__section">
            <fieldset class="enq-branch">
              <legend class="drawer__h">Preferred branch</legend>
              {BRANCHES.map((b) => (
                <label class="enq-radio">
                  <input type="radio" name="enq-branch" value={b.id} checked={draft.preferredBranch === b.id} onChange={() => setField('preferredBranch', b.id as BranchId)} />
                  <span>
                    <strong>{b.name}</strong>
                    <small>{b.addressLines[0]}</small>
                  </span>
                </label>
              ))}
              <label class="enq-radio">
                <input type="radio" name="enq-branch" value="" checked={!draft.preferredBranch} onChange={() => setField('preferredBranch', '')} />
                <span>
                  <strong>No preference</strong>
                </span>
              </label>
            </fieldset>
          </section>

          <section class="drawer__section">
            <div class="field">
              <label for="enq-notes">Notes about your project</label>
              <textarea
                id="enq-notes"
                class="textarea"
                maxLength={300}
                placeholder="e.g. Need to pump water from a 60 ft well to a raised tank."
                value={draft.notes}
                onInput={(e) => setField('notes', (e.target as HTMLTextAreaElement).value)}
              />
              <p class="hint">About the product only. Please don't enter names, phone numbers or other personal details.</p>
            </div>
          </section>

          <section class="drawer__section">
            <label class="drawer__h" for="enq-preview">Summary preview</label>
            <textarea id="enq-preview" class="enq-preview" readOnly value={summary} ref={previewRef} rows={10} />
          </section>
        </div>

        <footer class="drawer__foot">
          <p class="drawer__live" aria-live="polite">
            {copied === 'ok' ? 'Copied to your clipboard. Nothing was sent.' : copied === 'fail' ? 'Copy failed. The text is selected; copy it manually.' : ''}
          </p>
          <div class="drawer__actions">
            <button type="button" class="btn" onClick={doCopy}>
              <Icon name={copied === 'ok' ? 'check' : 'copy'} size={18} /> {copied === 'ok' ? 'Copied' : 'Copy summary'}
            </button>
            <button
              type="button"
              class={`btn btn--ghost ${confirmReset ? 'is-confirm' : ''}`}
              onClick={() => {
                if (confirmReset) {
                  resetDraft();
                  setConfirmReset(false);
                } else setConfirmReset(true);
              }}
            >
              <Icon name="reset" size={18} /> {confirmReset ? 'Tap again to reset' : 'Reset'}
            </button>
          </div>
          <p class="drawer__fine">
            Ready to talk to someone? Use the branch details on the <a href="/locations/">Locations page</a>, taken from Universal Hardware's official
            website.
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ---------------- Product Guide panel ---------------- */
interface Msg {
  id: number;
  from: 'user' | 'guide' | 'note';
  text: string;
  reply?: GuideReply;
}

function GuidePanel({
  open,
  onClose,
  prompt,
  enquiryCount,
  draft,
}: {
  open: boolean;
  onClose: () => void;
  prompt: { text: string; n: number } | null;
  enquiryCount: number;
  draft: EnquiryDraft;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobile = useMedia('(max-width: 640px)');
  const [engine, setEngine] = useState<GuideEngine | null>(null);
  const [state, setState] = useState<GuideState | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'local' | 'live'>('local');
  const [liveStatus, setLiveStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const counter = useRef(1);
  const pendingPrompt = useRef<string | null>(null);
  useFocusTrap(ref, open, onClose, mobile);

  useEffect(() => {
    if (mobile) setBackgroundInert(open);
    else if (!open) setBackgroundInert(false);
  }, [open, mobile]);

  // Lazy-load the rule engine the first time the panel opens.
  useEffect(() => {
    if (!open || engine) return;
    let cancelled = false;
    import('../lib/guide/local-engine').then(({ LocalGuideEngine }) => {
      if (cancelled) return;
      const lang: Lang = document.documentElement.lang === 'es' ? 'es' : 'en';
      const s = LocalGuideEngine.initialState(lang);
      setEngine(LocalGuideEngine);
      setState(s);
      setMsgs([{ id: counter.current++, from: 'guide', text: '', reply: LocalGuideEngine.welcome(s) }]);
    });
    return () => {
      cancelled = true;
    };
  }, [open, engine]);

  const send = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t || !engine || !state) return;
      const { reply, state: next } = engine.reply(t, state, { enquiryCount });
      setState(next);
      setMsgs((m) => [...m, { id: counter.current++, from: 'user', text: t }, { id: counter.current++, from: 'guide', text: '', reply }]);
      setInput('');
    },
    [engine, state, enquiryCount],
  );

  // Prompts handed over by other components (finder, category pages).
  useEffect(() => {
    if (prompt) pendingPrompt.current = prompt.text;
  }, [prompt?.n]);
  useEffect(() => {
    if (engine && state && pendingPrompt.current) {
      const p = pendingPrompt.current;
      pendingPrompt.current = null;
      send(p);
    }
  }, [engine, state, prompt?.n, send]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const last = el.querySelector<HTMLElement>('.msg:last-child');
    if (last && last.classList.contains('msg--guide') && el.children.length > 1) {
      el.scrollTo({ top: Math.max(0, last.offsetTop - 12), behavior: 'smooth' });
    } else el.scrollTo({ top: el.scrollHeight });
  }, [msgs.length]);

  const switchLang = (lang: Lang) => {
    if (!engine || !state || state.lang === lang) return;
    const s = { ...state, lang };
    setState(s);
    setMsgs((m) => [
      ...m,
      {
        id: counter.current++,
        from: 'note',
        text:
          lang === 'es'
            ? 'Respuestas en español para esta demostración. No implica que Universal Hardware ofrezca atención formal en español.'
            : 'Responses switched to English.',
      },
      { id: counter.current++, from: 'guide', text: '', reply: engine.welcome(s) },
    ]);
  };

  const runAction = async (a: NonNullable<GuideReply['actions']>[number]) => {
    if (a.type === 'add-enquiry') {
      addCategory(a.slug, a.context);
      setMsgs((m) => [...m, { id: counter.current++, from: 'note', text: `${CATEGORY_BY_SLUG[a.slug].name} added to your Enquiry Summary. Nothing has been sent.` }]);
    } else if (a.type === 'open-enquiry') {
      window.dispatchEvent(new CustomEvent(OPEN_ENQUIRY));
    } else if (a.type === 'copy-summary') {
      const ok = await copyText(buildSummary(draft));
      setMsgs((m) => [...m, { id: counter.current++, from: 'note', text: ok ? 'Summary copied to your clipboard. Nothing was sent.' : 'Copy failed. Open the Enquiry Summary to copy it manually.' }]);
    }
  };

  const goLive = async () => {
    if (!CHATBASE_AGENT_ID) return;
    setMode('live');
    setLiveStatus('loading');
    try {
      await loadChatbase(CHATBASE_AGENT_ID);
      setLiveStatus('ready');
    } catch {
      setLiveStatus('error');
    }
  };

  const lang = state?.lang ?? 'en';

  return (
    <div class="guide-root" data-open={open ? '' : undefined}>
      {mobile && <div class="drawer-backdrop" onClick={onClose} aria-hidden="true" />}
      <div
        class="guide"
        role="dialog"
        aria-modal={mobile ? 'true' : 'false'}
        aria-labelledby="guide-title"
        aria-describedby="guide-desc"
        ref={ref}
        hidden={!open}
      >
        <header class="guide__head">
          <div class="guide__id">
            <span class="guide__avatar" aria-hidden="true"><Icon name="guide" size={20} /></span>
            <div>
              <h2 id="guide-title" class="guide__title">Product Guide</h2>
              <p class="guide__sub">{mode === 'live' ? 'Live AI test (Chatbase)' : 'Interactive concept · rule-based, not live AI'}</p>
            </div>
          </div>
          <div class="guide__tools">
            <div class="guide__lang" role="group" aria-label="Guide language">
              <button type="button" aria-pressed={lang === 'en'} onClick={() => switchLang('en')}>EN</button>
              <button type="button" aria-pressed={lang === 'es'} onClick={() => switchLang('es')}>ES</button>
            </div>
            <button type="button" class="icon-btn" onClick={onClose} aria-label="Close Product Guide">
              <Icon name="x" />
            </button>
          </div>
        </header>
        <p class="guide__disclose" id="guide-desc">
          Independent Austere concept demo, not Universal Hardware's official customer service. Uses public website information only; nothing you type
          leaves this page.
        </p>

        {mode === 'live' ? (
          <div class="guide__live">
            <p class="notice"><Icon name="info" /><span>{LIVE_AI_DISCLAIMER}</span></p>
            <p>{liveStatus === 'loading' ? 'Loading the test widget…' : liveStatus === 'error' ? 'The live test widget could not load.' : 'The Chatbase test widget is open in its own bubble.'}</p>
            <button type="button" class="btn btn--ghost" onClick={() => setMode('local')}>Back to the concept guide</button>
          </div>
        ) : (
          <>
            <div class="guide__msgs" ref={listRef} aria-live="polite" aria-relevant="additions">
              {!engine && <p class="guide__loading">Loading guide…</p>}
              {msgs.map((m) =>
                m.from === 'user' ? (
                  <div class="msg msg--user" key={m.id}>
                    <p>{m.text}</p>
                  </div>
                ) : m.from === 'note' ? (
                  <p class="msg msg--note" key={m.id}>{m.text}</p>
                ) : (
                  <div class="msg msg--guide" key={m.id}>
                    <div class="msg__text">
                      <Rich text={m.reply!.text} />
                    </div>
                    {m.reply!.branches?.map((id) => <MiniBranch id={id} />)}
                    {(m.reply!.links?.length || m.reply!.actions?.length) && (
                      <div class="msg__actions">
                        {m.reply!.actions?.map((a) => (
                          <button type="button" class="msg__btn msg__btn--primary" onClick={() => runAction(a)}>
                            <Icon name={a.type === 'add-enquiry' ? 'plus' : a.type === 'copy-summary' ? 'copy' : 'clipboard'} size={15} /> {a.label}
                          </button>
                        ))}
                        {m.reply!.links?.map((l) => (
                          <a class="msg__btn" href={l.href} target={l.external ? '_blank' : undefined} rel={l.external ? 'noopener' : undefined}>
                            {l.label} <Icon name={l.external ? 'external' : 'arrow-right'} size={14} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
            {msgs.length > 0 && msgs[msgs.length - 1].reply?.chips && (
              <div class="guide__chips" role="group" aria-label="Suggested questions">
                {msgs[msgs.length - 1].reply!.chips!.map((c) => (
                  <button type="button" class="guide__chip" onClick={() => send(c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            <form
              class="guide__form"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
                inputRef.current?.focus();
              }}
            >
              <label for="guide-input" class="sr-only">Ask the Product Guide</label>
              <input
                id="guide-input"
                ref={inputRef}
                class="guide__input"
                type="text"
                autocomplete="off"
                maxLength={240}
                placeholder={lang === 'es' ? 'Escriba su pregunta…' : 'Ask about a product, job or branch…'}
                value={input}
                onInput={(e) => setInput((e.target as HTMLInputElement).value)}
                data-autofocus
              />
              <button type="submit" class="guide__send" aria-label="Send" disabled={!input.trim() || !engine}>
                <Icon name="send" size={18} />
              </button>
            </form>
            {CHATBASE_AGENT_ID && (
              <button type="button" class="guide__live-toggle" onClick={goLive}>
                Try the live AI test widget (Austere test agent)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MiniBranch({ id }: { id: BranchId }) {
  const b = BRANCH_BY_ID[id];
  return (
    <div class="mini-branch">
      <p class="mini-branch__name">{b.name}</p>
      <p class="mini-branch__addr">{b.addressLines.join(', ')}</p>
      <div class="mini-branch__links">
        <a href={`tel:${b.phones[0].e164}`}><Icon name="phone" size={14} /> {b.phones[0].display}</a>
        <a href={`https://wa.me/${b.whatsapp[0].wa}`} target="_blank" rel="noopener"><Icon name="whatsapp" size={14} /> Sales</a>
        <a href={`https://wa.me/${b.whatsapp[1].wa}`} target="_blank" rel="noopener"><Icon name="whatsapp" size={14} /> Service</a>
      </div>
    </div>
  );
}


