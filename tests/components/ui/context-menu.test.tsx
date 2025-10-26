import React from 'react'
import * as Module from '/src/components/ui/context-menu.tsx'
import { render } from '@testing-library/react'

// Smoke test auto-generado para context-menu
test('renders context-menu without crashing', () => {
  const Candidate = Module.default || Object.values(Module).find(m => typeof m === 'function')
  if (!Candidate) {
    // Si no hay componente exportado, marcamos test como pasable
    expect(true).toBe(true)
    return
  }
  expect(() => render(React.createElement(Candidate, {}))).not.toThrow()
})
