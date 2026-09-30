import fs from 'node:fs'
import { profile } from '../src/content/profile.ts'
import { siteUrl } from '../src/content/site.ts'

const projects = fs.readdirSync('src/content/projects').filter(name => name.endsWith('.json')).map(name => JSON.parse(fs.readFileSync(`src/content/projects/${name}`, 'utf8'))).sort((a,b) => a.order-b.order)
const origin = siteUrl
const absolute = path => new URL(path, origin).href
const identity = `# ${profile.name}\n\nOfficial portfolio: ${origin}/\n\n${profile.intro}\n\nAge: ${profile.age}\nEducation: ${profile.education.degree}, ${profile.education.school} (${profile.education.period})\nInterests: ${profile.focus.join(', ')}\nCurrent book: ${profile.book.title} — ${profile.book.author}\nSong of the day: ${profile.song.title} — ${profile.song.artist}\nListen: ${profile.song.href}\nEmail: ${profile.links.email}\nGitHub: ${profile.links.github}\nLinkedIn: ${profile.links.linkedin}\nResume: ${absolute(profile.links.resume)}\n`
const summary = `${identity}\n## Projects\n\n${projects.map(p=>`- ${p.title}${p.status === 'coming-soon' ? ' [Coming soon]' : ''}: ${p.summary}${p.outcome ? ' '+p.outcome : ''}`).join('\n')}\n\n## More information\n\n- ${origin}/ai/: plain-text portfolio overview\n- ${origin}/llms-full.txt: full project descriptions and media paths\n\nComing-soon entries are placeholders. They do not claim completed work or measured results. Project metrics are self-reported by the portfolio owner.\n`
const full = `${identity}\n## Projects\n\n${projects.map(p=>`### ${p.title}\nStatus: ${p.status === 'coming-soon' ? 'Coming soon' : 'Portfolio project'}\nCategory: ${p.category}\n\n${p.summary}\n${p.outcome || ''}\n\n${(p.highlights || []).map(h=>'- '+h).join('\n')}\n\n${p.paragraphs.join('\n\n')}\n\n${p.media.length ? 'Media:\n'+p.media.map(m=>'- '+absolute(typeof m==='string'?m:m.src)).join('\n') : ''}\n${(p.links || []).map(l=>`${l.label}: ${l.href}`).join('\n')}`).join('\n\n')}\n\nComing-soon entries are placeholders, not claims of completed work. All metrics are self-reported.\n`
fs.mkdirSync('public/ai',{recursive:true})
fs.writeFileSync('public/llms.txt',summary)
fs.writeFileSync('public/llms-full.txt',full)
const escaped = summary.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
fs.writeFileSync('public/ai/index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Kunal Kaushik — Plain text</title><link rel="canonical" href="${origin}/"><meta name="description" content="Plain-text portfolio of Kunal Kaushik, electrical engineering student at UIUC, with robotics, PCB, embedded systems, and computer vision projects."><style>body{margin:40px auto;padding:0 24px;max-width:850px;background:#faf8f0;color:#363933}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.7 monospace}a{color:inherit}</style></head><body><nav><a href="/">Portfolio</a> · <a href="/llms.txt">llms.txt</a> · <a href="/llms-full.txt">llms-full.txt</a></nav><pre>${escaped}</pre></body></html>`)




