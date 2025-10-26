import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Drawer } from './drawer';

describe('Drawer', () => {
  it('renderiza el Drawer', () => {
    const { container } = render(<Drawer />);
    expect(container).toBeDefined();
  });
});

