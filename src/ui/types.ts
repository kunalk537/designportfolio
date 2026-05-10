export type MediaItem = {
  src: string
  type: 'image' | 'video'
  caption?: string
  poster?: string
  alt?: string
}

export type LightboxState =
  | {
      items: MediaItem[]
      index: number
      projectTitle?: string
    }
  | null
