import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renderiza el Skeleton', () => {
    const { container } = render(<Skeleton />);
    expect(container).toBeDefined();
  });
});

