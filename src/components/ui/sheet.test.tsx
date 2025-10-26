import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sheet } from './sheet';

describe('Sheet', () => {
  it('renderiza el Sheet', () => {
    const { container } = render(<Sheet />);
    expect(container).toBeDefined();
  });
});

