import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  it('renderiza el Tooltip', () => {
    const { container } = render(<Tooltip />);
    expect(container).toBeDefined();
  });
});

