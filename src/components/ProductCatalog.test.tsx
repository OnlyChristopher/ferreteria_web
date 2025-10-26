import { render, screen } from '@testing-library/react';
import ProductCatalog from './ProductCatalog';

describe('ProductCatalog', () => {
  it('se renderiza correctamente', () => {
    render(<ProductCatalog />);
    expect(screen.getByTestId('product-catalog')).toBeInTheDocument();
  });
});

