import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScrollArea } from './scroll-area';

describe('ScrollArea', () => {
  it('renderiza el ScrollArea', () => {
    const { container } = render(<ScrollArea />);
    expect(container).toBeDefined();
  });
});

