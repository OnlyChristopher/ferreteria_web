import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RadioGroup } from './radio-group';

describe('RadioGroup', () => {
  it('renderiza el RadioGroup', () => {
    const { container } = render(<RadioGroup />);
    expect(container).toBeDefined();
  });
});

