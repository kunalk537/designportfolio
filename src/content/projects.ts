export type MediaInput = string | { src: string; type?: 'image' | 'video'; caption?: string; poster?: string; alt?: string }
export type Project = {
 id: string
 title: string
 summary: string
 outcome?: string
 status?: 'coming-soon'
 highlights?: string[]
 category: 'Robotics' | 'Computer vision' | 'Electronics'
 order: number
 tags: string[]
 media: MediaInput[]
 paragraphs: string[]
 links?: { label: string; href: string }[]
}
const files = import.meta.glob<Project>('./projects/*.json', { eager: true, import: 'default' })
export const projects = Object.values(files).sort((a,b) => a.order - b.order || a.id.localeCompare(b.id))
