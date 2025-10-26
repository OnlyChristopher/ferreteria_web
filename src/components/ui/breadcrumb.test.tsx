import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Breadcrumb } from './breadcrumb';

describe('Breadcrumb', () => {
  it('renderiza el Breadcrumb', () => {
    const { container } = render(<Breadcrumb />);
    expect(container).toBeDefined();
  });
});

