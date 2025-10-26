import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Command } from './command';

describe('Command', () => {
  it('renderiza el Command', () => {
    const { container } = render(<Command />);
    expect(container).toBeDefined();
  });
});

