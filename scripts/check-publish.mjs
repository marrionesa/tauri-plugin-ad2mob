#!/usr/bin/env node
/**
 * Publish-readiness verification for `tauri-plugin-ad2mob`.
 *
 * Validates everything crates.io and npm require BEFORE the real dry-run
 * publishes (which `scripts/verify.sh` runs afterwards):
 *
 *   1. Cargo.toml metadata (repository, authors, docs.rs, keywords/categories)
 *   2. package.json metadata (author, repository, bugs, homepage, files)
 *   3. The actual crate tarball file list (`cargo package --list --no-deps`):
 *      every build-critical asset in, every dev artifact out.
 *   4. The actual npm tarball file list (`npm pack --dry-run --json`):
 *      dist bundles, types, README and licenses in; sources out.
 *      (requires `npm run build` to have been executed first)
 *
 * Exits with code 0 when every check passes, 1 otherwise.
 *
 * Usage:  node scripts/check-publish.mjs   (run from anywhere)
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO_URL = 'https://github.com/marrionesa/tauri-plugin-ad2mob'

/** Resolves a binary, falling back to the usual cargo home (sandbox/CI PATHs differ). */
function findBin(name) {
  try {
    return execFileSync('which', [name], { encoding: 'utf8' }).trim()
  } catch {
    const fallback = join(homedir(), '.cargo', 'bin', name)
    return existsSync(fallback) ? fallback : name
  }
}

// ---------------------------------------------------------------------------
// Tiny check runner
// ---------------------------------------------------------------------------

let passed = 0
let failed = 0
const failures = []

function check(label, fn) {
  try {
    const result = fn()
    if (result === true) {
      passed++
      console.log(`  \x1b[32m✔\x1b[0m ${label}`)
    } else {
      failed++
      failures.push([label, result])
      console.log(`  \x1b[31m✘ ${label}\x1b[0m`)
    }
  } catch (error) {
    failed++
    failures.push([label, error instanceof Error ? error.message : String(error)])
    console.log(`  \x1b[31m✘ ${label}\x1b[0m`)
  }
}

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8')

// ---------------------------------------------------------------------------
// 1 + 2. Release metadata
// ---------------------------------------------------------------------------

const cargo = read('Cargo.toml')
const pkg = JSON.parse(read('package.json'))

console.log('\n\x1b[1m  tauri-plugin-ad2mob · publish readiness\x1b[0m\n')

