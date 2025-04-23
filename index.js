import express from 'express'
import sql from './db.js'

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// INSERTAR DATOS PARA LAS DIFERENTES TABLAS:
// Crear registro en la tabla persona
app.post('/api/guardarRestaurante', async (req, res) => {
    const { id_rest,nombre, ciudad, direccion, fecha_apertura } = req.body
    try {
      const result = await sql`
        INSERT INTO Restaurante (id_rest, nombre, ciudad, direccion, fecha_apertura)
        VALUES (${id_rest},${nombre}, ${ciudad}, ${direccion}, ${fecha_apertura})
        RETURNING *`
      
      res.status(201).json({
        message: 'Guardado correctamente',
        result
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        message: 'Error al guardar',
        details: error
      })
    }

  })



 // Obtener la conexion a base de datos
 app.get('/api/test-db', async (req, res) => {
    try {
      const result = await sql`SELECT NOW()`
      res.status(200).json({
        message: 'Conexión a la base de datos exitosa 🎉',
        hora: result[0].now
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        message: 'Error de conexión a la base de datos 😓',
        error
      })
    }
  })
  

app.listen(PORT, () => {
  console.log(`Servidor Corriendo en http://localhost:${PORT}`) 
})