import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Pagination } from './pagination';

describe('Pagination', () => {
  it('renderiza el Pagination', () => {
    const { container } = render(<Pagination />);
    expect(container).toBeDefined();
  });
});

