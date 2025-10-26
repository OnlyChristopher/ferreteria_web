import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Calendar } from './calendar';

describe('Calendar', () => {
  it('renderiza el Calendar', () => {
    const { container } = render(<Calendar />);
    expect(container).toBeDefined();
  });
});

