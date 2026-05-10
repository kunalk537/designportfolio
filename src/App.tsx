import {
  Suspense,
  lazy,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { profile } from './content/profile'
import { projects, type MediaInput } from './content/projects'
import type { LightboxState, MediaItem } from './ui/types'

// Code-split the lightbox: it only mounts after a click, so users who don't
// open it never download its JS.
const Lightbox = lazy(() => import('./ui/Lightbox'))

const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogg|ogv)(\?.*)?$/i

function detectMediaType(src: string): 'image' | 'video' {
  return VIDEO_RE.test(src) ? 'video' : 'image'
}

function normalizeMedia(input: readonly MediaInput[] | undefined): MediaItem[] {
  if (!input) return []
  return input.map((it) => {
    if (typeof it === 'string') {
      return { src: it, type: detectMediaType(it) }
    }
    return {
      src: it.src,
      type: it.type ?? detectMediaType(it.src),
      caption: it.caption,
      poster: it.poster,
      alt: it.alt,
    }
  })
}

/* -------------------------------------------------------------------------- */
/*  useReveal — fade/slide elements in when they enter view                   */
/* -------------------------------------------------------------------------- */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      node.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return ref
}

/* -------------------------------------------------------------------------- */
/*  useTypewriter — types out text one character at a time                    */
/* -------------------------------------------------------------------------- */
function useTypewriter(
  text: string,
  { speed = 18, startDelay = 350 }: { speed?: number; startDelay?: number } = {},
) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    let nextTimer: number | undefined

    const tick = () => {
      i += 1
      setShown(text.slice(0, i))
      if (i < text.length) {
        nextTimer = window.setTimeout(tick, speed)
      } else {
        setDone(true)
      }
    }

    setShown('')
    setDone(false)
    const startTimer = window.setTimeout(tick, startDelay)

    return () => {
      window.clearTimeout(startTimer)
      if (nextTimer) window.clearTimeout(nextTimer)
    }
  }, [text, speed, startDelay])

  return { shown, done }
}

/* -------------------------------------------------------------------------- */
/*  MediaSlot — single image or video tile                                    */
/* -------------------------------------------------------------------------- */
const MediaSlot = memo(function MediaSlot({
  item,
  index,
  items,
  fallbackAlt,
  eager = false,
  onOpen,
}: {
  item: MediaItem
  index: number
  items: MediaItem[]
  fallbackAlt: string
  eager?: boolean
  onOpen: (state: NonNullable<LightboxState>) => void
}) {
  const alt = item.alt ?? fallbackAlt
  const isVideo = item.type === 'video'
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const handleZoom = () => {
    if (videoRef.current) videoRef.current.pause()
    onOpen({ items, index })
  }

  const className = [
    'card-image-frame',
    isVideo ? 'card-image-frame--video' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      {isVideo ? (
        // preload="metadata" so the browser pulls just enough (typically a few
        // hundred KB out of the full file) to show a first-frame preview and
        // duration. The full video still doesn't download until the user
        // clicks play.
        <video
          ref={videoRef}
          className="card-video"
          src={item.src}
          poster={item.poster}
          controls
          preload="metadata"
          playsInline
          aria-label={alt}
        />
      ) : (
        <img
          src={item.src}
          alt={alt}
          decoding="async"
          loading={eager ? 'eager' : 'lazy'}
          {...(eager
            ? ({ fetchpriority: 'high' } as Record<string, string>)
            : {})}
        />
      )}
      <button
        type="button"
        className="card-image-frame__zoom"
        onClick={handleZoom}
        aria-label={`Look closer at ${alt}`}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 9V3h6" />
          <path d="M21 9V3h-6" />
          <path d="M3 15v6h6" />
          <path d="M21 15v6h-6" />
        </svg>
        <span>Look closer</span>
      </button>
    </div>
  )
})

