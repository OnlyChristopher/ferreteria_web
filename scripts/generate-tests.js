const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, '..', 'src', 'components')
const outDir = path.join(__dirname, '..', 'tests', 'components')

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...walk(full))
    else if (e.isFile() && e.name.endsWith('.tsx')) files.push(full)
  }
  return files
}

function makeTestFor(filePath) {
  const relPath = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/')
  // Use Vite absolute import from project root to avoid fragile relative paths in nested test folders
  const importPath = '/' + relPath
  const fileName = path.basename(filePath, '.tsx')
  const testContent = `import React from 'react'
import * as Module from '${importPath}'
import { render } from '@testing-library/react'

// Smoke test auto-generado para ${fileName}
test('renders ${fileName} without crashing', () => {
  const Candidate = Module.default || Object.values(Module).find(m => typeof m === 'function')
  if (!Candidate) {
    // Si no hay componente exportado, marcamos test como pasable
    expect(true).toBe(true)
    return
  }
  expect(() => render(React.createElement(Candidate, {}))).not.toThrow()
})
`
  return testContent
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function run() {
  ensureDir(outDir)
  const files = walk(srcDir)
  for (const f of files) {
    const rel = path.relative(srcDir, f)
    const destDir = path.join(outDir, path.dirname(rel))
    ensureDir(destDir)
    const destFile = path.join(destDir, path.basename(f, '.tsx') + '.test.tsx')
    const content = makeTestFor(f)
    fs.writeFileSync(destFile, content, 'utf8')
    console.log('Wrote', destFile)
  }
  console.log('Generated', files.length, 'test files')
}

run()
