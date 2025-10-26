import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Slider } from './slider';

describe('Slider', () => {
  it('renderiza el Slider', () => {
    const { container } = render(<Slider />);
    expect(container).toBeDefined();
  });
});
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renderiza el botón con texto', () => {
    render(<Button>Click aquí</Button>);
    expect(screen.getByText('Click aquí')).toBeInTheDocument();
  });
});

