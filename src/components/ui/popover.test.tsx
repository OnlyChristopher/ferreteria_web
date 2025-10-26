import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Popover } from './popover';

describe('Popover', () => {
  it('renderiza el Popover', () => {
    const { container } = render(<Popover />);
    expect(container).toBeDefined();
  });
});

