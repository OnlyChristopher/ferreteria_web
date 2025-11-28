import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Calendar, DollarSign, ShoppingBag, TrendingUp, CreditCard, Wallet } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

interface Sale {
  id: string;
  operationNumber?: string;
  date: string;
  customerName?: string;
  items: SaleItem[];
  total: number;
  paymentMethod?: string;
  lastFourDigits?: string;
}

interface SalesHistoryProps {
  accessToken: string;
}

export default function SalesHistory({ accessToken }: SalesHistoryProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb8085d/sales`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSales(data.sales);
      } else {
        console.error('Error loading sales:', data.error);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = sales.length;
  const totalItems = sales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial de ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-black mb-2">Historial de Ventas</h1>
        <p className="text-gray-600">Registro completo de todas las transacciones realizadas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Ventas</CardTitle>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">{totalSales}</div>
            <p className="text-xs text-gray-500 mt-1">Transacciones completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Ingresos Totales</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">S/ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Sin IVA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Productos Vendidos</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">{totalItems}</div>
            <p className="text-xs text-gray-500 mt-1">Unidades totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-black mb-2">No hay ventas registradas</h3>
              <p className="text-gray-500">Las ventas aparecerán aquí cuando se completen compras</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Operación</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">
                        {sale.operationNumber || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{sale.customerName || 'Sin nombre'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatDate(sale.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {sale.items.length} {sale.items.length === 1 ? 'producto' : 'productos'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {sale.paymentMethod === 'card' ? (
                            <>
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              <div className="flex flex-col">
                                <span className="text-sm">Tarjeta</span>
                                {sale.lastFourDigits && (
                                  <span className="text-xs text-gray-500">**** {sale.lastFourDigits}</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <Wallet className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Efectivo</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-600">
                        S/ {sale.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSale(sale)}
                            >
                              Ver Detalle
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalle de Venta</DialogTitle>
                              <DialogDescription>
                                Información completa de la transacción
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedSale && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="text-sm text-gray-500">Nº de Operación</p>
                                    <p className="font-mono text-sm">{selectedSale.operationNumber || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Cliente</p>
                                    <p className="text-sm">{selectedSale.customerName || 'Sin nombre'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Fecha</p>
                                    <p className="text-sm">{formatDate(selectedSale.date)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Método de Pago</p>
                                    <div className="flex items-center gap-2">
                                      {selectedSale.paymentMethod === 'card' ? (
                                        <>
                                          <CreditCard className="w-4 h-4 text-blue-600" />
                                          <div className="flex flex-col">
                                            <span className="text-sm">Tarjeta de Crédito</span>
                                            {selectedSale.lastFourDigits && (
                                              <span className="text-xs text-gray-500">**** {selectedSale.lastFourDigits}</span>
                                            )}
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <Wallet className="w-4 h-4 text-green-600" />
                                          <span className="text-sm">Efectivo</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-black mb-3">Productos</h4>
                                  <div className="space-y-2">
                                    {selectedSale.items.map((item, index) => (
                                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <div className="flex-1">
                                          <p>{item.productName}</p>
                                          <p className="text-sm text-gray-500">
                                            {item.quantity} {item.unit} × S/ {item.price.toFixed(2)}
                                          </p>
                                        </div>
                                        <p className="text-blue-600">
                                          S/ {(item.quantity * item.price).toFixed(2)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                  <div className="flex justify-between border-t pt-2">
                                    <span>Total Pagado:</span>
                                    <span className="text-blue-600">
                                      S/ {selectedSale.total.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
