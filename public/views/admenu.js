document.addEventListener('DOMContentLoaded', () => {
  const nombreInput = document.getElementById('nombre');
  const descripcionInput = document.getElementById('descripcion');
  const precioInput = document.getElementById('precio');
  const mensaje = document.getElementById('mensaje');
  const tablaBody = document.querySelector('#tablaMenus tbody');
  const guardarBtn = document.querySelector('button[type="submit"]');


   // Mostrar mensaje con estilo y desaparición automática
  const mostrarMensaje = (texto, tipo) => {
    mensaje.textContent = texto;
    mensaje.className = ''; // Limpiar clases anteriores
    mensaje.classList.add(tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error');

    setTimeout(() => {
      mensaje.textContent = '';
      mensaje.className = '';
    }, 3000);
  };


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

    // Validaciones
    if (!nombre || !descripcion || !precio) {
      mostrarMensaje('Por favor, completa todos los campos.', 'error');
      return;
    }

    if (isNaN(precio) || Number(precio) <= 0) {
      mostrarMensaje('El precio debe ser un número positivo.', 'error');
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
        mostrarMensaje(data.mensaje || 'Menú guardado exitosamente', 'exito');
        nombreInput.value = '';
        descripcionInput.value = '';
        precioInput.value = '';
        cargarMenus();
      } else {
        mostrarMensaje(data.error || 'Error al guardar el menú', 'error');
      }
    } catch (err) {
      mostrarMensaje('Error del servidor', 'error');
    }
  });

  // Inicial
  cargarMenus();
});
