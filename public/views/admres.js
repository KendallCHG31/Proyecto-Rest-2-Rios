document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formReserva');
  const mensajeDiv = document.getElementById('mensaje');
  const tablaBody = document.querySelector('#tablareservas tbody');
  const horaContainer = document.getElementById('horaContainer');
  const selectMesa = document.getElementById('mesa');
  const modal = document.getElementById('modalConfirmacion');

  let horaSeleccionada = null;

  const horas = ['14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];

  // Insertar botones de hora
  horas.forEach(h => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('hora');
    btn.value = h;
    btn.textContent = `${h.slice(0, 2)}:00`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btnhora .hora').forEach(b => b.classList.remove('seleccionada'));
      btn.classList.add('seleccionada');
      horaSeleccionada = btn.value;
    });
    horaContainer.appendChild(btn);
  });

  // Opciones de mesa
  for (let i = 1; i <= 8; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Mesa ${i}`;
    selectMesa.appendChild(opt);
  }

  form.addEventListener('submit', handleSubmit);
  cargarReservaciones();

  function limpiarMensaje() {
    mensajeDiv.innerHTML = '';
    mensajeDiv.className = '';
  }

  function mostrarMensaje(texto, tipo = 'error') {
    mensajeDiv.innerHTML = texto.replace(/\n/g, '<br>');
    mensajeDiv.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito';
    setTimeout(limpiarMensaje, 4000);
  }

  function formatearFecha(fechaString) {
    if (!fechaString) return '';
    const d = new Date(fechaString);
    return isNaN(d) ? fechaString : d.toISOString().split('T')[0];
  }

  async function cargarReservaciones() {
    try {
      const res = await fetch('/api/reservaciones');
      const data = await res.json();
      tablaBody.innerHTML = '';

      data.forEach(r => {
        const fecha = formatearFecha(r.fecha_reservacion);
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${r.nombre_completo}</td>
          <td>${r.correo}</td>
          <td>${fecha}</td>
          <td>${r.hora}</td>
          <td>${r.numero_mesa}</td>
          <td>${r.numero_personas}</td>
          <td>${r.comentarios ?? ''}</td>
          <td>
            <button class="btn-editar" data-id="${r.id_reservacion}">Modificar</button>
            <button class="btn-eliminar" data-id="${r.id_reservacion}">Eliminar</button>
          </td>
        `;
        tablaBody.appendChild(fila);
      });

      tablaBody.querySelectorAll('.btn-eliminar').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const fila = e.target.closest('tr');
    const nombre = fila.children[0].textContent;
    const correo = fila.children[1].textContent;
    const fecha = fila.children[2].textContent;
    const hora = fila.children[3].textContent;
    const mesa = fila.children[4].textContent;

    idReservaAEliminar = btn.dataset.id;

    // Mostrar detalles en el modal
    const detalle = document.getElementById('detalleReservacion');
    detalle.innerHTML = `
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Correo:</strong> ${correo}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Hora:</strong> ${hora}</p>
      <p><strong>Mesa:</strong> ${mesa}</p>
    `;

    document.getElementById('modalConfirmacion').style.display = 'flex';
  });
});

      tablaBody.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => {
          const padres = btn.closest('tr').children;
          document.getElementById('fecha').value = padres[2].textContent;
          document.getElementById('mesa').value = padres[4].textContent;
          document.getElementById('personas').value = padres[5].textContent;
          document.getElementById('comentarios').value = padres[6].textContent;

          document.querySelectorAll('.btnhora .hora').forEach(b => {
            if (b.value === padres[3].textContent) {
              b.classList.add('seleccionada');
              horaSeleccionada = b.value;
            } else {
              b.classList.remove('seleccionada');
            }
          });

          form.dataset.id = btn.dataset.id;
        });
      });

    } catch (e) {
      console.error('Error al cargar:', e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    limpiarMensaje();

    const data = {
      fecha_reservacion: form.fecha.value,
      numero_mesa: parseInt(form.mesa.value),
      hora: horaSeleccionada,
      numero_personas: parseInt(form.personas.value),
      comentarios: form.comentarios.value.trim()
    };

    if (!data.fecha_reservacion || !data.numero_mesa || !data.numero_personas || !horaSeleccionada) {
      mostrarMensaje('Completa todos los campos obligatorios');
      return;
    }

    const isEdit = !!form.dataset.id;
    const url = isEdit ? `/api/reservaciones/${form.dataset.id}` : '/api/reservaciones';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (res.ok) {
        mostrarMensaje(isEdit ? 'Reservación actualizada' : 'Reservación creada', 'exito');
        form.reset();
        document.querySelectorAll('.btnhora .hora').forEach(b => b.classList.remove('seleccionada'));
        horaSeleccionada = null;
        delete form.dataset.id;
        cargarReservaciones();
      } else {
        mostrarMensaje(json.error || 'Ocurrió un error');
      }
    } catch (e) {
      console.error('Error al guardar:', e);
      mostrarMensaje('Error de servidor');
    }
  }

  // Confirmar eliminación de reservación
document.getElementById('btnConfirmarEliminar').addEventListener('click', async () => {
  if (idReservaAEliminar) {
    try {
      const res = await fetch(`/api/reservaciones/${idReservaAEliminar}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        mostrarMensaje(data.mensaje || 'Reservación eliminada', 'exito');
        cargarReservaciones();
      } else {
        mostrarMensaje(data.error || 'Error al eliminar reservación', 'error');
      }
    } catch {
      mostrarMensaje('Error del servidor', 'error');
    }
  }
  modal.style.display = 'none';
  idReservaAEliminar = null;
});

// Cancelar eliminación de reservación
document.getElementById('btnCancelarEliminar').addEventListener('click', () => {
  modal.style.display = 'none';
  idReservaAEliminar = null;
});

});

