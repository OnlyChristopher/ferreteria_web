import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AspectRatio } from './aspect-ratio';

describe('AspectRatio', () => {
  it('renderiza el AspectRatio', () => {
    const { container } = render(<AspectRatio />);
    expect(container).toBeDefined();
  });
});

