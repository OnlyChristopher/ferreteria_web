import { useState } from 'react';
import Header from './components/Header';
import ProductCatalog from './components/ProductCatalog';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import SalesHistory from './components/SalesHistory';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from './utils/supabase/info';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  stock: number;
  imageUrl: string;
}

interface CartItem extends Product {
  quantity: number;
}

type View = 'catalog' | 'detail' | 'cart' | 'admin' | 'sales';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (view !== 'detail') {
      setSelectedProductId(null);
    }
  };

  const handleViewDetail = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('detail');
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Actualizar cantidad si ya existe
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        // Agregar nuevo item
        return [...prevItems, { ...product, quantity }];
      }
    });
    
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.success('Producto eliminado del carrito');
  };

  const handleCheckout = async (paymentMethod: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb8085d/sales`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              unit: item.unit,
            })),
            paymentMethod: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const paymentText = paymentMethod === 'cash' ? 'en efectivo' : 'con tarjeta';
        toast.success(`¡Compra exitosa ${paymentText}! Total: S/ ${data.sale.total.toFixed(2)}`);
        setCartItems([]);
        setCurrentView('sales');
      } else {
        toast.error(`Error al procesar la venta: ${data.error}`);
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'catalog':
        return (
          <ProductCatalog
            onViewDetail={handleViewDetail}
            onAddToCart={handleAddToCart}
          />
        );
      case 'detail':
        return selectedProductId ? (
          <ProductDetail
            productId={selectedProductId}
            onBack={() => handleNavigate('catalog')}
            onAddToCart={handleAddToCart}
          />
        ) : null;
      case 'cart':
        return (
          <Cart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
          />
        );
      case 'admin':
        return <AdminPanel />;
      case 'sales':
        return <SalesHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      
      <main className="pb-8">
        {renderView()}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
