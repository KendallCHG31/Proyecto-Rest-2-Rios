const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('./models/db');


const app = express();
app.use(express.static('public'));
const SECRET_KEY = 'tu_clave_secreta_super_segura';

app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware autenticación JWT
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuarioId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Generar token JWT con expiración 8 horas
function generarToken(id) {
  return jwt.sign({ id }, SECRET_KEY, { expiresIn: '8h' });
}

// Rutas vistas
app.get('/', (req, res) => res.send('Servidor funcionando correctamente ✅'));
app.get('/registro', (req, res) => res.sendFile(path.join(__dirname, 'views', 'registro.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, 'views', 'menu.html')));

// Registro de usuario
app.post('/api/registrar', async (req, res) => {
  const { nombre, telefono, correo, contrasena, tipo_usuario = 'usuario' } = req.body;

  if (!nombre || !telefono || !correo || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const tiposPermitidos = ['administrador', 'empleado', 'usuario'];
  if (!tiposPermitidos.includes(tipo_usuario)) {
    return res.status(400).json({ error: `tipo_usuario inválido. Debe ser uno de: ${tiposPermitidos.join(', ')}` });
  }

  try {
    const [existe] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existe.length) return res.status(409).json({ error: 'El correo ya está registrado' });

    const hash = await bcrypt.hash(contrasena, 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, telefono, correo, contrasena, tipo_usuario) VALUES (?, ?, ?, ?, ?)',
      [nombre, telefono, correo, hash, tipo_usuario]
    );

    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error.message);
    res.status(500).json({ error: 'Error del servidor al registrar usuario' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = usuarios[0];

    const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const token = generarToken(usuario.id);

    res.json({ token, tipo_usuario: usuario.tipo_usuario });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Insertar menú
app.post('/api/menus', async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  if (!nombre || !descripcion || !precio) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    await pool.query('INSERT INTO menu (nombre, descripcion, precio) VALUES (?, ?, ?)', [nombre, descripcion, precio]);
    res.status(201).json({ mensaje: 'Menú guardado correctamente' });
  } catch (error) {
    console.error('❌ Error al guardar menú:', error.message);
    res.status(500).json({ error: 'Error al guardar menú' });
  }
});
//eliminar menu
app.delete('/api/menus/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM menu WHERE id_menu = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    res.json({ mensaje: 'Menú eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar menú:', error.message);
    res.status(500).json({ error: 'Error al eliminar menú' });
  }
});

// Editar menú 
app.put('/api/menus/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio } = req.body;

  if (!nombre || !descripcion || !precio) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE menu SET nombre = ?, descripcion = ?, precio = ? WHERE id_menu = ?',
      [nombre, descripcion, precio, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }

    res.json({ mensaje: 'Menú actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar menú:', error.message);
    res.status(500).json({ error: 'Error al actualizar menú' });
  }
});


// Listar menús
app.get('/api/menus', async (req, res) => {
  try {
    const [menus] = await pool.query('SELECT * FROM menu');
    res.json(menus);
  } catch (error) {
    console.error('❌ Error al obtener menús:', error.message);
    res.status(500).json({ error: 'Error al obtener menús' });
  }
});


//listar usuarios
app.get('/api/usuarios', authMiddleware, async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT id, nombre, telefono, correo, tipo_usuario FROM usuarios');
    res.json(usuarios);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});



// Cambiar tipo de usuario - PUT /api/usuarios/:id/tipo
app.put('/api/usuarios/:id/tipo', authMiddleware, async (req, res) => {
  const idUsuario = parseInt(req.params.id);
  const { tipo_usuario } = req.body;

  const tiposPermitidos = ['administrador', 'empleado', 'usuario'];
  if (!tiposPermitidos.includes(tipo_usuario)) {
    return res.status(400).json({ error: `Tipo inválido. Debe ser uno de: ${tiposPermitidos.join(', ')}` });
  }

  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET tipo_usuario = ? WHERE id = ?',
      [tipo_usuario, idUsuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Tipo de usuario actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al cambiar tipo de usuario:', error.message);
    res.status(500).json({ error: 'Error en el servidor al cambiar tipo de usuario' });
  }
});

// Crear reservación con validación

