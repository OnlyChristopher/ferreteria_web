import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HoverCard } from './hover-card';

describe('HoverCard', () => {
  it('renderiza el HoverCard', () => {
    const { container } = render(<HoverCard />);
    expect(container).toBeDefined();
  });
});

