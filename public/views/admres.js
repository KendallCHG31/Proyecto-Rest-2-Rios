function formatearFecha(fechaString) {
  if (!fechaString) return '';
  // Intentar crear objeto Date
  const fecha = new Date(fechaString);
  if (isNaN(fecha)) return fechaString; // Si no es fecha válida, devolver como viene
  // Formatear a YYYY-MM-DD
  return fecha.toISOString().split('T')[0];
}

document.addEventListener('DOMContentLoaded', () => {
  cargarReservaciones();
});

async function cargarReservaciones() {
  try {
    const respuesta = await fetch('/api/reservaciones');
    const reservaciones = await respuesta.json();

    const tbody = document.querySelector('#tablareservas tbody');
    tbody.innerHTML = '';

    reservaciones.forEach(r => {
      const fechaReservacion = formatearFecha(r.fecha_reservacion);
      const fechaCreacion = formatearFecha(r.fecha_creacion);

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td><strong>${r.nombre_completo}</strong></td>
        <td>${r.correo}</td>
        <td>${fechaReservacion}</td>
        <td>${r.hora}</td>
        <td>${r.numero_mesa}</td>
        <td>${r.numero_personas}</td>
        <td>${r.comentarios ?? ''}</td>
        <td>${fechaCreacion}</td>
      `;
      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error('❌ Error al cargar reservaciones:', error);
  }
}
