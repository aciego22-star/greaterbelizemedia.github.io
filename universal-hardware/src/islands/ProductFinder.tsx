import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { FINDER_PATHS, FINDER_BY_ID, type Answers } from '../lib/finder-rules';
import { CATEGORY_BY_SLUG } from '../data/categories';
import { BRANCH_BY_ID, type BranchId } from '../data/branches';
import { artSvg } from '../lib/category-art';
import { iconSvg } from '../lib/icons';
import {
  addCategory,
  getBranch,
  hasCategory,
  openEnquiry,
  openGuide,
  removeCategory,
  setBranch,
  subscribe,
  subscribeBranch,
  toast,
} from '../lib/enquiry-store';

const Icon = ({ name, size = 18 }: { name: Parameters<typeof iconSvg>[0]; size?: number }) => (
  <span class="i" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }} />
);

interface Props {
  /** Render variant: embedded on the homepage (dark) or full page (light). */
  variant?: 'dark' | 'light';
  /** Heading level of the finder's step titles, to keep the page outline valid. */
  headingLevel?: 2 | 3;
}

export default function ProductFinder({ variant = 'dark', headingLevel = 3 }: Props) {
  const Hq = (headingLevel === 2 ? 'h2' : 'h3') as 'h2';
  const Hm = (headingLevel === 2 ? 'h3' : 'h4') as 'h3';
  const [pathId, setPathId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0); // 0 = choose path; 1..n questions; n+1 results
  const [, force] = useState(0);
  const [branch, setBranchState] = useState<BranchId | ''>('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const path = pathId ? FINDER_BY_ID[pathId] : null;
  const total = path ? path.questions.length : 0;
  const atResults = !!path && step > total;
  const result = useMemo(() => (path && atResults ? path.resolve(answers) : null), [path, atResults, answers]);

  useEffect(() => {
    setBranchState(getBranch());
    const u1 = subscribe(() => force((n) => n + 1));
    const u2 = subscribeBranch((id) => setBranchState(id));
    // Deep link support: /find/?need=backup-power
    const need = new URLSearchParams(location.search).get('need');
    if (need && FINDER_BY_ID[need]) {
      setPathId(need);
      setStep(1);
    }
    return () => {
      u1();
      u2();
    };
  }, []);

  // Move focus to the new step heading for keyboard and screen-reader users.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const r = rootRef.current?.getBoundingClientRect();
    if (r && (r.top < 0 || r.top > window.innerHeight * 0.5)) {
      rootRef.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  }, [step, pathId]);

  const choosePath = (id: string) => {
    setPathId(id);
    setAnswers({});
    setStep(1);
  };
  const answer = (qid: string, oid: string) => {
    const next = { ...answers, [qid]: oid };
    setAnswers(next);
    if (path && qid === 'branch' && (oid === 'spanish-lookout' || oid === 'belize-city')) setBranch(oid);
    setStep((s) => s + 1);
  };
  const back = () => {
    if (step <= 1) {
      setPathId(null);
      setStep(0);
      setAnswers({});
    } else setStep((s) => s - 1);
  };
  const reset = () => {
    setPathId(null);
    setStep(0);
    setAnswers({});
  };

  const progress = path ? Math.min(step, total + 1) / (total + 1) : 0;
  const q = path && step >= 1 && step <= total ? path.questions[step - 1] : null;

  return (
    <div class={`finder finder--${variant}`} ref={rootRef}>
      <div class="finder__bar">
        <div class="finder__steps" aria-hidden="true">
          <span class={`finder__step ${step === 0 ? 'is-current' : 'is-done'}`}>Need</span>
          {path?.questions.map((qq, i) => (
            <span class={`finder__step ${step === i + 1 ? 'is-current' : step > i + 1 ? 'is-done' : ''}`}>{`Q${i + 1}`}</span>
          ))}
          {!path && (
            <>
              <span class="finder__step">Q1</span>
              <span class="finder__step">Q2</span>
              <span class="finder__step">Q3</span>
            </>
          )}
          <span class={`finder__step ${atResults ? 'is-current' : ''}`}>Matches</span>
        </div>
        <div class="finder__progress" role="progressbar" aria-label="Finder progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      <div class="finder__body" aria-live="polite">
        {step === 0 && (
          <div class="finder__panel" key="choose">
            <Hq class="finder__q" tabIndex={-1} ref={headingRef}>What are you working on?</Hq>
            <ul class="finder__paths">
              {FINDER_PATHS.map((p, i) => (
                <li style={{ '--i': i } as Record<string, number>}>
                  <button type="button" class="finder__path" onClick={() => choosePath(p.id)}>
                    <span class="finder__path-art" dangerouslySetInnerHTML={{ __html: artSvg(p.art, { cls: variant === 'dark' ? 'cat-art--dark' : '' }) }} />
                    <span class="finder__path-label">{p.label}</span>
                    <span class="finder__path-blurb">{p.blurb}</span>
                    <span class="finder__path-go"><Icon name="arrow-right" size={16} /></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {q && path && (
          <div class="finder__panel" key={`${path.id}-${q.id}`}>
            <p class="finder__context mono">{path.label} · Question {step} of {total}</p>
            <Hq class="finder__q" tabIndex={-1} ref={headingRef} id={`fq-${q.id}`}>{q.prompt}</Hq>
            <div class="finder__options" role="group" aria-labelledby={`fq-${q.id}`}>
              {q.options.map((o, i) => (
                <button
                  type="button"
                  class="finder__option"
                  aria-pressed={answers[q.id] === o.id}
                  onClick={() => answer(q.id, o.id)}
                  style={{ '--i': i } as Record<string, number>}
                >
                  <span>{o.label}</span>
                  <Icon name="arrow-right" size={16} />
                </button>
              ))}
            </div>
            <div class="finder__nav">
              <button type="button" class="finder__link" onClick={back}>
                <Icon name="arrow-left" size={16} /> Back
              </button>
              <button type="button" class="finder__link" onClick={reset}>
                Start over
              </button>
            </div>
          </div>
        )}

        {result && path && (
          <div class="finder__panel finder__results" key="results">
            <div class="finder__results-head">
              <div>
                <p class="finder__context mono">Your matches · {path.label}</p>
                <Hq class="finder__q" tabIndex={-1} ref={headingRef}>{result.headline}</Hq>
                <ul class="finder__answers">
                  {path.questions.map((qq) => {
                    const o = qq.options.find((x) => x.id === answers[qq.id]);
                    return o ? <li>{o.label}</li> : null;
                  })}
                </ul>
              </div>
              <div class="finder__nav finder__nav--top">
                <button type="button" class="finder__link" onClick={back}>
                  <Icon name="arrow-left" size={16} /> Change answers
                </button>
                <button type="button" class="finder__link" onClick={reset}>
                  <Icon name="reset" size={16} /> Start over
                </button>
              </div>
            </div>

            <div class="finder__matches">
              {result.matches.map((m, i) => {
                const c = CATEGORY_BY_SLUG[m.slug];
                const added = hasCategory(m.slug);
                const brands = c.listedBrands;
                return (
                  <article class={`match ${i === 0 ? 'match--primary' : ''}`}>
                    <div class="match__art" dangerouslySetInnerHTML={{ __html: artSvg(c.illustration, { cls: variant === 'dark' && i !== 0 ? 'cat-art--dark' : '' }) }} />
                    <div class="match__body">
                      <p class="match__kicker mono">{i === 0 ? 'Best match' : 'Also relevant'}</p>
                      <Hm class="match__title">{c.name}</Hm>
                      <p class="match__reason">{m.reason}</p>
                      <p class="match__label">Ask about</p>
                      <ul class="match__focus">
                        {m.focus.map((f) => (
                          <li>{f}</li>
                        ))}
                      </ul>
                      {brands.length > 0 && (
                        <p class="match__brands">
                          Brands named on the website: <strong>{brands.join(', ')}</strong>
                        </p>
                      )}
                      <div class="match__actions">
                        <a class="btn btn--sm" href={`/products/${c.slug}/`}>
                          View category <Icon name="arrow-right" size={16} />
                        </a>
                        <button
                          type="button"
                          class={`btn btn--sm ${i === 0 ? 'btn--ghost' : 'btn--ghost'}`}
                          aria-pressed={added}
                          onClick={() => {
                            if (added) {
                              removeCategory(m.slug);
                              toast(`${c.name} removed from your Enquiry Summary`);
                            } else {
                              addCategory(m.slug, result.context);
                              toast(`${c.name} added to your Enquiry Summary`, 'open-enquiry');
                            }
                          }}
                        >
                          <Icon name={added ? 'check' : 'plus'} size={16} />
                          {added ? 'In Enquiry Summary' : 'Add to Enquiry Summary'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div class="finder__after">
              <div class="finder__tips">
                <Hm class="finder__h">Before you contact the branch</Hm>
                <ul>
                  {result.tips.map((t) => (
                    <li>
                      <Icon name="check" size={16} /> <span>{t}</span>
                    </li>
                  ))}
                </ul>
                {result.caution && (
                  <p class="finder__caution">
                    <Icon name="info" size={16} /> {result.caution}
                  </p>
                )}
              </div>
              <div class="finder__next">
                <Hm class="finder__h">Next step</Hm>
                <p class="finder__small">Preferred branch (this session only)</p>
                <div class="finder__branches" role="group" aria-label="Preferred branch">
                  {(['spanish-lookout', 'belize-city'] as BranchId[]).map((id) => (
                    <button type="button" class="chip" aria-pressed={branch === id} onClick={() => setBranch(branch === id ? '' : id)}>
                      {BRANCH_BY_ID[id].name}
                    </button>
                  ))}
                </div>
                {branch && (
                  <p class="finder__small">
                    {BRANCH_BY_ID[branch].name} sales WhatsApp listed on the website:{' '}
                    <a href={`https://wa.me/${BRANCH_BY_ID[branch].whatsapp[0].wa}`} target="_blank" rel="noopener">
                      {BRANCH_BY_ID[branch].whatsapp[0].display}
                    </a>
                    {answers.need === 'service' && (
                      <>
                        {' '}· Service Center:{' '}
                        <a href={`https://wa.me/${BRANCH_BY_ID[branch].whatsapp[1].wa}`} target="_blank" rel="noopener">
                          {BRANCH_BY_ID[branch].whatsapp[1].display}
                        </a>
                      </>
                    )}
                  </p>
                )}
                <div class="finder__next-actions">
                  <button
                    type="button"
                    class="btn"
                    onClick={() => {
                      for (const m of result.matches.slice(0, 1)) if (!hasCategory(m.slug)) addCategory(m.slug, result.context);
                      openEnquiry();
                    }}
                  >
                    <Icon name="clipboard" size={18} /> Build an Enquiry Summary
                  </button>
                  <button type="button" class="btn btn--ghost" onClick={() => openGuide(result.guidePrompt)}>
                    <Icon name="guide" size={18} /> Ask the Product Guide
                  </button>
                </div>
              </div>
            </div>
            <p class="finder__disclaimer">
              Matches use the categories listed on Universal Hardware's public website, not live stock. Confirm availability,
              pricing and suitability with the branch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
