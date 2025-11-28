import { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCatalog from './components/ProductCatalog';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import SalesHistory from './components/SalesHistory';
import Login from './components/Login';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { getSupabaseClient } from './utils/supabase/client';
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

interface User {
  id: string;
  email: string | undefined;
  name: string;
  role: 'admin' | 'user';
  accessToken: string;
}

type View = 'catalog' | 'detail' | 'cart' | 'admin' | 'sales';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseClient();

  useEffect(() => {
    // Verificar si hay una sesión activa
    checkSession();
    // Inicializar usuarios de prueba
    initializeUsers();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data.session && data.session.user) {
        const userData = {
          id: data.session.user.id,
          email: data.session.user.email,
          name: data.session.user.user_metadata?.name || 'Usuario',
          role: data.session.user.user_metadata?.role || 'user',
          accessToken: data.session.access_token,
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeUsers = async () => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb8085d/init-users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
    } catch (error) {
      console.error('Error initializing users:', error);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCurrentView('catalog');
      setCartItems([]);
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleNavigate = (view: View) => {
    // Verificar permisos antes de navegar
    if ((view === 'admin' || view === 'sales') && user?.role !== 'admin') {
      toast.error('Acceso denegado. Se requiere rol de administrador.');
      return;
    }
    
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

  const handleCheckout = async (paymentData: any) => {
    try {
      // Los usuarios normales pueden hacer checkout sin autenticación especial
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
            paymentMethod: paymentData.paymentMethod,
            customerName: paymentData.customerName,
            lastFourDigits: paymentData.lastFourDigits,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const paymentText = paymentData.paymentMethod === 'cash' ? 'en efectivo' : 'con tarjeta';
        toast.success(`¡Compra exitosa ${paymentText}! Total: S/ ${data.sale.total.toFixed(2)}`);
        setCartItems([]);
        // Solo redirigir a ventas si es admin
        if (user?.role === 'admin') {
          setCurrentView('sales');
        } else {
          setCurrentView('catalog');
        }
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
        return <AdminPanel accessToken={user?.accessToken || ''} />;
      case 'sales':
        return <SalesHistory accessToken={user?.accessToken || ''} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="pb-8">
        {renderView()}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
