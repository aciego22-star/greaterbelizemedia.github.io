import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import type { RefObject } from 'preact';
import { BRANCH_BY_ID, type BranchId } from '../data/branches';
import { iconSvg, type IconName } from '../lib/icons';
import { LANG_EVENT, OPEN_GUIDE, TOAST, flushUiQueue, type ToastAction } from '../lib/site-state';
import type { GuideEngine, GuideReply, GuideState, Lang } from '../lib/guide/types';
import { CHATBASE_AGENT_ID, LIVE_AI_DISCLAIMER, loadChatbase } from '../lib/guide/chatbase-adapter';

const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => (
  <span class="i" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }} />
);


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
  action?: ToastAction;
}

export default function GlobalUI() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [guidePrompt, setGuidePrompt] = useState<{ text: string; n: number } | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number>(0);

  useEffect(() => {
    const onOpenGuide = (e: Event) => {
      const p = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      setToast(null);
      setGuideOpen(true);
      if (p) setGuidePrompt({ text: p, n: Date.now() });
    };
    const onToast = (e: Event) => {
      const d = (e as CustomEvent<{ message: string; action?: ToastAction }>).detail;
      window.clearTimeout(toastTimer.current);
      setToast({ id: Date.now(), message: d.message, action: d.action });
      toastTimer.current = window.setTimeout(() => setToast(null), 4200);
    };
    window.addEventListener(OPEN_GUIDE, onOpenGuide);
    window.addEventListener(TOAST, onToast);
    document.documentElement.classList.add('ui-ready');
    flushUiQueue();
    return () => {
      window.removeEventListener(OPEN_GUIDE, onOpenGuide);
      window.removeEventListener(TOAST, onToast);
    };
  }, []);

  return (
    <>
      <GuidePanel open={guideOpen} onClose={() => setGuideOpen(false)} prompt={guidePrompt} />
      {!guideOpen && (
        <button type="button" class="guide-launcher" onClick={() => setGuideOpen(true)} aria-haspopup="dialog">
          <span class="guide-launcher__icon"><Icon name="guide" size={20} /></span>
          <span class="guide-launcher__text">
            <span class="guide-launcher__title">Product Guide</span>
            <span class="guide-launcher__sub">Ask a question</span>
          </span>
        </button>
      )}
      <div class="toast-region" role="status" aria-live="polite">
        {toast && (
          <div class="toast" key={toast.id}>
            <Icon name="check" size={16} />
            <span>{toast.message}</span>
            {toast.action === 'open-cart' && (
              <a class="toast__action" href="/cart/">
                View cart
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- Product Guide panel ---------------- */
interface Msg {
  id: number;
  from: 'user' | 'guide' | 'note';
  text: string;
  reply?: GuideReply;
}

function GuidePanel({ open, onClose, prompt }: { open: boolean; onClose: () => void; prompt: { text: string; n: number } | null }) {
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
      const { reply, state: next } = engine.reply(t, state);
      setState(next);
      setMsgs((m) => [...m, { id: counter.current++, from: 'user', text: t }, { id: counter.current++, from: 'guide', text: '', reply }]);
      setInput('');
    },
    [engine, state],
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

  // The Guide answers in the site's language and follows the header switch.
  useEffect(() => {
    const onLang = (e: Event) => {
      const lang = (e as CustomEvent<Lang>).detail;
      if (!engine || !state || state.lang === lang) return;
      const s = { ...state, lang };
      setState(s);
      setMsgs((m) => [...m, { id: counter.current++, from: 'guide', text: '', reply: engine.welcome(s) }]);
    };
    window.addEventListener(LANG_EVENT, onLang);
    return () => window.removeEventListener(LANG_EVENT, onLang);
  }, [engine, state]);

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
        ref={ref}
        hidden={!open}
      >
        <header class="guide__head">
          <div class="guide__id">
            <span class="guide__avatar" aria-hidden="true"><Icon name="guide" size={20} /></span>
            <div>
              <h2 id="guide-title" class="guide__title">Product Guide</h2>
              <p class="guide__sub">{mode === 'live' ? 'Live AI test (Chatbase)' : 'Products, branches and services'}</p>
            </div>
          </div>
          <div class="guide__tools">
            <button type="button" class="icon-btn" onClick={onClose} aria-label="Close Product Guide">
              <Icon name="x" />
            </button>
          </div>
        </header>

        {mode === 'live' ? (
          <div class="guide__live">
            <p class="notice"><Icon name="info" /><span>{LIVE_AI_DISCLAIMER}</span></p>
            <p>{liveStatus === 'loading' ? 'Loading the test widget…' : liveStatus === 'error' ? 'The live test widget could not load.' : 'The Chatbase test widget is open in its own bubble.'}</p>
            <button type="button" class="btn btn--ghost" onClick={() => setMode('local')}>Back to the Product Guide</button>
          </div>
        ) : (
          <>
            <div class="guide__msgs" ref={listRef} aria-live="polite" aria-relevant="additions">
              {!engine && <p class="guide__loading">Loading guide…</p>}
              {msgs.map((m) =>
                m.from === 'user' ? (
                  <div class="msg msg--user" key={m.id} data-i18n-skip>
                    <p>{m.text}</p>
                  </div>
                ) : m.from === 'note' ? (
                  <p class="msg msg--note" key={m.id}>{m.text}</p>
                ) : (
                  <div class="msg msg--guide" key={m.id}>
                    <div class="msg__text" data-i18n-skip>
                      <Rich text={m.reply!.text} />
                    </div>
                    {m.reply!.branches?.map((id) => <MiniBranch id={id} />)}
                    {!!m.reply!.links?.length && (
                      <div class="msg__actions">
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
                {/* Chips come from the Guide in the chosen language. */}
                {msgs[msgs.length - 1].reply!.chips!.map((c) => (
                  <button type="button" class="guide__chip" onClick={() => send(c)} data-i18n-skip>
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
                onKeyDown={(e) => {
                  // Handled here rather than by form submission, which sandboxed preview frames block.
                  if (e.key === 'Enter' && !e.isComposing) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                data-autofocus
              />
              <button
                type="button"
                class="guide__send"
                aria-label="Send"
                disabled={!input.trim() || !engine}
                onClick={() => {
                  send(input);
                  inputRef.current?.focus();
                }}
              >
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


