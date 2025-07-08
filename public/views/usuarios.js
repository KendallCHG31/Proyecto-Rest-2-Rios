document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();
});

async function cargarUsuarios() {
  try {
    const respuesta = await fetch('/api/usuarios');
    const usuarios = await respuesta.json();

    const tbody = document.querySelector('#tablausuarios tbody');
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td><strong>${usuario.nombre}</strong></td>
        <td>${usuario.telefono}</td>
        <td>${usuario.correo}</td>
      `;
      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error('❌ Error al cargar usuarios:', error);
  }
}
