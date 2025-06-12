async function cargarMenus() {
  try {
    const respuesta = await fetch('/api/listar-menu'); 
    const menus = await respuesta.json();

    const tbody = document.querySelector('#tablamenu tbody');
    tbody.innerHTML = '';

    menus.forEach(menu => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${menu.nombre}</td>
        <td>${menu.descripcion}</td>
        <td>$${menu.precio.toFixed(2)}</td>
      `;
      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar menús:", error);
  }
}

// Llama la función cuando cargue la página
cargarMenus();
