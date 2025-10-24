import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Prefix para todas las rutas
const prefix = '/make-server-2eb8085d';

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

// POST: Crear un nuevo producto
app.post(`${prefix}/products`, async (c) => {
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

// PUT: Actualizar un producto existente
app.put(`${prefix}/products/:id`, async (c) => {
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

// DELETE: Eliminar un producto
app.delete(`${prefix}/products/:id`, async (c) => {
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

// Inicializar algunos productos de ejemplo si la BD está vacía
app.post(`${prefix}/init-sample-data`, async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    
    if (products.length === 0) {
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
      ];
      
      for (const product of sampleProducts) {
        await kv.set(`product:${product.id}`, product);
      }
      
      return c.json({ success: true, message: 'Sample data initialized', count: sampleProducts.length });
    }
    
    return c.json({ success: true, message: 'Data already exists', count: products.length });
  } catch (error) {
    console.log(`Error initializing sample data: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
