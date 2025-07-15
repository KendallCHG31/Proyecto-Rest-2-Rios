document.addEventListener('DOMContentLoaded', () => {
  let idMenuAEliminar = null;

  const nombreInput = document.getElementById('nombre');
  const descripcionInput = document.getElementById('descripcion');
  const precioInput = document.getElementById('precio');
  const mensaje = document.getElementById('mensaje');
  const tablaBody = document.querySelector('#tablaMenus tbody');
  const guardarBtn = document.querySelector('button[type="submit"]');
  const modal = document.getElementById('modalConfirmacion');
  const detalleMenu = document.getElementById('detalleMenu');

  const mostrarMensaje = (msg, tipo) => {
    mensaje.textContent = msg;
    mensaje.className = tipo;
    mensaje.style.display = 'block';
    setTimeout(() => {
      mensaje.textContent = '';
      mensaje.className = '';
      mensaje.style.display = 'none';
    }, 3000);
  };

  const cargarMenus = async () => {
    try {
      const res = await fetch('/api/menus');
      const data = await res.json();

      tablaBody.innerHTML = '';
      data.forEach(menu => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${menu.nombre}</td>
          <td>${menu.descripcion}</td>
          <td>${menu.precio}</td>
          <td>
            <button class="btn-editar" data-id="${menu.id_menu}">Modificar</button>
            <button class="btn-eliminar" data-id="${menu.id_menu}">Eliminar</button>
          </td>
        `;
        tablaBody.appendChild(fila);
      });

      // Botón editar
      tablaBody.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const fila = e.target.closest('tr');
          const id = e.target.dataset.id;
          const nombre = fila.children[0].textContent;
          const descripcion = fila.children[1].textContent;
          const precio = fila.children[2].textContent;

          nombreInput.value = nombre;
          descripcionInput.value = descripcion;
          precioInput.value = precio;

          guardarBtn.textContent = 'Actualizar';
          guardarBtn.dataset.id = id; //guardar id
        });
      });

      // Botón eliminar
      tablaBody.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const fila = e.target.closest('tr');
          const nombre = fila.children[0].textContent;
          const descripcion = fila.children[1].textContent;
          const precio = fila.children[2].textContent;
          idMenuAEliminar = e.target.dataset.id;

          detalleMenu.innerHTML = `
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Descripción:</strong> ${descripcion}</p>
            <p><strong>Precio:</strong> ${precio}</p>
          `;

          modal.style.display = 'flex';
        });
      });
    } catch (err) {
      mostrarMensaje('Error al cargar los menús', 'error');
    }
  };

  guardarBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const nombre = nombreInput.value.trim();
    const descripcion = descripcionInput.value.trim();
    const precio = precioInput.value.trim();
    const id = guardarBtn.dataset.id; //  contiene el ID al actualizar

    if (!nombre || !descripcion || !precio) {
      mostrarMensaje('Por favor, completa todos los campos.', 'error');
      return;
    }

    if (isNaN(precio) || Number(precio) <= 0) {
      mostrarMensaje('El precio debe ser un número positivo.', 'error');
      return;
    }

    const payload = { nombre, descripcion, precio };

    try {
      let res, data;

      if (id) {
        res = await fetch(`/api/menus/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      data = await res.json();

      if (res.ok) {
        mostrarMensaje(data.mensaje || (id ? 'Menú actualizado' : 'Menú guardado'), 'exito');
        nombreInput.value = '';
        descripcionInput.value = '';
        precioInput.value = '';
        guardarBtn.textContent = 'Guardar';
        delete guardarBtn.dataset.id; // 💡 Limpia el ID luego de actualizar
        cargarMenus();
      } else {
        mostrarMensaje(data.error || 'Error al guardar/actualizar el menú', 'error');
      }
    } catch (err) {
      mostrarMensaje('Error del servidor', 'error');
    }
  });

  // Confirmar eliminación
  document.getElementById('btnConfirmarEliminar').addEventListener('click', async () => {
    if (idMenuAEliminar) {
      try {
        const res = await fetch(`/api/menus/${idMenuAEliminar}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          mostrarMensaje(data.mensaje || 'Menú eliminado', 'exito');
          cargarMenus();
        } else {
          mostrarMensaje(data.error || 'Error al eliminar', 'error');
        }
      } catch {
        mostrarMensaje('Error del servidor', 'error');
      }
    }
    modal.style.display = 'none';
    idMenuAEliminar = null;
  });

  // Cancelar eliminación
  document.getElementById('btnCancelarEliminar').addEventListener('click', () => {
    modal.style.display = 'none';
    idMenuAEliminar = null;
  });

  cargarMenus();
});
