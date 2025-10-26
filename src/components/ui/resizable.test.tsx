import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ResizablePanelGroup } from './resizable';

describe('ResizablePanelGroup', () => {
  it('renderiza el ResizablePanelGroup', () => {
    const { container } = render(<ResizablePanelGroup />);
    expect(container).toBeDefined();
  });
});
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Collapsible } from './collapsible';

describe('Collapsible', () => {
  it('renderiza el Collapsible', () => {
    const { container } = render(<Collapsible />);
    expect(container).toBeDefined();
  });
});

