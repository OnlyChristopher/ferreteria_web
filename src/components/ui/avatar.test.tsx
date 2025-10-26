import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './avatar';

describe('Avatar', () => {
  it('renderiza el Avatar', () => {
    const { container } = render(<Avatar />);
    expect(container).toBeDefined();
  });
});

