#!/usr/bin/env node
// Replace packages/sdk with the BUILT output of one published version of
// @infrared-city/infrared-sdk-ts. Maintainers only: novices never run this.
//
//   NPM_TOKEN=<token with read:packages> npm run update-sdk -- 0.12.13-next.18
//
// Options:
//   --registry <url>   default https://npm.pkg.github.com (use
//                      https://registry.npmjs.org when the SDK is public)
//
// What it does: read the package document, download the tarball, check its
// sha512 integrity, and copy ONLY the built files (dist/ without source maps,
// the WASM glue, LICENSE, NOTICE) plus a trimmed package.json. It never
// copies source code, and it never writes the token to disk.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const PKG = '@infrared-city/infrared-sdk-ts'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(root, 'packages', 'sdk')

const args = process.argv.slice(2)
let registry = 'https://npm.pkg.github.com'
let version
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--registry') registry = args[++i]
  else version = args[i]
}
if (!version) {
  console.error('Usage: npm run update-sdk -- <version> [--registry <url>]')
  process.exit(1)
}
registry = registry.replace(/\/+$/, '')
const token = process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN || process.env.GITHUB_TOKEN
const headers = token ? { Authorization: `Bearer ${token}` } : {}
const registryHost = new URL(registry).host
if (!token && registryHost === 'npm.pkg.github.com') {
  console.error('Set NPM_TOKEN to a GitHub token with read:packages (GitHub Packages needs one).')
  process.exit(1)
}

// Scoped name in a registry URL: @scope%2fname
const docRes = await fetch(`${registry}/@${encodeURIComponent(PKG.slice(1))}`, { headers })
if (!docRes.ok) throw new Error(`package document: HTTP ${docRes.status}`)
const doc = await docRes.json()
const meta = doc.versions?.[version]
if (!meta) {
  const known = Object.keys(doc.versions ?? {})
    .slice(-10)
    .join(', ')
  throw new Error(`version ${version} not found. Latest known: ${known}`)
}
if (meta.license !== 'Apache-2.0') {
  throw new Error(`license is "${meta.license}", not Apache-2.0 — stop and ask before vendoring`)
}

// Send the token only to the registry's own host.
const tarballUrl = new URL(meta.dist.tarball)
if (tarballUrl.protocol !== 'https:') throw new Error('tarball URL must be https')
const tgzRes = await fetch(tarballUrl, {
  headers: tarballUrl.host === registryHost ? headers : {},
})
if (!tgzRes.ok) throw new Error(`tarball: HTTP ${tgzRes.status}`)
const tgz = Buffer.from(await tgzRes.arrayBuffer())
const [algo, expected] = meta.dist.integrity.split('-')
const actual = createHash(algo).update(tgz).digest('base64')
if (actual !== expected) throw new Error('tarball integrity check failed')

const work = mkdtempSync(join(tmpdir(), 'infrared-sdk-'))
try {
  writeFileSync(join(work, 'sdk.tgz'), tgz)
  execFileSync('tar', ['-xzf', 'sdk.tgz'], { cwd: work })
  const src = join(work, 'package')
  const upstream = JSON.parse(readFileSync(join(src, 'package.json'), 'utf8'))

  rmSync(target, { recursive: true, force: true })
  const noMaps = (p) => !p.endsWith('.map')
  cpSync(join(src, 'dist'), join(target, 'dist'), { recursive: true, filter: noMaps })
  const copied = ['dist']
  for (const entry of upstream.files ?? []) {
    if (entry === 'dist' || entry.endsWith('.md')) continue
    const from = join(src, entry)
    if (existsSync(from)) {
      cpSync(from, join(target, entry), { recursive: true, filter: noMaps })
      copied.push(entry)
    }
  }
  for (const f of ['LICENSE', 'NOTICE']) {
    if (existsSync(join(src, f)) && !copied.includes(f)) {
      cpSync(join(src, f), join(target, f))
      copied.push(f)
    }
  }

  // Source maps are not copied, so drop the comments that point at them
  // (otherwise bundlers warn about missing files).
  const stripMapComments = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      if (e.isDirectory()) stripMapComments(p)
      else if (/\.(c?js|d\.c?ts)$/.test(e.name)) {
        const text = readFileSync(p, 'utf8')
        const out = text.replace(/\n?\/\/# sourceMappingURL=\S+\s*$/, '\n')
        if (out !== text) writeFileSync(p, out)
      }
    }
  }
  stripMapComments(target)

  const keep = [
    'name',
    'version',
    'description',
    'license',
    'type',
    'main',
    'module',
    'types',
    'exports',
    'dependencies',
    'peerDependencies',
    'peerDependenciesMeta',
    'engines',
  ]
  const trimmed = {}
  for (const k of keep) if (upstream[k] !== undefined) trimmed[k] = upstream[k]
  trimmed.files = copied
  trimmed.vendored = {
    note: 'Built output only, copied by scripts/update-sdk.mjs. Do not edit by hand.',
    integrity: meta.dist.integrity,
  }
  writeFileSync(join(target, 'package.json'), `${JSON.stringify(trimmed, null, 2)}\n`)
  console.log(`packages/sdk is now ${PKG}@${version} (${copied.join(', ')})`)
  console.log(`Next: npm install, then check the app. Files in ${relative(root, target)}/`)
} finally {
  rmSync(work, { recursive: true, force: true })
}
