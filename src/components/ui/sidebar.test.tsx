});
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  it('renderiza el Sidebar', () => {
    const { container } = render(<Sidebar />);
    expect(container).toBeDefined();
  });
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Switch } from './switch';

describe('Switch', () => {
  it('renderiza el Switch', () => {
    const { container } = render(<Switch />);
    expect(container).toBeDefined();
  });
});