console.log('\x1b[1mCargo.toml (crates.io)\x1b[0m')
const cargoField = (name) => {
  const m = cargo.match(new RegExp(`^${name}\\s*=\\s*"([^"]+)"`, 'm'))
  return m ? m[1] : null
}
check('repository points at marrionesa/tauri-plugin-ad2mob', () => {
  const v = cargoField('repository')
  return v === `${REPO_URL}` ? true : `repository = ${v}`
})
check('homepage points at the canonical repository', () => {
  const v = cargoField('homepage')
  return v === `${REPO_URL}` ? true : `homepage = ${v}`
})
check('documentation points at docs.rs', () => {
  const v = cargoField('documentation')
  return v === 'https://docs.rs/tauri-plugin-ad2mob' ? true : `documentation = ${v}`
})
check('readme = "README.md" (crates.io renders it)', () => (cargoField('readme') === 'README.md' ? true : 'missing readme field'))
check('authors include marrionesa', () => {
  const m = cargo.match(/^authors\s*=\s*\[(.*?)\]/m)
  return m && m[1].includes('marrionesa') ? true : `authors = ${m ? m[1] : '??'}`
})
check('license is the dual MIT OR Apache-2.0 expression', () => (cargoField('license') === 'MIT OR Apache-2.0' ? true : 'wrong license'))
check('description is present (required by crates.io)', () => (cargoField('description') ? true : 'missing description'))
check('keywords: at most 5 (crates.io limit)', () => {
  const m = cargo.match(/^keywords\s*=\s*\[(.*?)\]/m)
  const count = m ? (m[1].match(/"/g) || []).length / 2 : 0
  return count > 0 && count <= 5 ? true : `${count} keywords found`
})
check('categories use valid crates.io slugs', () => {
  const m = cargo.match(/^categories\s*=\s*\[(.*?)\]/m)
  const list = m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : []
  const valid = ['gui', 'web-programming', 'os::android-apis', 'os::ios-apis', 'api-bindings', 'multimedia']
  const invalid = list.filter((c) => !valid.includes(c))
  return invalid.length === 0 ? true : `invalid categories: ${invalid.join(', ')}`
})
check('build.rs ships with the crate (required by the Tauri plugin build)', () =>
  existsSync(join(ROOT, 'build.rs')) && cargo.includes('tauri-plugin') ? true : 'build.rs or tauri-plugin build dep missing',
)
check('docs.rs metadata builds the Android target (mobile plugin needs it)', () =>
  cargo.includes('[package.metadata.docs.rs]') && cargo.includes('x86_64-linux-android') ? true : 'docs.rs target config missing',
)
check('crate excludes dev artifacts (node_modules, dist, TS tests, guest-js, scripts)', () => {
  const m = cargo.match(/^exclude\s*=\s*\[(.*?)\]/m)
  const list = m ? m[1] : ''
  const required = ['/node_modules', '/dist-cjs', '/dist-esm', '/tests/ts', '/guest-js', '/scripts', '/examples']
  const missing = required.filter((x) => !list.includes(x))
  return missing.length === 0 ? true : `exclude misses: ${missing.join(', ')}`
})

console.log('\n\x1b[1mpackage.json (npm)\x1b[0m')
check('author is marrionesa', () => (pkg.author === 'marrionesa' ? true : `author = ${JSON.stringify(pkg.author)}`))
check('repository points at marrionesa/tauri-plugin-ad2mob', () =>
  pkg.repository?.url?.includes('github.com/marrionesa/tauri-plugin-ad2mob') ? true : `repository = ${JSON.stringify(pkg.repository)}`,
)
check('bugs URL points at the issues tracker', () =>
  pkg.bugs?.url === `${REPO_URL}/issues` ? true : `bugs = ${JSON.stringify(pkg.bugs)}`,
)
check('homepage points at the README', () => (pkg.homepage === `${REPO_URL}#readme` ? true : `homepage = ${pkg.homepage}`))
check('files whitelist ships dist + README + licenses', () => {
  const files = pkg.files || []
  const required = ['dist-cjs', 'dist-esm', 'README.md', 'LICENSE', 'LICENSE-MIT', 'LICENSE-APACHE']
  const missing = required.filter((f) => !files.includes(f))
  return missing.length === 0 ? true : `files misses: ${missing.join(', ')}`
})
check('sideEffects: false (tree-shakeable, no top-level side effects)', () => (pkg.sideEffects === false ? true : 'sideEffects not false'))
check('exports define types + import + require (root or dot form)', () => {
  const e = pkg.exports?.['.'] ?? pkg.exports ?? {}
  return e.types && e.import && e.require ? true : `exports = ${JSON.stringify(pkg.exports)}`
})
check('engines declare node >= 18', () => (pkg.engines?.node === '>=18' ? true : `engines = ${JSON.stringify(pkg.engines)}`))

// ---------------------------------------------------------------------------
// 3. Crate tarball listing
// ---------------------------------------------------------------------------

console.log('\n\x1b[1mCrate tarball (cargo package --list --no-deps)\x1b[0m')
const mustShip = [
  'Cargo.toml',
  'build.rs',
  'src/lib.rs',
  'src/commands.rs',
  'src/mobile.rs',
  'src/desktop.rs',
  'permissions/default.toml',
  'permissions/schemas/schema.json',
  'android/build.gradle.kts',
  'android/src/main/java/com/plugin/admob/AdmobPlugin.kt',
  'ios/Package.swift',
  'ios/Sources/AdmobPlugin.swift',
  'README.md',
  'LICENSE-MIT',
  'LICENSE-APACHE',
  'tests/public_api.rs',
]
const mustNotShip = [
  'node_modules/',
  'target/',
  'guest-js/',
  'scripts/',
  'tests/ts/',
  'dist-cjs/',
  'dist-esm/',
  'examples/',
  '.gitignore',
]
{
  let listing
  try {
    listing = execFileSync(findBin('cargo'), ['package', '--list', '--allow-dirty'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    })
  } catch (error) {
    listing = null
    check('cargo package --list runs cleanly', () => {
      throw error
    })
  }
  if (listing !== null) {
    const files = listing.split('\n').filter(Boolean)
    check(`cargo package --list runs cleanly (${files.length} files in the tarball)`, () => (files.length >= 20 ? true : 'suspiciously small'))
    check('every build-critical asset ships in the crate', () => {
      const missing = mustShip.filter((f) => !files.some((x) => x === f || x.startsWith(f)))
      return missing.length === 0 ? true : `missing from tarball: ${missing.join(', ')}`
    })
    check('no dev artifacts leak into the crate', () => {
      const leaked = mustNotShip.filter((f) => files.some((x) => x.startsWith(f) || x === f.replace(/\/$/, '')))
      return leaked.length === 0 ? true : `leaked into tarball: ${leaked.join(', ')}`
    })
    check('LICENSE files ship with the crate (required for packaging)', () =>
      files.includes('LICENSE-MIT') && files.includes('LICENSE-APACHE') ? true : 'license files missing from tarball',
    )
  }
}

// ---------------------------------------------------------------------------
// 4. npm tarball listing
// ---------------------------------------------------------------------------

console.log('\n\x1b[1mnpm tarball (npm pack --dry-run)\x1b[0m')
{
  const distReady = existsSync(join(ROOT, 'dist-esm', 'index.js')) && existsSync(join(ROOT, 'dist-cjs', 'index.js'))
  if (!distReady) {
    check('npm tarball contents', () => 'dist bundles missing — run `npm run build` (or `bun run build`) before the publish check')
  } else {
    let entries
    try {
      const json = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
      const parsed = JSON.parse(json)
      entries = (parsed?.[0]?.files ?? []).map((f) => f.path)
    } catch (error) {
      entries = null
      check('npm pack --dry-run runs cleanly', () => {
        throw error
      })
    }
    if (entries) {
      const required = [
        'package.json',
        'README.md',
        'LICENSE',
        'LICENSE-MIT',
        'LICENSE-APACHE',
        'dist-cjs/index.js',
        'dist-esm/index.js',
        'dist-esm/index.d.ts',
        'dist-esm/package.json',
      ]
      const missing = required.filter((f) => !entries.includes(f))
      check(`npm pack runs cleanly (${entries.length} files in the tarball)`, () => (entries.length >= 8 ? true : 'suspiciously small'))
      check('tarball ships dist bundles, types, README and licenses', () =>
        missing.length === 0 ? true : `missing from tarball: ${missing.join(', ')}`,
      )
      const leaked = entries.filter((f) => /^(guest-js|scripts|tests|src|android|ios)\//.test(f))
      check('no sources leak into the npm tarball', () => (leaked.length === 0 ? true : `leaked: ${leaked.join(', ')}`))
    }
  }
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

console.log(`\n  \x1b[1mRESULT: ${passed} passed, ${failed} failed\x1b[0m`)
if (failed > 0) {
  console.log('\n  Failures:')
  for (const [label, reason] of failures) {
    console.log(`  \x1b[31m✘ ${label}\x1b[0m\n    ${reason}`)
  }
  console.log()
  process.exit(1)
}
console.log()
