import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ContextMenu } from './context-menu';

describe('ContextMenu', () => {
  it('renderiza el ContextMenu', () => {
    const { container } = render(<ContextMenu />);
    expect(container).toBeDefined();
  });
});

