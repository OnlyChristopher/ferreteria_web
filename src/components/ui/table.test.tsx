import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Table } from './table';

describe('Table', () => {
  it('renderiza el Table', () => {
    const { container } = render(<Table />);
    expect(container).toBeDefined();
  });
});

