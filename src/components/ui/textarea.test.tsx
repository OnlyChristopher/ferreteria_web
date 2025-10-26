import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renderiza el Textarea', () => {
    render(<Textarea placeholder="Escribe aquí" />);
    expect(screen.getByPlaceholderText('Escribe aquí')).toBeInTheDocument();
  });
});

