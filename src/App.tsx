import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { profile } from './content/profile'
import { projects, type MediaInput, type Project } from './content/projects'

function Handwriting({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        node.classList.add('is-written')
        observer.disconnect()
      }
    }, { threshold: 0.6 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <span ref={ref} className="handwriting" aria-label={children}>{children.split(/(\s+)/).map((word, wordIndex, words) => <span className="written-word" key={wordIndex} aria-hidden="true">{Array.from(word).map((letter, letterIndex) => <span className="written-letter" key={letterIndex} style={{ '--letter-delay': `${(words.slice(0, wordIndex).join('').length + letterIndex) * 38}ms` } as CSSProperties}>{letter}</span>)}</span>)}</span>
}

function normalize(item: MediaInput) {
  const media = typeof item === 'string' ? { src: item } : item
  return { ...media, video: media.type === 'video' || /\.(mp4|webm|mov|m4v|ogg|ogv)(\?.*)?$/i.test(media.src) }
}

function QuietVideo({ src, poster, label, active, onRatio }: { src: string; poster?: string; label: string; active: boolean; onRatio: (value: number) => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (active) video.play().catch(() => {})
    else video.pause()
  }, [active])
  return <button type="button" className={`quiet-video ${playing ? 'is-playing' : ''}`} aria-label={`${playing ? 'Pause' : 'Play'} ${label}`} onClick={() => {
    const video = ref.current
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }}>
    <video ref={ref} src={src} poster={poster} muted loop playsInline preload={active ? 'auto' : 'metadata'} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedMetadata={event => onRatio(event.currentTarget.videoWidth / event.currentTarget.videoHeight)} />
    <span className="video-toggle" aria-hidden="true">{playing ? 'Ⅱ pause' : '▶ play'}</span>
  </button>
}

