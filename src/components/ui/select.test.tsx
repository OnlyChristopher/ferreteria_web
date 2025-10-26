import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Select } from './select';

describe('Select', () => {
  it('renderiza el Select', () => {
    const { container } = render(<Select />);
    expect(container).toBeDefined();
  });
});

