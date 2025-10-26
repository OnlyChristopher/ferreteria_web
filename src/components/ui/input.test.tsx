import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('renderiza el Input', () => {
    render(<Input placeholder="Escribe aquí" />);
    expect(screen.getByPlaceholderText('Escribe aquí')).toBeInTheDocument();
  });
});

