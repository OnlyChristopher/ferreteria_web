import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Dialog } from './dialog';

describe('Dialog', () => {
  it('renderiza el Dialog', () => {
    render(<Dialog open={true}>Contenido del diálogo</Dialog>);
    expect(screen.getByText('Contenido del diálogo')).toBeInTheDocument();
  });
});

