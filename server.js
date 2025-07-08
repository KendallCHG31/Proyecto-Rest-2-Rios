const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('./models/db');

const app = express();
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

// Listar usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT nombre, telefono, correo, tipo_usuario FROM usuarios');
    res.json(usuarios);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
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
      return res.status(409).json({ error: 'Mesa ocupada en esa fecha y hora' });
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

// Listar reservaciones
app.get('/api/reservaciones', async (req, res) => {
  try {
    const [reservas] = await pool.query('SELECT * FROM reservaciones');
    res.json(reservas);
  } catch (error) {
    console.error('❌ Error al obtener reservaciones:', error.message);
    res.status(500).json({ error: 'Error al obtener reservaciones' });
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


