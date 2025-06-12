
const express = require('express');
const path = require('path');
const cors = require('cors');
const { pool } = require('./models/db');

const app = express();
// Servir archivos estáticos (JS, CSS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'img')));

// Ruta para servir el archivo menu.html desde views
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


app.get('/api/listar-menu', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu'); 
    res.json(rows);
  } catch (err) {
    console.error('Error al listar menús:', err);
    res.status(500).json({ error: 'Error al obtener los menús' });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