const MediaPlaceholder = memo(function MediaPlaceholder() {
  return (
    <div className="card-image-frame card-image-frame--placeholder">
      <div className="card-image-placeholder" aria-hidden>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span>Figure</span>
      </div>
    </div>
  )
})

/* -------------------------------------------------------------------------- */
/*  MediaGallery — full-width stack; scrollable when >2 items                 */
/* -------------------------------------------------------------------------- */
const MediaGallery = memo(function MediaGallery({
  items,
  fallbackAltBase,
  projectTitle,
  eager = false,
  onOpen,
}: {
  items: MediaItem[]
  fallbackAltBase: string
  projectTitle: string
  eager?: boolean
  onOpen: (state: NonNullable<LightboxState>) => void
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const isScrollable = items.length > 2
  const [moreAvailable, setMoreAvailable] = useState(false)

  useEffect(() => {
    if (!isScrollable) {
      setMoreAvailable(false)
      return
    }
    const el = scrollRef.current
    if (!el) return

    const update = () => {
      const remaining = el.scrollHeight - el.clientHeight - el.scrollTop
      setMoreAvailable(remaining > 8)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(update)
        : null
    ro?.observe(el)
    window.addEventListener('resize', update)

    return () => {
      el.removeEventListener('scroll', update)
      ro?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [isScrollable, items.length])

  if (items.length === 0) {
    return (
      <div className="project-card__media-stack">
        <MediaPlaceholder />
        <MediaPlaceholder />
      </div>
    )
  }

  const handleOpen = (state: NonNullable<LightboxState>) =>
    onOpen({ ...state, projectTitle })

  const slots = items.map((it, i) => (
    <MediaSlot
      key={`media-${i}-${it.src}`}
      item={it}
      index={i}
      items={items}
      fallbackAlt={`${fallbackAltBase} — figure ${i + 1}`}
      eager={eager && i === 0 && it.type === 'image'}
      onOpen={handleOpen}
    />
  ))

  if (!isScrollable) {
    return <div className="project-card__media-stack">{slots}</div>
  }

  const scrollMore = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({
      top: Math.round(el.clientHeight * 0.7),
      behavior: 'smooth',
    })
  }

  return (
    <div className="project-card__media-stack-wrap">
      <div className="project-card__media-frame">
        <div
          ref={scrollRef}
          className={`project-card__media-stack project-card__media-stack--scrollable${
            moreAvailable ? '' : ' is-end'
          }`}
        >
          {slots}
        </div>

        <button
          type="button"
          onClick={scrollMore}
          className={`media-scroll-hint${
            moreAvailable ? '' : ' media-scroll-hint--hidden'
          }`}
          aria-label="Scroll to see more media"
          tabIndex={moreAvailable ? 0 : -1}
        >
          <span>Scroll for more</span>
          <svg
            className="media-scroll-hint__arrow"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  )
})

/* -------------------------------------------------------------------------- */
/*  Nav — bigger, links only                                                  */
/* -------------------------------------------------------------------------- */
const NavLink = memo(function NavLink({
  href,
  children,
  external,
  cta,
}: {
  href: string
  children: ReactNode
  external?: boolean
  cta?: boolean
}) {
  return (
    <a
      className={
        cta ? 'nav-bubble__link nav-bubble__link--cta' : 'nav-bubble__link'
      }
      href={href}
      {...(external ? ({ target: '_blank', rel: 'noreferrer' } as const) : {})}
    >
      {children}
    </a>
  )
})

const Nav = memo(function Nav() {
  const { links } = profile
  return (
    <div className="nav-bubble-wrap">
      <nav className="nav-bubble" aria-label="Primary">
        {links.linkedin ? (
          <NavLink href={links.linkedin} external>
            LinkedIn
          </NavLink>
        ) : null}
        {links.github ? (
          <NavLink href={links.github} external>
            GitHub
          </NavLink>
        ) : null}
        {links.resume ? (
          <NavLink href={links.resume} external>
            Resume
          </NavLink>
        ) : null}
        <NavLink href={links.emailHref} cta>
          Contact
        </NavLink>
      </nav>
    </div>
  )
})

/* -------------------------------------------------------------------------- */
/*  Aside cards: Education + Availability                                     */
/* -------------------------------------------------------------------------- */
const EducationCard = memo(function EducationCard() {
  const { education } = profile
  return (
    <div className="aside-card">
      <span className="aside-card__label">Education</span>
      <div className="education__row">
        <span className="education__school">{education.school}</span>
        <span className="education__period">{education.period}</span>
      </div>
      <div className="education__degree">{education.degree}</div>
      {education.detail ? (
        <div className="education__detail">{education.detail}</div>
      ) : null}
    </div>
  )
})

const AvailabilityCard = memo(function AvailabilityCard() {
  const { availability } = profile
  return (
    <div className="aside-card">
      <span className="aside-card__label aside-card__label--live">
        Availability
      </span>
      <div className="availability__status">{availability.status}</div>
      <p className="availability__detail">{availability.detail}</p>
    </div>
  )
})

/*
function CurrentExperienceCard() {
  const { currentExperience } = profile
  return (
    <div className="aside-card">
      <span className="aside-card__label aside-card__label--live">
        Current
      </span>
      <div className="current__role">{currentExperience.role}</div>
      <div className="current__org-row">
        <span className="current__org">{currentExperience.org}</span>
        <span className="current__period">{currentExperience.period}</span>
      </div>
      <p className="current__summary">{currentExperience.summary}</p>
      {currentExperience.tags?.length ? (
        <div className="current__tags">
          {currentExperience.tags.map((t) => (
            <span key={t} className="tag-mini">
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
*/
/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */
function Hero({ onCopyEmail }: { onCopyEmail: () => void | Promise<void> }) {
  const { name, intro, focus, headline, links } = profile
  const ref = useReveal<HTMLDivElement>()
  const { shown, done } = useTypewriter(intro, { speed: 16, startDelay: 320 })

  const [first, ...rest] = name.split(' ')
  const last = rest.join(' ')

  return (
    <section ref={ref} className="hero reveal">
      <div className="hero__main">
        <span className="hero__eyebrow">
          Available for opportunities · {headline}
        </span>

        <h1 className="hero__name">
          {first}
          {last ? (
            <>
              {' '}
              <span className="hero__name-italic">{last}</span>
            </>
          ) : null}
        </h1>

        <p className="hero__intro" aria-label={intro}>
          <span aria-hidden>{shown}</span>
          {!done ? (
            <span className="hero__intro-cursor" aria-hidden />
          ) : null}
        </p>

        <div className="hero__focus">
          {focus.map((f) => (
            <span key={f} className="focus-chip">
              {f}
            </span>
          ))}
        </div>

        <div className="hero__cta-row">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void onCopyEmail()}
          >
            Get in touch
            <span className="btn__arrow" aria-hidden>
              →
            </span>
          </button>
          {links.resume ? (
            <a
              className="btn btn--ghost"
              href={links.resume}
              target="_blank"
              rel="noreferrer"
            >
              View resume
            </a>
          ) : null}
        </div>
      </div>

      <aside className="hero__aside">
        <EducationCard />
        <AvailabilityCard />
      </aside>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Project card                                                              */
/* -------------------------------------------------------------------------- */
const ProjectCard = memo(function ProjectCard({
  index,
  total,
  project,
  onOpenMedia,
  onCopyEmail,
}: {
  index: number
  total: number
  project: (typeof projects)[number]
  onOpenMedia: (state: NonNullable<LightboxState>) => void
  onCopyEmail: () => void | Promise<void>
}) {
  const ref = useReveal<HTMLDivElement>()
  const numLabel = String(index + 1).padStart(2, '0')
  const totalLabel = String(total).padStart(2, '0')
  const items = useMemo(() => normalizeMedia(project.media), [project.media])

  return (
    <div ref={ref} className="reveal">
      <article
        className="project-card"
        data-i={index}
        aria-labelledby={`project-${project.id}-title`}
      >
        <span className="project-card__tape" aria-hidden />
        <span className="project-card__index">
          {numLabel} / {totalLabel}
        </span>

        <div className="project-card__grid">
          <div className="project-card__media">
            <MediaGallery
              items={items}
              fallbackAltBase={project.title}
              projectTitle={project.title}
              eager={index === 0}
              onOpen={onOpenMedia}
            />
          </div>

          <div className="project-card__content">
            <h3
              id={`project-${project.id}-title`}
              className="project-card__title"
            >
              {project.title}
            </h3>
            <p className="project-card__summary">{project.summary}</p>

            {project.tags.length ? (
              <div className="project-card__tags">
                {project.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="project-card__body">
              {project.paragraphs.map((p, i) => (
                <p key={`${project.id}-${i}`}>{p}</p>
              ))}
            </div>

            <div className="project-card__footer">
              <span className="project-card__meta">Project {numLabel}</span>
              <button
                type="button"
                className="project-card__cta"
                onClick={() => void onCopyEmail()}
              >
                Email me about this
                <span className="project-card__cta-arrow" aria-hidden>
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
})

/* -------------------------------------------------------------------------- */
/*  App                                                                       */
/* -------------------------------------------------------------------------- */
export default function App() {
  const [lightbox, setLightbox] = useState<LightboxState>(null)
  const [copyToast, setCopyToast] = useState<string | null>(null)

  useEffect(() => {
    if (!copyToast) return
    const id = window.setTimeout(() => setCopyToast(null), 4200)
    return () => window.clearTimeout(id)
  }, [copyToast])

  const copyEmailToClipboard = useCallback(async () => {
    const email = profile.links.email
    try {
      await navigator.clipboard.writeText(email)
      setCopyToast(`${email} copied to clipboard.`)
    } catch {
      setCopyToast(`Couldn't copy — ${email}`)
    }
  }, [])

  const closeLightbox = useCallback(() => setLightbox(null), [])
  const openLightbox = useCallback(
    (state: NonNullable<LightboxState>) => setLightbox(state),
    [],
  )
  const goPrev = useCallback(() => {
    setLightbox((s) => {
      if (!s) return s
      if (s.index <= 0) return s
      return { ...s, index: s.index - 1 }
    })
  }, [])
  const goNext = useCallback(() => {
    setLightbox((s) => {
      if (!s) return s
      if (s.index >= s.items.length - 1) return s
      return { ...s, index: s.index + 1 }
    })
  }, [])

  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <>
      {copyToast ? (
        <div className="copy-toast" role="status" aria-live="polite">
          {copyToast}
        </div>
      ) : null}

      <div className="paper-bg" aria-hidden />

      <div className="app-above-paper">
        <div className="app-above-paper__inner">
          <Nav />

          <main id="top">
            <Hero onCopyEmail={copyEmailToClipboard} />

            <header className="section-heading">
              <h2 className="section-heading__title">Selected work</h2>
              <span className="section-heading__count">
                {String(projects.length).padStart(2, '0')} entries
              </span>
            </header>

            <ul className="project-list">
              {projects.map((project, i) => (
                <li key={project.id}>
                  <ProjectCard
                    index={i}
                    total={projects.length}
                    project={project}
                    onOpenMedia={openLightbox}
                    onCopyEmail={copyEmailToClipboard}
                  />
                </li>
              ))}
            </ul>
          </main>

          <footer className="site-footer">
            <span>
              © {year} {profile.name}
            </span>
            <a href={profile.links.emailHref}>{profile.links.email}</a>
          </footer>
        </div>
      </div>

      <Suspense fallback={null}>
        <Lightbox
          state={lightbox}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      </Suspense>
    </>
  )
}
