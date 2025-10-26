import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Separator } from './separator';

describe('Separator', () => {
  it('renderiza el Separator', () => {
    const { container } = render(<Separator />);
    expect(container).toBeDefined();
  });
});

