import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Alert } from './alert';

describe('Alert', () => {
  it('renderiza el Alert con texto', () => {
    render(<Alert>Alerta</Alert>);
    expect(screen.getByText('Alerta')).toBeInTheDocument();
  });
});

