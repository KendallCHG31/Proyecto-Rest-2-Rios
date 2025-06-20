

const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { pool } = require('./models/db');

const app = express();
// Servir archivos estáticos (JS, CSS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'img')));

// Ruta para servir el archivo menu.html desde views
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registro.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'menu.html'));
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // Ajusta según tu estructura

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente ✅');
});


// Ruta para registrar un usuario
app.post('/api/registrar', async (req, res) => {
  const { nombre, telefono, correo, contrasena } = req.body;

  if (!nombre || !telefono || !correo || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [existente] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existente.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    await pool.query(
      'INSERT INTO usuarios (nombre, telefono, correo, contrasena) VALUES (?, ?, ?, ?)',
      [nombre, telefono, correo, hash]
    );

    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error.message);
    res.status(500).json({ error: 'Error del servidor al registrar usuario' });
  }
});



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
