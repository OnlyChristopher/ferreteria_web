import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Chart } from './chart';

describe('Chart', () => {
  it('renderiza el Chart', () => {
    const { container } = render(<Chart />);
    expect(container).toBeDefined();
  });
});
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Accordion } from './accordion';

describe('Accordion', () => {
  it('renderiza el Accordion', () => {
    const { container } = render(<Accordion />);
    expect(container).toBeDefined();
  });
});

