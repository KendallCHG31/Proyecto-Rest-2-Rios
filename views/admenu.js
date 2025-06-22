document.addEventListener('DOMContentLoaded', () => {
  const nombreInput = document.getElementById('nombre');
  const descripcionInput = document.getElementById('descripcion');
  const precioInput = document.getElementById('precio');
  const mensaje = document.getElementById('mensaje');
  const tablaBody = document.querySelector('#tablaMenus tbody');
  const guardarBtn = document.querySelector('button[type="submit"]');

  // Cargar menús existentes
  const cargarMenus = async () => {
    try {
      const res = await fetch('/api/menus');
      const menus = await res.json();

      tablaBody.innerHTML = ''; // Limpiar tabla

      menus.forEach(menu => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${menu.nombre}</td>
          <td>${menu.descripcion}</td>
          <td>${menu.precio}</td>
        `;
        tablaBody.appendChild(fila);
      });
    } catch (err) {
      mensaje.textContent = 'Error al cargar menús';
      mensaje.style.color = 'red';
    }
  };

  // Guardar menú nuevo
  guardarBtn.addEventListener('click', async () => {
    const nombre = nombreInput.value.trim();
    const descripcion = descripcionInput.value.trim();
    const precio = precioInput.value.trim();

    if (!nombre || !descripcion || !precio) {
      mensaje.textContent = 'Todos los campos son obligatorios';
      mensaje.style.color = 'red';
      return;
    }

    try {
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion, precio })
      });

      const data = await res.json();

      if (res.ok) {
        mensaje.textContent = data.mensaje;
        mensaje.style.color = 'green';
        nombreInput.value = '';
        descripcionInput.value = '';
        precioInput.value = '';
        cargarMenus();
      } else {
        mensaje.textContent = data.error || 'Error al guardar';
        mensaje.style.color = 'red';
      }
    } catch (err) {
      mensaje.textContent = 'Error del servidor';
      mensaje.style.color = 'red';
    }
  });

  // Inicial
  cargarMenus();
});
