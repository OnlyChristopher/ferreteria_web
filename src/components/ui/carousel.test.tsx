import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Carousel } from './carousel';

describe('Carousel', () => {
  it('renderiza el Carousel', () => {
    const { container } = render(<Carousel />);
    expect(container).toBeDefined();
  });
});

