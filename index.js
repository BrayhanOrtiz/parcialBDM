import express from 'express'
import sql from './db.js'

const app = express()
const PORT = 3000

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Algo salió mal!')
})


// CRUD para Restaurante
// 1. Crear restaurante (usando misma convención de ruta)
app.post('/api/restaurantes', async (req, res) => {
  const { id_rest, nombre, ciudad, direccion, fecha_apertura } = req.body
  
  // Validación básica
  if (!nombre || !ciudad || !direccion) {
    return res.status(400).json({ 
      message: 'Nombre, ciudad y dirección son requeridos' 
    })
  }

  try {
    const result = await sql`
      INSERT INTO Restaurante 
        (id_rest, nombre, ciudad, direccion, fecha_apertura)
      VALUES 
        (${id_rest}, ${nombre}, ${ciudad}, ${direccion}, ${fecha_apertura})
      RETURNING *
    `
    
    res.status(201).json({
      message: 'Restaurante creado correctamente',
      data: result[0]
    })
  } catch (error) {
    console.error('Error en POST /api/restaurantes:', error)
    res.status(500).json({
      message: 'Error al crear restaurante',
      error: error.message // Solo enviamos el mensaje por seguridad
    })
  }
})

// 2. Obtener todos los restaurantes (con paginación básica)
app.get('/api/restaurantes', async (req, res) => {
  try {
    const restaurantes = await sql`SELECT * FROM Restaurante ORDER BY nombre`
    res.status(200).json({
      count: restaurantes.length,
      data: restaurantes
    })
  } catch (error) {
    console.error('Error en GET /api/restaurantes:', error)
    res.status(500).json({
      message: 'Error al obtener restaurantes',
      error: error.message
    })
  }
})

// 3. Actualizar restaurante (con validación de existencia)
app.put('/api/restaurantes/:id', async (req, res) => {
  const { id } = req.params
  const { nombre, ciudad, direccion, fecha_apertura } = req.body

  try {
    // Primero verificamos si existe
    const [existente] = await sql`
      SELECT 1 FROM Restaurante WHERE id_rest = ${id}
    `
    
    if (!existente) {
      return res.status(404).json({ message: 'Restaurante no encontrado' })
    }

    const [updated] = await sql`
      UPDATE Restaurante SET
        nombre = ${nombre},
        ciudad = ${ciudad},
        direccion = ${direccion},
        fecha_apertura = ${fecha_apertura}
      WHERE id_rest = ${id}
      RETURNING *
    `

    res.status(200).json({
      message: 'Restaurante actualizado',
      data: updated
    })
  } catch (error) {
    console.error('Error en PUT /api/restaurantes/:id:', error)
    res.status(500).json({
      message: 'Error al actualizar',
      error: error.message
    })
  }
})

// 4. Eliminar restaurante
app.delete('/api/restaurantes/:id', async (req, res) => {
  const { id } = req.params

  try {
    const [deleted] = await sql`
      DELETE FROM Restaurante 
      WHERE id_rest = ${id}
      RETURNING *
    `

    if (!deleted) {
      return res.status(404).json({ message: 'Restaurante no encontrado' })
    }

    res.status(200).json({
      message: 'Restaurante eliminado',
      data: deleted
    })
  } catch (error) {
    console.error('Error en DELETE /api/restaurantes/:id:', error)
    res.status(500).json({
      message: 'Error al eliminar',
      error: error.message
    })
  }
})


//PRODUCTOS CRUD
// 1. Crear producto
app.post('/api/productos', async (req, res) => {
  const { id_prod, nombre, precio } = req.body

  if (!nombre || precio === undefined) {
    return res.status(400).json({
      message: 'Nombre y precio son requeridos'
    })
  }

  try {
    const result = await sql`
      INSERT INTO Producto 
        (id_prod, nombre, precio)
      VALUES 
        (${id_prod}, ${nombre}, ${precio})
      RETURNING *
    `

    res.status(201).json({
      message: 'Producto creado correctamente',
      data: result[0]
    })
  } catch (error) {
    console.error('Error en POST /api/productos:', error)
    res.status(500).json({
      message: 'Error al crear producto',
      error: error.message
    })
  }
})

// 2. Obtener todos los productos (con paginación básica)

