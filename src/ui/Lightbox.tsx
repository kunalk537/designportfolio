import { useEffect } from 'react'
import type { LightboxState } from './types'

type Props = {
  state: LightboxState
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

function Lightbox({ state, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    if (!state) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)

    document
      .querySelectorAll<HTMLVideoElement>('.card-video')
      .forEach((v) => v.pause())

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [state, onClose, onPrev, onNext])

  if (!state) return null

  const item = state.items[state.index]
  const total = state.items.length
  const hasPrev = state.index > 0
  const hasNext = state.index < total - 1
  const altText = item?.alt ?? state.projectTitle ?? 'media'

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={altText}
      onClick={onClose}
    >
      <span className="lightbox__counter">
        {state.index + 1} / {total}
      </span>

      <button
        type="button"
        className="lightbox__close"
        onClick={onClose}
        aria-label="Close"
      >
        <span aria-hidden>×</span>
      </button>

      {total > 1 ? (
        <>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            disabled={!hasPrev}
            aria-label="Previous"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            disabled={!hasNext}
            aria-label="Next"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      ) : null}

      <div
        className="lightbox__frame"
        onClick={(event) => event.stopPropagation()}
      >
        {item ? (
          item.type === 'video' ? (
            <video
              key={item.src}
              className="lightbox__video"
              src={item.src}
              poster={item.poster}
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img src={item.src} alt={altText} decoding="async" />
          )
        ) : (
          <div className="lightbox__placeholder">No media available.</div>
        )}
        {item?.caption ? (
          <div className="lightbox__caption">{item.caption}</div>
        ) : null}
      </div>

      <span className="lightbox__hint">
        {total > 1 ? 'Esc · ← → to navigate' : 'Esc or click anywhere to close'}
      </span>
    </div>
  )
}

export default Lightbox
