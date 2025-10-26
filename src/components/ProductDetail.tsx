import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

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

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductDetail({ productId, onBack, onAddToCart }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb8085d/products/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setProduct(data.product);
      } else {
        console.error('Error loading product:', data.error);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product, quantity);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <p className="text-center text-gray-500">Producto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={onBack} variant="ghost" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al catálogo
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagen del producto */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover max-h-[500px]"
          />
        </div>

        {/* Información del producto */}
        <div className="flex flex-col">
          <Badge className="w-fit mb-4 bg-blue-600">{product.category}</Badge>
          
          <h1 className="text-black mb-4">{product.name}</h1>
          
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-blue-600">S/ {product.price.toFixed(2)}</span>
            <span className="text-gray-500">/ {product.unit}</span>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-black mb-2">Descripción</h3>
              <p className="text-gray-600">{product.description}</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Categoría</p>
                  <p>{product.category}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Unidad</p>
                  <p>{product.unit}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Disponibilidad</p>
                  {product.stock > 0 ? (
                    <p className="text-green-600">{product.stock} en stock</p>
                  ) : (
                    <p className="text-red-600">Agotado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selector de cantidad */}
          {product.stock > 0 && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700">Cantidad:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Agregar al carrito - S/ {(product.price * quantity).toFixed(2)}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