app.get('/api/productos', async (req, res) => {
  try {
    const productos = await sql`
      SELECT * FROM Producto ORDER BY nombre
    `
    res.status(200).json({
      count: productos.length,
      data: productos
    })
  } catch (error) {
    console.error('Error en GET /api/productos:', error)
    res.status(500).json({
      message: 'Error al obtener productos',
      error: error.message
    })
  }
})

// 3. Actualizar producto (con validación de existencia)

app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params
  const { nombre, precio } = req.body

  try {
    const [existente] = await sql`
      SELECT 1 FROM Producto WHERE id_prod = ${id}
    `
    
    if (!existente) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    const [updated] = await sql`
      UPDATE Producto SET
        nombre = ${nombre},
        precio = ${precio}
      WHERE id_prod = ${id}
      RETURNING *
    `

    res.status(200).json({
      message: 'Producto actualizado',
      data: updated
    })
  } catch (error) {
    console.error('Error en PUT /api/productos/:id:', error)
    res.status(500).json({
      message: 'Error al actualizar producto',
      error: error.message
    })
  }
})


// 4. Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params

  try {
    const [deleted] = await sql`
      DELETE FROM Producto 
      WHERE id_prod = ${id}
      RETURNING *
    `

    if (!deleted) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.status(200).json({
      message: 'Producto eliminado',
      data: deleted
    })
  } catch (error) {
    console.error('Error en DELETE /api/productos/:id:', error)
    res.status(500).json({
      message: 'Error al eliminar producto',
      error: error.message
    })
  }
})


//pedidos CRUD
app.post('/api/pedidos', async (req, res) => {
  const { id_pedido, fecha, total, id_rest } = req.body;

  // Validar que el restaurante existe
  const [restaurante] = await sql`
    SELECT 1 FROM Restaurante WHERE id_rest = ${id_rest}
  `;

  // Si no existe el restaurante, responder con error
  if (!restaurante) {
    return res.status(400).json({
      message: 'Restaurante no encontrado'
    });
  }

  // Si el restaurante existe, procedemos a crear el pedido
  try {
    const result = await sql`
      INSERT INTO Pedido 
        (id_pedido, fecha, total, id_rest)
      VALUES 
        (${id_pedido}, ${fecha}, ${total}, ${id_rest})
      RETURNING *
    `;

    res.status(201).json({
      message: 'Pedido creado correctamente',
      data: result[0]
    });
  } catch (error) {
    console.error('Error en POST /api/pedidos:', error);
    res.status(500).json({
      message: 'Error al crear el pedido',
      error: error.message // Solo enviamos el mensaje por seguridad
    });
  }
});


app.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await sql`
      SELECT * FROM Pedido ORDER BY fecha DESC
    `;
    res.status(200).json({
      count: pedidos.length,
      data: pedidos,
    });
  } catch (error) {
    console.error('Error en GET /api/pedidos:', error);
    res.status(500).json({
      message: 'Error al obtener pedidos',
      error: error.message,
    });
  }
});

app.get('/api/pedidos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener el pedido
    const [pedido] = await sql`
      SELECT * FROM Pedido WHERE id_pedido = ${id}
    `;

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Obtener los detalles del pedido
    const detalles = await sql`
      SELECT dp.*, p.Nombre as producto_nombre
      FROM DetallePedido dp
      JOIN Producto p ON dp.id_prod = p.id_prod
      WHERE dp.id_pedido = ${id}
    `;

    res.status(200).json({
      pedido,
      detalles,
    });
  } catch (error) {
    console.error('Error en GET /api/pedidos/:id:', error);
    res.status(500).json({
      message: 'Error al obtener pedido',
      error: error.message,
    });
  }
});

