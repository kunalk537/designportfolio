import fs from 'node:fs'
import { profile } from '../src/content/profile.ts'
const origin = 'https://kunalsk.com'
const projects = fs.readdirSync('src/content/projects').filter(name => name.endsWith('.json')).map(name => JSON.parse(fs.readFileSync(`src/content/projects/${name}`, 'utf8'))).sort((a,b) => a.order-b.order)
const title = 'Kunal Kaushik | Electrical Engineering & Robotics at UIUC'
const description = 'Kunal Kaushik is an electrical engineering student at UIUC building robotics, embedded systems, custom PCBs, and computer vision projects. Explore his work and contact him.'
const personId = `${origin}/#kunal-kaushik`
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Person', '@id': personId, name: profile.name, givenName: 'Kunal', familyName: 'Kaushik', url: `${origin}/`, image: `${origin}${profile.portrait}`, description: profile.intro, jobTitle: 'Electrical engineering student', affiliation: { '@type': 'CollegeOrUniversity', name: profile.education.school }, email: `mailto:${profile.links.email}`, sameAs: [profile.links.github, profile.links.linkedin], knowsAbout: ['Electrical engineering', 'Robotics', 'Embedded systems', 'PCB design', 'Motor control', 'Computer vision'] },
    { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: profile.name, inLanguage: 'en', publisher: { '@id': personId } },
    { '@type': 'ProfilePage', '@id': `${origin}/#profile`, url: `${origin}/`, name: title, description, inLanguage: 'en', isPartOf: { '@id': `${origin}/#website` }, mainEntity: { '@id': personId }, hasPart: projects.filter(project => project.status !== 'coming-soon').map(project => ({ '@type': 'CreativeWork', '@id': `${origin}/#title-${project.id}`, name: project.title, description: `${project.summary} ${project.outcome || ''}`.trim(), url: `${origin}/#title-${project.id}`, creator: { '@id': personId }, keywords: project.tags, image: project.media.filter(media => typeof media === 'string' && !/\.(mp4|webm)$/i.test(media)).map(media => `${origin}${media}`) })) },
  ],
}
const escape = text => text.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;')
fs.writeFileSync('index.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}" />
<meta name="author" content="${profile.name}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="google-site-verification" content="mji-gkf_MkXGOoMiOGOepJiVLAm1FLaXGOqpLIne6fM" />
<meta name="theme-color" content="#faf8f0" />
<link rel="canonical" href="${origin}/" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate" type="text/plain" href="${origin}/llms-full.txt" title="Full plain-text portfolio" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<meta property="og:site_name" content="${profile.name}" />
<meta property="og:title" content="${escape(title)}" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${origin}/" />
<meta property="og:locale" content="en_US" />
<meta property="og:image" content="${origin}/social-preview.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Kunal Kaushik — Electrical engineering at UIUC, robotics and embedded systems" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escape(title)}" />
<meta name="twitter:description" content="${escape(description)}" />
<meta name="twitter:image" content="${origin}/social-preview.jpg" />
<meta name="twitter:image:alt" content="Kunal Kaushik — Electrical engineering at UIUC" />
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>
</head>
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>\n`)
fs.writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`)
fs.writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`)
