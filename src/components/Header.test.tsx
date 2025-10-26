import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('se renderiza correctamente', () => {
    render(<Header />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});