// Actualizar pedido
app.put('/api/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha, total, detalles } = req.body;

  try {
    // Verificar si el pedido existe
    const [pedidoExistente] = await sql`
      SELECT 1 FROM Pedido WHERE id_pedido = ${id}
    `;
    
    if (!pedidoExistente) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Actualizar el pedido
    const [pedidoActualizado] = await sql`
      UPDATE Pedido
      SET fecha = ${fecha}, total = ${total}
      WHERE id_pedido = ${id}
      RETURNING *
    `;

    // Eliminar los detalles anteriores
    await sql`
      DELETE FROM DetallePedido WHERE id_pedido = ${id}
    `;

    // Insertar los nuevos detalles
    for (const detalle of detalles) {
      const { id_prod, cantidad, subtotal } = detalle;

      // Si id_detalle no se envía, la base de datos lo generará automáticamente.
      await sql`
        INSERT INTO DetallePedido (Cantidad, Subtotal, id_pedido, id_prod)
        VALUES (${cantidad}, ${subtotal}, ${id}, ${id_prod})
      `;
    }

    res.status(200).json({
      message: 'Pedido actualizado correctamente',
      data: pedidoActualizado,
    });
  } catch (error) {
    console.error('Error en PUT /api/pedidos/:id:', error);
    res.status(500).json({
      message: 'Error al actualizar pedido',
      error: error.message,
    });
  }
});

// Eliminar pedido

app.delete('/api/pedidos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar los detalles del pedido
    await sql`
      DELETE FROM DetallePedido WHERE id_pedido = ${id}
    `;

    // Eliminar el pedido
    const [pedidoEliminado] = await sql`
      DELETE FROM Pedido WHERE id_pedido = ${id} RETURNING *
    `;

    if (!pedidoEliminado) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.status(200).json({
      message: 'Pedido eliminado correctamente',
      data: pedidoEliminado,
    });
  } catch (error) {
    console.error('Error en DELETE /api/pedidos/:id:', error);
    res.status(500).json({
      message: 'Error al eliminar pedido',
      error: error.message,
    });
  }
});


//DETALLES-PEDIDO
// Crear detalle de pedido
app.post('/api/detalles-pedido', async (req, res) => {
  const { id_detalle, cantidad, subtotal, id_pedido, id_prod } = req.body;

  // Validar que el pedido existe
  const [pedidoExistente] = await sql`
    SELECT 1 FROM Pedido WHERE id_pedido = ${id_pedido}
  `;
  if (!pedidoExistente) {
    return res.status(400).json({ message: 'Pedido no encontrado' });
  }

  // Validar que el producto existe
  const [productoExistente] = await sql`
    SELECT 1 FROM Producto WHERE id_prod = ${id_prod}
  `;
  if (!productoExistente) {
    return res.status(400).json({ message: 'Producto no encontrado' });
  }

  try {
    const result = await sql`
      INSERT INTO DetallePedido 
        (id_detalle, cantidad, subtotal, id_pedido, id_prod)
      VALUES 
        (${id_detalle}, ${cantidad}, ${subtotal}, ${id_pedido}, ${id_prod})
      RETURNING *
    `;

    res.status(201).json({
      message: 'Detalle del pedido agregado correctamente',
      data: result[0]
    });
  } catch (error) {
    console.error('Error en POST /api/detalles-pedido:', error);
    res.status(500).json({
      message: 'Error al agregar detalle del pedido',
      error: error.message
    });
  }
});

// Obtener todos los detalles de un pedido
app.get('/api/detalles-pedido/:id_pedido', async (req, res) => {
  const { id_pedido } = req.params;

  try {
    const detalles = await sql`
      SELECT p.Nombre, dp.Cantidad, dp.Subtotal
      FROM DetallePedido dp
      JOIN Producto p ON dp.id_prod = p.id_prod
      WHERE dp.id_pedido = ${id_pedido}
    `;

    res.status(200).json({
      count: detalles.length,
      data: detalles
    });
  } catch (error) {
    console.error('Error en GET /api/detalles-pedido/:id_pedido:', error);
    res.status(500).json({
      message: 'Error al obtener detalles del pedido',
      error: error.message
    });
  }
});

// Actualizar detalle de pedido

