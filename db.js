const mysql = require('mysql2/promise');

let pool;

try {
  pool = mysql.createPool({
    host:'localhost',
    user:'kendall31',
    password:'2005',
    database:'Proyecto_ProAv',
    waitForConnections: true,
    queueLimit: 0,
  });

  console.log("✅ Conexión al pool MySQL exitosa");

  (async () => {
    const conn = await pool.getConnection();
    console.log("✅ Conexión a la base de datos verificada");
    conn.release();
  })();
} catch (err) {
  console.error("❌ Error al crear pool:", err.message);
}

module.exports = { pool };
