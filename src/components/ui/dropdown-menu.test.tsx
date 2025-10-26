import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DropdownMenu } from './dropdown-menu';

describe('DropdownMenu', () => {
  it('renderiza el DropdownMenu', () => {
    const { container } = render(<DropdownMenu />);
    expect(container).toBeDefined();
  });
});