app.post('/api/reservar', authMiddleware, async (req, res) => {
  const { fecha_reservacion, numero_mesa, hora, numero_personas, comentarios } = req.body;

  const faltantes = [];
  if (!fecha_reservacion) faltantes.push('fecha_reservacion');
  if (!numero_mesa) faltantes.push('numero_mesa');
  if (!hora) faltantes.push('hora');
  if (!numero_personas) faltantes.push('numero_personas');

  if (faltantes.length > 0) {
    return res.status(400).json({ error: `Faltan los siguientes campos obligatorios: ${faltantes.join(', ')}` });
  }

  try {
    const [existe] = await pool.query(
      'SELECT id_reservacion FROM reservaciones WHERE fecha_reservacion = ? AND numero_mesa = ? AND hora = ?',
      [fecha_reservacion, numero_mesa, hora]
    );

    if (existe.length) {
  return res.status(409).json({
    error: `Ya existe una reservación para:<br>Día: ${fecha_reservacion}<br>Hora: ${hora}<br>Mesa: ${numero_mesa}`
  });
}

    const [usuario] = await pool.query(
      'SELECT nombre, correo FROM usuarios WHERE id = ?',
      [req.usuarioId]
    );

    if (!usuario.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await pool.query(
      `INSERT INTO reservaciones 
      (usuario_id, nombre_completo, correo, fecha_reservacion, numero_mesa, hora, numero_personas, comentarios) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.usuarioId, usuario[0].nombre, usuario[0].correo, fecha_reservacion, numero_mesa, hora, numero_personas, comentarios || null]
    );

    res.json({ mensaje: 'Reservación registrada correctamente' });
  } catch (error) {
    console.error('❌ Error al reservar:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// Obtener todas
app.get('/api/reservaciones', async (_, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reservaciones');
    res.json(rows);
  } catch (e) {
    console.error('Error listar:', e);
    res.status(500).json({ error: 'Error al listar reservaciones' });
  }
});
// Actualizar reservación
app.put('/api/reservaciones/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { fecha_reservacion, numero_mesa, hora, numero_personas, comentarios } = req.body;

    // Verificar si existe otra reservación en misma fecha, hora y mesa (que no sea esta)
    const [duplicado] = await pool.query(
      `SELECT id_reservacion FROM reservaciones 
       WHERE fecha_reservacion = ? AND numero_mesa = ? AND hora = ? AND id_reservacion != ?`,
      [fecha_reservacion, numero_mesa, hora, id]
    );

    if (duplicado.length > 0) {
      return res.status(409).json({
        error: `Ya existe una reservación para:<br>Día: ${fecha_reservacion}<br>Hora: ${hora}<br>Mesa: ${numero_mesa}`
      });
    }

    await pool.query(
      `UPDATE reservaciones
       SET fecha_reservacion=?, numero_mesa=?, hora=?, numero_personas=?, comentarios=?
       WHERE id_reservacion=?`,
      [fecha_reservacion, numero_mesa, hora, numero_personas, comentarios, id]
    );

    res.json({ success: true });
  } catch (e) {
    console.error('Error actualizar:', e);
    res.status(500).json({ error: 'Error al actualizar reservación' });
  }
});


// Eliminar
app.delete('/api/reservaciones/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM reservaciones WHERE id_reservacion=?', [id]);
    res.json({ success: true });
  } catch (e) {
    console.error('Error eliminar:', e);
    res.status(500).json({ error: 'Error al eliminar reservación' });
  }
});

// API: Cantidad de usuarios y menús
app.get('/api/resumen', async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT COUNT(*) AS totalUsuarios FROM usuarios');
    const [menus] = await pool.query('SELECT COUNT(*) AS totalMenus FROM menu');

    res.json({
      totalUsuarios: usuarios[0].totalUsuarios,
      totalMenus: menus[0].totalMenus
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener resumen');
  }
});

// API: Reservaciones por día (para el gráfico)
app.get('/api/reservaciones-por-dia', async (req, res) => {
  try {
    const [resultados] = await pool.query(`
      SELECT DATE_FORMAT(fecha_reservacion, '%Y-%m-%d') AS etiqueta, COUNT(*) AS total
      FROM reservaciones
      GROUP BY etiqueta
      ORDER BY etiqueta ASC
    `);
    res.json(resultados);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de reservaciones');
  }
});


// Función para crear admin único
async function crearAdminUnico() {
  const correoAdmin = 'admin@restaurante.com';
  const contraseñaAdmin = 'admin123'; // Cambia esta contraseña si quieres

  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correoAdmin]);

    if (usuarios.length === 0) {
      // No existe administrador, lo creamos
      const hash = await bcrypt.hash(contraseñaAdmin, 10);
      await pool.query(
        'INSERT INTO usuarios (nombre, telefono, correo, contrasena, tipo_usuario) VALUES (?, ?, ?, ?, ?)',
        ['Administrador', '0000-0000', correoAdmin, hash, 'administrador']
      );
      console.log('✔ Usuario administrador creado con correo:', correoAdmin);
    } else {
      console.log('✔ Usuario administrador ya existe. No se creó uno nuevo.');
    }
  } catch (error) {
    console.error('❌ Error al verificar/crear administrador:', error.message);
  }
}

// Llamar a la función antes de iniciar el servidor
crearAdminUnico().then(() => {
  const PORT = 3000;
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
});


