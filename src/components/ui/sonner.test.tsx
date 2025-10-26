import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Toaster } from './sonner';

describe('Toaster', () => {
  it('renderiza el Toaster', () => {
    const { container } = render(<Toaster />);
    expect(container).toBeDefined();
  });
});

