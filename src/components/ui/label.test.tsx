import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from './label';

describe('Label', () => {
  it('renderiza el Label con texto', () => {
    render(<Label>Etiqueta</Label>);
    expect(screen.getByText('Etiqueta')).toBeInTheDocument();
  });
});

