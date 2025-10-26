import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Progress } from './progress';

describe('Progress', () => {
  it('renderiza el Progress', () => {
    const { container } = render(<Progress value={50} />);
    expect(container).toBeDefined();
  });
});

