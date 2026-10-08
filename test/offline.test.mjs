// Every file the app starts with must be in the service worker's CORE list,
// or it won't open offline (see public/sw.js).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const read = file => readFileSync(new URL(`../public/${file}`, import.meta.url), 'utf8')

test('the service worker saves every file the app starts with', () => {
  const core = new Set(read('sw.js').match(/const CORE = \[([^\]]+)\]/)[1].match(/'([^']+)'/g).map(p => p.slice(2, -1)))
  const modules = ['app.js']
  for (const file of modules) for (const [, dep] of read(file).matchAll(/from '\.\/([^']+)'/g)) if (!modules.includes(dep)) modules.push(dep)
  const needed = [...modules, 'style.css']
  assert.deepEqual(needed.filter(f => !core.has(f)), [])
  assert.ok(core.has(''))
})
