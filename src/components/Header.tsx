import { ShoppingCart, Wrench, Settings, History } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartItemsCount: number;
}

export default function Header({ currentView, onNavigate, cartItemsCount }: HeaderProps) {
  return (
    <header className="bg-black text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Wrench className="w-8 h-8 text-blue-500" />
            <h1 className="text-white">Ferretería Total</h1>
          </button>

          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate('catalog')}
              className={currentView === 'catalog' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-white hover:bg-gray-800 hover:text-white'}
            >
              Catálogo
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => onNavigate('sales')}
              className={currentView === 'sales' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-white hover:bg-gray-800 hover:text-white'}
            >
              <History className="w-4 h-4 mr-2" />
              Ventas
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => onNavigate('admin')}
              className={currentView === 'admin' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-white hover:bg-gray-800 hover:text-white'}
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>

            <Button
              variant="ghost"
              onClick={() => onNavigate('cart')}
              className={`relative ${currentView === 'cart' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-white hover:bg-gray-800 hover:text-white'}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Carrito
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
