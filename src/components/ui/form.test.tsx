import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Form } from './form';

describe('Form', () => {
  it('renderiza el Form', () => {
    render(<Form><form>Formulario</form></Form>);
    expect(screen.getByText('Formulario')).toBeInTheDocument();
  });
});