app.put('/api/detalles-pedido/:id_detalle', async (req, res) => {
  const { id_detalle } = req.params;
  const { cantidad, subtotal } = req.body;

  try {
    // Verificar si el detalle del pedido existe
    const [detalleExistente] = await sql`
      SELECT 1 FROM DetallePedido WHERE id_detalle = ${id_detalle}
    `;
    if (!detalleExistente) {
      return res.status(404).json({ message: 'Detalle de pedido no encontrado' });
    }

    // Actualizar el detalle del pedido
    const [updated] = await sql`
      UPDATE DetallePedido 
      SET cantidad = ${cantidad}, subtotal = ${subtotal}
      WHERE id_detalle = ${id_detalle}
      RETURNING *
    `;

    res.status(200).json({
      message: 'Detalle del pedido actualizado',
      data: updated
    });
  } catch (error) {
    console.error('Error en PUT /api/detalles-pedido/:id_detalle:', error);
    res.status(500).json({
      message: 'Error al actualizar detalle del pedido',
      error: error.message
    });
  }
});
//eliminar detalle de pedido
app.delete('/api/detalles-pedido/:id_detalle', async (req, res) => {
  const { id_detalle } = req.params;

  try {
    // Verificar si el detalle del pedido existe
    const [detalleExistente] = await sql`
      SELECT 1 FROM DetallePedido WHERE id_detalle = ${id_detalle}
    `;
    if (!detalleExistente) {
      return res.status(404).json({ message: 'Detalle de pedido no encontrado' });
    }

    // Eliminar el detalle del pedido
    const [deleted] = await sql`
      DELETE FROM DetallePedido WHERE id_detalle = ${id_detalle} RETURNING *
    `;

    res.status(200).json({
      message: 'Detalle del pedido eliminado',
      data: deleted
    });
  } catch (error) {
    console.error('Error en DELETE /api/detalles-pedido/:id_detalle:', error);
    res.status(500).json({
      message: 'Error al eliminar detalle del pedido',
      error: error.message
    });
  }
});



//EMPLEADO CRUD
app.post('/api/empleados', async (req, res) => {
  const { id_empleado, Nombre, Rol, id_rest } = req.body;

  // Validar que el restaurante existe
  const [restaurante] = await sql`
    SELECT 1 FROM Restaurante WHERE id_rest = ${id_rest}
  `;

  // Si no existe el restaurante, responder con error
  if (!restaurante) {
    return res.status(400).json({
      message: 'Restaurante no encontrado'
    });
  }

  try {
    const result = await sql`
      INSERT INTO Empleado 
        (id_empleado, Nombre, Rol, id_rest)
      VALUES 
        (${id_empleado}, ${Nombre}, ${Rol}, ${id_rest})
      RETURNING *
    `;

    res.status(201).json({
      message: 'Empleado creado correctamente',
      data: result[0]
    });
  } catch (error) {
    console.error('Error en POST /api/empleados:', error);
    res.status(500).json({
      message: 'Error al crear el empleado',
      error: error.message
    });
  }
});

// Obtener todos los empleados (con paginación básica)
// Obtener todos los empleados
app.get('/api/empleados', async (req, res) => {
  try {
    const empleados = await sql`
      SELECT * FROM Empleado
    `;
    res.status(200).json({
      count: empleados.length,
      data: empleados,
    });
  } catch (error) {
    console.error('Error en GET /api/empleados:', error);
    res.status(500).json({
      message: 'Error al obtener empleados',
      error: error.message,
    });
  }
});


// Actualizar empleado (con validación de existencia)
app.put('/api/empleados/:id', async (req, res) => {
  const { id } = req.params;
  const { Nombre, Rol, id_rest } = req.body;

  try {
    // Verificar si el empleado existe
    const [empleadoExistente] = await sql`
      SELECT 1 FROM Empleado WHERE id_empleado = ${id}
    `;

    if (!empleadoExistente) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Verificar que el restaurante existe
    const [restaurante] = await sql`
      SELECT 1 FROM Restaurante WHERE id_rest = ${id_rest}
    `;

    if (!restaurante) {
      return res.status(400).json({ message: 'Restaurante no encontrado' });
    }

    // Actualizar el empleado
    const [empleadoActualizado] = await sql`
      UPDATE Empleado
      SET Nombre = ${Nombre}, Rol = ${Rol}, id_rest = ${id_rest}
      WHERE id_empleado = ${id}
      RETURNING *
    `;

    res.status(200).json({
      message: 'Empleado actualizado correctamente',
      data: empleadoActualizado
    });
  } catch (error) {
    console.error('Error en PUT /api/empleados/:id:', error);
    res.status(500).json({
      message: 'Error al actualizar empleado',
      error: error.message
    });
  }
});

// Eliminar empleado
app.delete('/api/empleados/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar el empleado
    const [empleadoEliminado] = await sql`
      DELETE FROM Empleado WHERE id_empleado = ${id} RETURNING *
    `;

    if (!empleadoEliminado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.status(200).json({
      message: 'Empleado eliminado correctamente',
      data: empleadoEliminado
    });
  } catch (error) {
    console.error('Error en DELETE /api/empleados/:id:', error);
    res.status(500).json({
      message: 'Error al eliminar empleado',
      error: error.message
    });
  }
});




