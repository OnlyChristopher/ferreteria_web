import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.49.2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Prefix para todas las rutas
const prefix = '/make-server-2eb8085d';

// Cliente de Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Middleware para verificar autenticación
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ success: false, error: 'No autorizado' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return c.json({ success: false, error: 'Token inválido o expirado' }, 401);
  }

  c.set('user', user);
  await next();
};

// Middleware para verificar rol de admin
const requireAdmin = async (c: any, next: any) => {
  const user = c.get('user');
  
  if (user.user_metadata?.role !== 'admin') {
    return c.json({ success: false, error: 'Acceso denegado. Se requiere rol de administrador.' }, 403);
  }

  await next();
};

// POST: Registro de usuario
app.post(`${prefix}/signup`, async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return c.json({ success: false, error: 'Faltan campos requeridos' }, 400);
    }

    // Solo permitir rol 'user' o 'admin'
    const userRole = role === 'admin' ? 'admin' : 'user';

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role: userRole,
      },
      // Automáticamente confirmar el email ya que no tenemos servidor de correo configurado
      email_confirm: true,
    });

    if (error) {
      console.log(`Error creating user: ${error.message}`);
      return c.json({ success: false, error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      message: 'Usuario creado exitosamente',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name,
        role: data.user?.user_metadata?.role,
      }
    });
  } catch (error: any) {
    console.log(`Error in signup: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST: Crear usuarios iniciales (admin y usuario de prueba)
app.post(`${prefix}/init-users`, async (c) => {
  try {
    // Crear usuario admin
    const adminEmail = 'admin@ferreteria.com';
    const { data: existingAdmin } = await supabase.auth.admin.listUsers();
    const adminExists = existingAdmin?.users?.some((u: any) => u.email === adminEmail);

    if (!adminExists) {
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'admin123',
        user_metadata: { 
          name: 'Administrador',
          role: 'admin',
        },
        email_confirm: true,
      });
    }

    // Crear usuario de prueba
    const userEmail = 'usuario@ferreteria.com';
    const userExists = existingAdmin?.users?.some((u: any) => u.email === userEmail);

    if (!userExists) {
      await supabase.auth.admin.createUser({
        email: userEmail,
        password: 'user123',
        user_metadata: { 
          name: 'Usuario de Prueba',
          role: 'user',
        },
        email_confirm: true,
      });
    }

    return c.json({ 
      success: true, 
      message: 'Usuarios iniciales creados',
    });
  } catch (error: any) {
    console.log(`Error initializing users: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET: Obtener todos los productos
app.get(`${prefix}/products`, async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ success: true, products });
  } catch (error) {
    console.log(`Error getting products: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET: Obtener un producto por ID
app.get(`${prefix}/products/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }
    
    return c.json({ success: true, product });
  } catch (error) {
    console.log(`Error getting product: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST: Crear un nuevo producto (requiere admin)
app.post(`${prefix}/products`, requireAuth, requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, price, unit, category, stock, imageUrl } = body;
    
    if (!name || !price || !unit) {
      return c.json({ success: false, error: 'Missing required fields: name, price, unit' }, 400);
    }
    
    const id = crypto.randomUUID();
    const product = {
      id,
      name,
      description: description || '',
      price: parseFloat(price),
      unit,
      category: category || 'General',
      stock: parseInt(stock) || 0,
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`product:${id}`, product);
    
    return c.json({ success: true, product });
  } catch (error) {
    console.log(`Error creating product: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// PUT: Actualizar un producto existente (requiere admin)
app.put(`${prefix}/products/:id`, requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existingProduct = await kv.get(`product:${id}`);
    if (!existingProduct) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }
    
    const updatedProduct = {
      ...existingProduct,
      ...body,
      id, // Mantener el mismo ID
      price: body.price ? parseFloat(body.price) : existingProduct.price,
      stock: body.stock !== undefined ? parseInt(body.stock) : existingProduct.stock,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`product:${id}`, updatedProduct);
    
    return c.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log(`Error updating product: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// DELETE: Eliminar un producto (requiere admin)
app.delete(`${prefix}/products/:id`, requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    const existingProduct = await kv.get(`product:${id}`);
    if (!existingProduct) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }
    
    await kv.del(`product:${id}`);
    
    return c.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.log(`Error deleting product: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST: Procesar una venta y actualizar stock
app.post(`${prefix}/sales`, async (c) => {
  try {
    const body = await c.req.json();
    const { items, paymentMethod, customerName, lastFourDigits } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ success: false, error: 'No items in sale' }, 400);
    }
    
    if (!customerName || !customerName.trim()) {
      return c.json({ success: false, error: 'Customer name is required' }, 400);
    }
    
    // Verificar stock disponible para todos los items
    const productIds = items.map((item: any) => item.id);
    const products = await kv.mget(productIds.map(id => `product:${id}`));
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = products[i];
      
      if (!product) {
        return c.json({ success: false, error: `Product ${item.id} not found` }, 404);
      }
      
      if (product.stock < item.quantity) {
        return c.json({ 
          success: false, 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        }, 400);
      }
    }
    
    // Actualizar stock de cada producto
    const updatePromises = items.map(async (item: any) => {
      const product = await kv.get(`product:${item.id}`);
      const updatedProduct = {
        ...product,
        stock: product.stock - item.quantity,
        updatedAt: new Date().toISOString(),
      };
      await kv.set(`product:${item.id}`, updatedProduct);
      return updatedProduct;
    });
    
    await Promise.all(updatePromises);
    
    // Crear registro de venta
    const saleId = crypto.randomUUID();
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    
    // Generar número de operación
    const operationNumber = `OP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    const sale = {
      id: saleId,
      operationNumber,
      date: new Date().toISOString(),
      customerName: customerName.trim(),
      items: items.map((item: any) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
      })),
      total,
      paymentMethod: paymentMethod || 'cash',
      ...(lastFourDigits && { lastFourDigits }),
    };
    
    await kv.set(`sale:${saleId}`, sale);
    
    return c.json({ success: true, sale });
  } catch (error) {
    console.log(`Error processing sale: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET: Obtener historial de ventas (requiere admin)
app.get(`${prefix}/sales`, requireAuth, requireAdmin, async (c) => {
  try {
    const sales = await kv.getByPrefix('sale:');
    // Ordenar por fecha descendente (más recientes primero)
    const sortedSales = sales.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return c.json({ success: true, sales: sortedSales });
  } catch (error) {
    console.log(`Error getting sales: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET: Obtener una venta específica
app.get(`${prefix}/sales/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    const sale = await kv.get(`sale:${id}`);
    
    if (!sale) {
      return c.json({ success: false, error: 'Sale not found' }, 404);
    }
    
    return c.json({ success: true, sale });
  } catch (error) {
    console.log(`Error getting sale: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reinicializar todos los productos (eliminar y crear nuevos) (requiere admin)
app.post(`${prefix}/reset-products`, requireAuth, requireAdmin, async (c) => {
  try {
    // Eliminar todos los productos existentes
    const existingProducts = await kv.getByPrefix('product:');
    const deleteKeys = existingProducts.map((p: any) => `product:${p.id}`);
    if (deleteKeys.length > 0) {
      await kv.mdel(deleteKeys);
    }
      const sampleProducts = [
        {
          id: crypto.randomUUID(),
          name: 'Martillo de Acero',
          description: 'Martillo profesional con mango de fibra de vidrio',
          price: 25.99,
          unit: 'unidad',
          category: 'Herramientas',
          stock: 50,
          imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Destornillador Set',
          description: 'Juego de 6 destornilladores de precision',
          price: 15.50,
          unit: 'set',
          category: 'Herramientas',
          stock: 30,
          imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Tornillos Galvanizados',
          description: 'Tornillos galvanizados 3/4 pulgada',
          price: 8.99,
          unit: 'caja (100 unidades)',
          category: 'Fijaciones',
          stock: 100,
          imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Taladro Eléctrico',
          description: 'Taladro eléctrico 750W con velocidad variable',
          price: 89.99,
          unit: 'unidad',
          category: 'Herramientas Eléctricas',
          stock: 15,
          imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Pintura Interior Blanca',
          description: 'Pintura latex lavable para interiores',
          price: 45.00,
          unit: 'galón',
          category: 'Pinturas',
          stock: 25,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Cinta Métrica 5m',
          description: 'Cinta métrica profesional con freno automático',
          price: 12.50,
          unit: 'unidad',
          category: 'Medición',
          stock: 40,
          imageUrl: 'https://images.unsplash.com/photo-1625225233840-695456021cde?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Sierra Circular',
          description: 'Sierra circular 7 1/4 pulgadas 1200W',
          price: 125.00,
          unit: 'unidad',
          category: 'Herramientas Eléctricas',
          stock: 8,
          imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Cemento Gris',
          description: 'Cemento Portland tipo I para construcción',
          price: 8.50,
          unit: 'saco 50kg',
          category: 'Materiales de Construcción',
          stock: 200,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Llave Inglesa Ajustable',
          description: 'Llave inglesa 12 pulgadas cromada',
          price: 18.75,
          unit: 'unidad',
          category: 'Herramientas',
          stock: 35,
          imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Clavos de Acero',
          description: 'Clavos de acero 2 pulgadas',
          price: 5.99,
          unit: 'caja (500g)',
          category: 'Fijaciones',
          stock: 150,
          imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Brocha para Pintura 3"',
          description: 'Brocha profesional con cerdas sintéticas',
          price: 6.50,
          unit: 'unidad',
          category: 'Pinturas',
          stock: 60,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Nivel de Burbuja',
          description: 'Nivel de aluminio 24 pulgadas con 3 burbujas',
          price: 22.00,
          unit: 'unidad',
          category: 'Medición',
          stock: 20,
          imageUrl: 'https://images.unsplash.com/photo-1625225233840-695456021cde?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Tubo PVC 1/2"',
          description: 'Tubo PVC presión 1/2 pulgada x 6 metros',
          price: 4.25,
          unit: 'unidad',
          category: 'Plomería',
          stock: 120,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Candado de Seguridad',
          description: 'Candado de acero laminado 50mm',
          price: 14.99,
          unit: 'unidad',
          category: 'Seguridad',
          stock: 45,
          imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Cinta Aislante',
          description: 'Cinta aislante eléctrica negra 20m',
          price: 2.75,
          unit: 'unidad',
          category: 'Electricidad',
          stock: 80,
          imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Alicate Universal',
          description: 'Alicate universal 8 pulgadas mango ergonómico',
          price: 16.50,
          unit: 'unidad',
          category: 'Herramientas',
          stock: 40,
          imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Adhesivo Instantáneo',
          description: 'Pegamento instantáneo multiuso 20g',
          price: 3.99,
          unit: 'unidad',
          category: 'Adhesivos',
          stock: 70,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Rodillo para Pintura',
          description: 'Rodillo profesional 9 pulgadas con mango',
          price: 9.25,
          unit: 'unidad',
          category: 'Pinturas',
          stock: 55,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Amoladora Angular',
          description: 'Amoladora angular 4 1/2 pulgadas 900W',
          price: 95.00,
          unit: 'unidad',
          category: 'Herramientas Eléctricas',
          stock: 12,
          imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Guantes de Trabajo',
          description: 'Guantes de cuero reforzados talla L',
          price: 7.50,
          unit: 'par',
          category: 'Seguridad',
          stock: 90,
          imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
          createdAt: new Date().toISOString(),
        },
        // Categoría: Focos
        {
          id: crypto.randomUUID(),
          name: 'Foco LED 9W Blanco Frío',
          description: 'Foco LED de bajo consumo, equivalente a 60W',
          price: 4.99,
          unit: 'unidad',
          category: 'Focos',
          stock: 120,
          imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Foco LED 12W Blanco Cálido',
          description: 'Foco LED cálido ideal para habitaciones',
          price: 5.99,
          unit: 'unidad',
          category: 'Focos',
          stock: 100,
          imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Foco Reflector LED 50W',
          description: 'Reflector LED para exteriores e iluminación amplia',
          price: 24.99,
          unit: 'unidad',
          category: 'Focos',
          stock: 45,
          imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Foco Ahorrador Espiral 20W',
          description: 'Foco ahorrador espiral de larga duración',
          price: 3.50,
          unit: 'unidad',
          category: 'Focos',
          stock: 80,
          imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
          createdAt: new Date().toISOString(),
        },
        // Categoría: Lavandería
        {
          id: crypto.randomUUID(),
          name: 'Tendedero Plegable de Aluminio',
          description: 'Tendedero resistente con capacidad para 15kg',
          price: 29.99,
          unit: 'unidad',
          category: 'Lavandería',
          stock: 35,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Canasto de Ropa Plegable',
          description: 'Canasto de tela plegable con asas reforzadas',
          price: 12.50,
          unit: 'unidad',
          category: 'Lavandería',
          stock: 50,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Ganchos de Ropa Plásticos (50 pzas)',
          description: 'Paquete de 50 ganchos resistentes a la intemperie',
          price: 6.99,
          unit: 'paquete',
          category: 'Lavandería',
          stock: 70,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Tabla de Planchar Plegable',
          description: 'Tabla de planchar con superficie antiadherente',
          price: 34.99,
          unit: 'unidad',
          category: 'Lavandería',
          stock: 25,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        // Categoría: Cocina
        {
          id: crypto.randomUUID(),
          name: 'Llave Mezcladora de Cocina',
          description: 'Llave mezcladora cromada con caño giratorio',
          price: 45.00,
          unit: 'unidad',
          category: 'Cocina',
          stock: 30,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Fregadero de Acero Inoxidable',
          description: 'Fregadero sencillo de 60x50cm acero inoxidable',
          price: 89.99,
          unit: 'unidad',
          category: 'Cocina',
          stock: 15,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Organizador de Cajón',
          description: 'Organizador modular para cubiertos y utensilios',
          price: 8.99,
          unit: 'unidad',
          category: 'Cocina',
          stock: 60,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Rejilla para Fregadero',
          description: 'Rejilla protectora de acero inoxidable',
          price: 6.50,
          unit: 'unidad',
          category: 'Cocina',
          stock: 55,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Repisa Flotante para Cocina',
          description: 'Repisa de madera 60cm con soportes incluidos',
          price: 22.00,
          unit: 'unidad',
          category: 'Cocina',
          stock: 40,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        // Categoría: Baños
        {
          id: crypto.randomUUID(),
          name: 'Regadera Tipo Lluvia',
          description: 'Regadera de techo estilo lluvia 25cm cromada',
          price: 65.00,
          unit: 'unidad',
          category: 'Baños',
          stock: 28,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Espejo de Baño con Marco',
          description: 'Espejo rectangular 60x80cm marco de aluminio',
          price: 42.50,
          unit: 'unidad',
          category: 'Baños',
          stock: 22,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Toallero de Barra Doble',
          description: 'Toallero cromado doble de 60cm',
          price: 18.99,
          unit: 'unidad',
          category: 'Baños',
          stock: 45,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Jabonera de Acero Inoxidable',
          description: 'Jabonera de pared con rejilla antideslizante',
          price: 9.99,
          unit: 'unidad',
          category: 'Baños',
          stock: 65,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Cortina de Baño Impermeable',
          description: 'Cortina 180x180cm con ganchos incluidos',
          price: 14.99,
          unit: 'unidad',
          category: 'Baños',
          stock: 50,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Grifo de Lavabo Monomando',
          description: 'Grifo monomando cromado con válvula de cerámica',
          price: 38.00,
          unit: 'unidad',
          category: 'Baños',
          stock: 32,
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
          createdAt: new Date().toISOString(),
        },
        // Más Herramientas
        {
          id: crypto.randomUUID(),
          name: 'Caja de Herramientas Metálica',
          description: 'Caja metálica de 3 niveles para herramientas',
          price: 38.50,
          unit: 'unidad',
          category: 'Herramientas',
          stock: 30,
          imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Sierra de Mano Profesional',
          description: 'Sierra de mano 20" con mango ergonómico',
          price: 16.99,
          unit: 'unidad',
          category: 'Herramientas',
          stock: 45,
          imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Juego de Llaves Allen',
          description: 'Set de 9 llaves allen métricas',
          price: 11.50,
          unit: 'set',
          category: 'Herramientas',
          stock: 55,
          imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Llave de Tubo Ajustable',
          description: 'Llave de tubo 24" ajustable para plomería',
          price: 24.99,
          unit: 'unidad',
          category: 'Herramientas',
          stock: 35,
          imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Pistola de Calor Industrial',
          description: 'Pistola de calor 2000W con temperatura regulable',
          price: 52.00,
          unit: 'unidad',
          category: 'Herramientas',
          stock: 18,
          imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
          createdAt: new Date().toISOString(),
        },
      ];
      
      for (const product of sampleProducts) {
        await kv.set(`product:${product.id}`, product);
      }
      
      return c.json({ success: true, message: 'Products reset successfully', count: sampleProducts.length });
  } catch (error) {
    console.log(`Error resetting products: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Inicializar algunos productos de ejemplo si la BD está vacía
app.post(`${prefix}/init-sample-data`, async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    
    if (products.length === 0) {
      // Reutilizar la misma lógica de reset-products
      const response = await fetch(`${c.req.url.replace('/init-sample-data', '/reset-products')}`, {
        method: 'POST',
        headers: c.req.raw.headers,
      });
      return response;
    }
    
    return c.json({ success: true, message: 'Data already exists', count: products.length });
  } catch (error) {
    console.log(`Error initializing sample data: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
