import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Wallet } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  imageUrl: string;
  stock: number;
}

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (paymentData: any) => void;
}

export default function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.replace(/\//g, '').length <= 4) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    if (value.length <= 100) {
      setCardName(value.toUpperCase());
    }
  };

  const validateExpiryDate = (value: string): boolean => {
    if (!value || value.length !== 5) return false;
    
    const [month, year] = value.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt('20' + year);
    
    if (monthNum < 1 || monthNum > 12) return false;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    
    return true;
  };

  const handleCompletePayment = () => {
    // Validar nombre del cliente
    if (!customerName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    // Validaciones adicionales para tarjeta
    if (paymentMethod === 'card') {
      if (!cardName.trim()) {
        alert('Por favor ingresa el nombre en la tarjeta');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        alert('El número de tarjeta debe tener 16 dígitos');
        return;
      }
      if (!validateExpiryDate(expiryDate)) {
        alert('Por favor ingresa una fecha de expiración válida y futura');
        return;
      }
      if (cvv.length < 3 || cvv.length > 4) {
        alert('El CVV debe tener 3 o 4 dígitos');
        return;
      }
    }

    const paymentData = {
      paymentMethod,
      customerName: customerName.trim(),
      ...(paymentMethod === 'card' && {
        lastFourDigits: cardNumber.replace(/\s/g, '').slice(-4),
      }),
    };

    setIsPaymentDialogOpen(false);
    onCheckout(paymentData);
    
    // Reset form
    setPaymentMethod('cash');
    setCustomerName('');
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
  };

  const handleDialogClose = (open: boolean) => {
    setIsPaymentDialogOpen(open);
    if (!open) {
      // Reset temporal de campos de tarjeta cuando se cierra
      setCardNumber('');
      setCardName('');
      setExpiryDate('');
      setCvv('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="py-16">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-black mb-2">Tu carrito está vacío</h3>
            <p className="text-gray-500 mb-6">Agrega productos desde el catálogo</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-black mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-black mb-1 truncate">{item.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{item.unit}</p>
                    <p className="text-blue-600">S/ {item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <p className="text-black">
                      S/ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="text-blue-600">S/ {total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                onClick={() => setIsPaymentDialogOpen(true)}
              >
                Proceder al Pago
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-4">
              <h4 className="text-black mb-2">Información de Envío</h4>
              <p className="text-gray-600 text-sm">
                • Recojo en tienda disponible<br />
                • Entrega a domicilio: 2-3 días hábiles<br />
                • Costo de envío según distrito<br />
                • Devoluciones: hasta 15 días
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Método de Pago</DialogTitle>
            <DialogDescription>
              Selecciona tu método de pago preferido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Campo de nombre del cliente (siempre visible) */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre Completo *</Label>
              <Input
                id="customerName"
                placeholder="Ingresa tu nombre completo"
                value={customerName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                  if (value.length <= 100) {
                    setCustomerName(value);
                  }
                }}
                required
              />
            </div>

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <div>
                    <p>Efectivo</p>
                    <p className="text-sm text-gray-500">Pago en efectivo al recibir</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <p>Tarjeta de Crédito/Débito</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === 'card' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número de Tarjeta *</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="pl-10"
                      required
                    />
                    <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Nombre en la Tarjeta *</Label>
                  <Input
                    id="cardName"
                    placeholder="JUAN PÉREZ"
                    value={cardName}
                    onChange={handleCardNameChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Fecha de Expiración *</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={handleCvvChange}
                      type="password"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Tu información está protegida y encriptada</span>
                </div>
              </div>
            )}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between pt-2 border-t">
                <span>Total a Pagar:</span>
                <span className="text-blue-600">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleDialogClose(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleCompletePayment}
                disabled={!customerName.trim() || (paymentMethod === 'card' && (!cardNumber || !cardName || !expiryDate || !cvv))}
              >
                Confirmar Pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
