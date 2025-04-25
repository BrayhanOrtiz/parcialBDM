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