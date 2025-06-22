document.addEventListener('DOMContentLoaded', () => {
  cargarMenus();
});

async function cargarMenus() {
  try {
    const respuesta = await fetch('/api/menus');
    const menus = await respuesta.json();

    const tbody = document.querySelector('#tablamenu tbody');
    tbody.innerHTML = '';

    menus.forEach(menu => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${menu.nombre}</td>
        <td>${menu.descripcion}</td>
        <td>₡${parseFloat(menu.precio).toFixed(2)}</td>
      `;
      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error('❌ Error al cargar menús:', error);
  }
}
