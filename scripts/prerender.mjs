import fs from 'node:fs/promises'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx')
  const markup = renderToString(createElement(App))
  const html = await fs.readFile('dist/index.html', 'utf8')
  if (!html.includes('<div id="root"></div>')) throw new Error('Missing prerender target')
  await fs.writeFile('dist/index.html', html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`))
  console.log('Prerendered portfolio: complete HTML available without JavaScript.')
} finally { await server.close() }