//Obtener todos los productos de un pedido específico
app.get('/api/pedido-productos/:id_pedido', async (req, res) => {
  const { id_pedido } = req.params;

  try {
    const result = await sql`
      SELECT p.Nombre AS Producto, dp.Cantidad, dp.Subtotal
      FROM DetallePedido dp
      JOIN Producto p ON dp.id_prod = p.id_prod
      WHERE dp.id_pedido = ${id_pedido};
    `;

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error('Error en GET /api/pedido-productos/:id_pedido:', error);
    res.status(500).json({
      message: 'Error al obtener productos del pedido',
      error: error.message,
    });
  }
});

//Obtener los productos más vendidos (más de X unidades)
app.get('/api/productos-mas-vendidos', async (req, res) => {
  const { unidades } = req.query; // Obtenemos el valor de X (unidades) desde los parámetros de la consulta

  if (!unidades) {
    return res.status(400).json({ message: 'Se debe especificar el número de unidades' });
  }

  try {
    // Ejecutar la consulta
    const productosMasVendidos = await sql`
      SELECT p.Nombre AS Producto, SUM(dp.Cantidad) AS Unidades_Vendidas
      FROM DetallePedido dp
      JOIN Producto p ON dp.id_prod = p.id_prod
      GROUP BY p.id_prod
      HAVING SUM(dp.Cantidad) > ${unidades}
    `;

    // Verificamos si la consulta devuelve resultados
    if (productosMasVendidos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos con más de ' + unidades + ' unidades vendidas' });
    }

    res.status(200).json({
      count: productosMasVendidos.length,
      data: productosMasVendidos
    });
  } catch (error) {
    console.error('Error en GET /api/productos-mas-vendidos:', error);
    res.status(500).json({
      message: 'Error al obtener productos más vendidos',
      error: error.message
    });
  }
});

//Obtener el total de ventas por restaurante

app.get('/api/ventas-por-restaurante', async (req, res) => {
  try {
    const resultados = await sql`
      SELECT r.Nombre AS Restaurante, SUM(p.Total) AS Total_Ventas
      FROM Pedido p
      JOIN Restaurante r ON p.id_rest = r.id_rest
      GROUP BY r.id_rest, r.Nombre
      ORDER BY Total_Ventas DESC
    `;

    res.status(200).json({
      count: resultados.length,
      data: resultados
    });
  } catch (error) {
    console.error('Error en GET /api/ventas-por-restaurante:', error);
    res.status(500).json({
      message: 'Error al obtener ventas por restaurante',
      error: error.message
    });
  }
});

//Obtener los pedidos realizados en una fecha específica
app.get('/api/pedidos-por-fecha/:fecha', async (req, res) => {
  const { fecha } = req.params;

  try {
    const pedidos = await sql`
      SELECT * FROM Pedido WHERE fecha = ${fecha}
    `;

    res.status(200).json({
      count: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    console.error('Error en GET /api/pedidos-por-fecha/:fecha:', error);
    res.status(500).json({
      message: 'Error al obtener pedidos por fecha',
      error: error.message
    });
  }
});

// Obtener los empleados por rol en un restaurante
app.get('/api/empleados-por-rol/:id_rest', async (req, res) => {
  const { id_rest } = req.params;

  try {
    const empleados = await sql`
      SELECT Rol, COUNT(*) AS cantidad_empleados
      FROM Empleado
      WHERE id_rest = ${id_rest}
      GROUP BY Rol
    `;

    res.status(200).json({
      data: empleados
    });
  } catch (error) {
    console.error('Error en GET /api/empleados-por-rol/:id_rest:', error);
    res.status(500).json({
      message: 'Error al obtener empleados por rol',
      error: error.message
    });
  }
});




// Test de conexión a DB
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`
    res.status(200).json({
      status: 'success',
      time: result[0].now
    })
  } catch (error) {
    console.error('Error de conexión a DB:', error)
    res.status(500).json({
      status: 'error',
      message: 'Error de conexión a la base de datos'
    })
  }
})

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

// Manejo de cierre
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor cerrado')
  })
})