import { render, screen } from '@testing-library/react';
import Cart from './Cart';

describe('Cart', () => {
  it('se renderiza correctamente', () => {
    render(<Cart />);
    expect(screen.getByTestId('cart')).toBeInTheDocument();
  });
});

