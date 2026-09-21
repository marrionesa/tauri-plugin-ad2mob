#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const androidRoot = join(root, 'examples', 'admob-demo', 'src-tauri', 'gen', 'android')
const buildFile = join(androidRoot, 'build.gradle.kts')
const manifestFile = join(androidRoot, 'app', 'src', 'main', 'AndroidManifest.xml')

if (!existsSync(buildFile) || !existsSync(manifestFile)) {
  throw new Error('Android project is not initialized; run `cargo tauri android init` first')
}

const build = readFileSync(buildFile, 'utf8')
const preparedBuild = build.replace(
  /kotlin-gradle-plugin:[^"\n]+/,
  'kotlin-gradle-plugin:2.1.0',
)
writeFileSync(buildFile, preparedBuild)

const manifest = readFileSync(manifestFile, 'utf8')
if (!manifest.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  const preparedManifest = manifest.replace(
    /(<application\b[^>]*>)/,
    '$1\n        <meta-data\n            android:name="com.google.android.gms.ads.APPLICATION_ID"\n            android:value="ca-app-pub-3940256099942544~3347511713" />',
  )
  writeFileSync(manifestFile, preparedManifest)
}