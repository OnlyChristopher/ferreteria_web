import { render, screen } from '@testing-library/react';
import ProductDetail from './ProductDetail';

describe('ProductDetail', () => {
  it('se renderiza correctamente', () => {
    render(<ProductDetail />);
    expect(screen.getByTestId('product-detail')).toBeInTheDocument();
  });
});
import { render, screen } from '@testing-library/react';
import AdminPanel from './AdminPanel';

describe('AdminPanel', () => {
  it('se renderiza correctamente', () => {
    render(<AdminPanel />);
    expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
  });
});