function Carousel({ items, title, active }: { items: MediaInput[]; title: string; active: boolean }) {
  const [index, setIndex] = useState(0)
  const [ratios, setRatios] = useState<Record<string, number>>({})
  const [width, setWidth] = useState(400)
  const [zoomOpen, setZoomOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const previousOverflow = useRef('')
  const zoomOpener = useRef<HTMLElement | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  const media = normalize(items[index])
  const ratio = ratios[media.src] ?? 4 / 3
  const frameWidth = Math.min(width, 390 * ratio + 22)
  const frameHeight = (frameWidth - 22) / ratio
  const move = (direction: number) => setIndex(current => (current + direction + items.length) % items.length)
  const openZoom = () => {
    if (swiped.current) { swiped.current = false; return }
    zoomOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    container.current?.querySelectorAll('video').forEach(video => video.pause())
    previousOverflow.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setZoomOpen(true)
    dialog.current?.showModal()
  }
  const rememberRatio = (src: string, value: number) => {
    if (value > 0) setRatios(current => current[src] === value ? current : { ...current, [src]: value })
  }
  useEffect(() => {
    const node = container.current
    const zoomDialog = dialog.current
    if (!node) return
    const resize = new ResizeObserver(entries => setWidth(entries[0].contentRect.width))
    const preloaded: HTMLImageElement[] = []
    resize.observe(node)
    const preload = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      items.forEach(item => {
        const media = normalize(item)
        // A poster can have a different crop from its video. Video metadata
        // supplies the actual frame ratio instead.
        const src = media.video ? undefined : media.src
        if (!src) return
        const image = new Image()
        preloaded.push(image)
        image.onload = () => rememberRatio(media.src, image.naturalWidth / image.naturalHeight)
        image.src = src
      })
      preload.disconnect()
    }, { rootMargin: '400px' })
    preload.observe(node)
    return () => {
      resize.disconnect()
      preload.disconnect()
      preloaded.forEach(image => { image.onload = null })
      if (zoomDialog?.open) document.body.style.overflow = previousOverflow.current
    }
  }, [items])
  useEffect(() => {
    container.current?.querySelectorAll<HTMLVideoElement>('[aria-hidden="true"] video').forEach(video => video.pause())
  }, [index])

  const controls = (location: string): ReactNode => items.length > 1 && <div className="carousel-controls">
    <button type="button" onClick={() => move(-1)} aria-label={`Previous ${location} image for ${title}`}>←</button>
    <div className="carousel-dots">{items.map((_, dotIndex) => <button type="button" key={dotIndex} aria-label={`Show ${title} ${location} view ${dotIndex + 1}`} aria-pressed={index === dotIndex} onClick={() => setIndex(dotIndex)}><span aria-hidden="true" /></button>)}</div>
    <span className="carousel-counter" aria-live="polite" aria-atomic="true">{index + 1} / {items.length}</span>
    <button type="button" onClick={() => move(1)} aria-label={`Next ${location} image for ${title}`}>→</button>
  </div>

  return <div ref={container} className="carousel" role="region" aria-roledescription="carousel" aria-label={`${title} images`} tabIndex={items.length > 1 ? 0 : undefined}
    onKeyDown={event => {
      if (event.target !== event.currentTarget) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1) }
    }}
    onTouchStart={event => {
      swiped.current = false
      touchStart.current = (event.target as Element).closest('video, button:not(.zoom-trigger)') ? null : { x: event.touches[0].clientX, y: event.touches[0].clientY }
    }}
    onTouchEnd={event => {
      if (touchStart.current === null) return
      const difference = touchStart.current.x - event.changedTouches[0].clientX
      const vertical = touchStart.current.y - event.changedTouches[0].clientY
      if (Math.abs(difference) > 45 && Math.abs(difference) > Math.abs(vertical)) { swiped.current = true; move(difference > 0 ? 1 : -1) }
      touchStart.current = null
    }}>
    <div className="photo-print" style={{ width: frameWidth }}>
      <span className="photo-tape" aria-hidden="true" />
      <div className="slide-window" style={{ height: frameHeight }}>
        {items.map((item, slideIndex) => {
          const slide = normalize(item)
          return <div className={`carousel-slide ${slideIndex === index ? 'is-active' : ''}`} key={slide.src} aria-hidden={slideIndex !== index} inert={slideIndex !== index}>
            {slide.video
              ? <QuietVideo src={slide.src} poster={slide.poster} label={slide.alt ?? `${title} demonstration`} active={active && !zoomOpen && slideIndex === index} onRatio={value => rememberRatio(slide.src, value)} />
              : <button type="button" className="zoom-trigger" onClick={openZoom} aria-label={`Zoom in on ${title}, view ${slideIndex + 1}`}><img src={slide.src} alt={slide.alt ?? `${title}, view ${slideIndex + 1}`} decoding="async" loading="lazy" onLoad={event => rememberRatio(slide.src, event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} /><span className="zoom-affordance" aria-hidden="true">⤢ click to zoom</span></button>}
          </div>
        })}
      </div>
      <p className="photo-caption">{media.caption ?? (media.video ? 'click video to pause / play' : `${title} — ${index + 1}`)}</p>
    </div>
    {media.video && <button className="video-zoom" type="button" onClick={openZoom}>⤢ enlarge video</button>}
    {controls('carousel')}
    <dialog ref={dialog} className="zoom-dialog" style={{ '--media-ratio': ratio } as CSSProperties} aria-label={`${title} enlarged view`}
      onClose={() => {
        setZoomOpen(false)
        dialog.current?.querySelectorAll('video').forEach(video => video.pause())
        document.body.style.overflow = previousOverflow.current
        const opener = zoomOpener.current
        if (opener?.isConnected && !opener.closest('[inert]')) opener.focus({ preventScroll: true })
        else container.current?.focus({ preventScroll: true })
      }}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}
      onKeyDown={event => {
        if ((event.target as Element).closest('video')) return
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1) }
      }}>
      <div className="zoom-sheet">
        <div className="zoom-header"><span>{title}</span><button type="button" onClick={() => dialog.current?.close()} aria-label="Close enlarged view">close ×</button></div>
        <div className="zoom-window">{items.map((item, slideIndex) => {
          const slide = normalize(item)
          return <div className={`carousel-slide ${slideIndex === index ? 'is-active' : ''}`} key={slide.src} aria-hidden={slideIndex !== index} inert={slideIndex !== index}>
            {slide.video ? <QuietVideo src={slide.src} poster={slide.poster} label={`${slide.alt ?? title}, enlarged`} active={zoomOpen && slideIndex === index} onRatio={value => rememberRatio(slide.src, value)} /> : <img src={slide.src} alt={slide.alt ?? title} decoding="async" loading="lazy" />}
          </div>
        })}</div>
        {controls('enlarged')}
      </div>
    </dialog>
  </div>
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const upcoming = project.status === 'coming-soon'
  return <article className={`project-card ${upcoming ? 'is-upcoming' : ''} ${expanded ? 'is-expanded' : ''}`} aria-labelledby={`title-${project.id}`}>
    <div className="project-kicker"><span className="project-number">{String(index + 1).padStart(2, '0')}</span><span>{project.category}</span>{upcoming && <span className="coming-soon">coming soon</span>}</div>
    {upcoming ? <h3 id={`title-${project.id}`}><Handwriting>{project.title}</Handwriting></h3> : <>
      <button className="project-toggle" type="button" aria-expanded={expanded} aria-controls={`details-${project.id}`} onClick={() => setExpanded(value => !value)}>
        <span><h3 id={`title-${project.id}`}><Handwriting>{project.title}</Handwriting></h3><span className="project-teaser">{project.outcome ?? project.summary}</span></span>
        <span className="project-open-hint">{expanded ? 'close notes −' : 'open notes +'}<span aria-hidden="true">↙</span></span>
      </button>
      <div className="project-reveal" id={`details-${project.id}`} inert={!expanded}>
        <div className="project-reveal-inner"><div className="project-details">
          <div className="project-copy"><p className="project-summary">{project.summary}</p>
            {project.highlights?.length ? <ul className="highlights">{project.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul> : null}
            {project.links?.length ? <div className="project-links">{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div> : null}
          </div>
          {project.media.length > 0 && <Carousel items={project.media} title={project.title} active={expanded} />}
        </div></div>
      </div>
    </>}
  </article>
}

export default function App() {
  return <>
    <div className="notebook-binding" aria-hidden="true" />
    <a className="skip-link" href="#work">Skip to projects</a>
    <main className="page">
      <header className="intro">
        <div className="intro-main">
          <h1><Handwriting>{profile.name}</Handwriting><svg className="name-underline" viewBox="0 0 400 15" fill="none" aria-hidden="true"><path d="M4 9C84 1 175 14 263 6S366 5 395 8M28 13C123 9 240 14 347 11" /></svg></h1>
          <aside className="right-now" aria-label="Right now">
            <h2>Right now <span aria-hidden="true">↘</span></h2>
            <dl>
              <div><dt>studying</dt><dd>Electrical engineering at UIUC</dd></div>
              <div><dt>age</dt><dd>{profile.age} years old</dd></div>
              <div className="current-book"><dt>current book</dt><dd>
                <details className="book-details">
                  <summary>{profile.book.title}<span className="book-toggle" aria-hidden="true">⌄</span><small>{profile.book.author}</small></summary>
                  <div className="book-preview" aria-label={`${profile.book.title} by ${profile.book.author}`}>
                    <div className="book-cover" aria-hidden="true"><span>{profile.book.title}</span><small>{profile.book.author}</small></div>
                    <span className="book-note">currently reading<span aria-hidden="true"> ↙</span></span>
                  </div>
                </details>
              </dd></div>
              <div className="song"><dt><span className="music-motion" aria-hidden="true"><i /><i /><i /><i /></span>song of the day</dt><dd>{profile.song.title ? <>{profile.song.href ? <a href={profile.song.href} target="_blank" rel="noreferrer">{profile.song.title} ↗</a> : profile.song.title}<small>{profile.song.artist}</small></> : 'Taking recommendations'}</dd></div>
            </dl>
          </aside>
          <nav className="contact-links" aria-label="Contact and profiles">
            <a href={profile.links.emailHref}>email ↗</a>
            <a href={profile.links.github} target="_blank" rel="noreferrer">github ↗</a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">linkedin ↗</a>
            <a href={profile.links.resume} target="_blank" rel="noreferrer">résumé ↗</a>
          </nav>
        </div>
        <figure className="portrait photo-print">
          <span className="photo-tape" aria-hidden="true" />
          {profile.portrait ? <img src={profile.portrait} alt="Kunal Kaushik" decoding="async" fetchPriority="high" /> : <div className="portrait-placeholder"><span className="portrait-initials" aria-hidden="true">kk.</span><span>portrait coming soon</span></div>}
          <figcaption>{profile.name}</figcaption>
        </figure>
      </header>
      <section id="work" aria-labelledby="work-heading">
        <div className="section-heading"><h2 id="work-heading">Things I’ve been building</h2><svg className="doodle-arrow" viewBox="0 0 95 42" fill="none" aria-hidden="true"><path d="M4 7C31-4 60 0 65 17S54 34 57 27 77 19 90 35M78 34l13 3-1-13" /></svg></div>
        <div className="project-list">
          {projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
        </div>
      </section>
      <section className="contact" aria-labelledby="contact-heading"><span className="contact-star" aria-hidden="true">✳</span><div><h2 id="contact-heading">Let’s make something good.</h2><a href={profile.links.emailHref}>Say hello ↗</a></div></section>
      <footer><p>{profile.name}, {new Date().getFullYear()}.</p><p>Plain text for agents at <a href="/ai/">/ai</a>, with <a href="/llms.txt">llms.txt</a> and <a href="/llms-full.txt">llms-full.txt</a>.</p></footer>
    </main>
  </>
}




