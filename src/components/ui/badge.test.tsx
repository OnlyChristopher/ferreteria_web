import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renderiza el Badge con texto', () => {
    render(<Badge>Etiqueta</Badge>);
    expect(screen.getByText('Etiqueta')).toBeInTheDocument();
  });
});

