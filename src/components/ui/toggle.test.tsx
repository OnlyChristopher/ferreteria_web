import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Toggle } from './toggle';

describe('Toggle', () => {
  it('renderiza el Toggle', () => {
    const { container } = render(<Toggle />);
    expect(container).toBeDefined();
  });
});

