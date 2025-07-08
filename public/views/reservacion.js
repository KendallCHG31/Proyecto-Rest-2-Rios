document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formReserva');
  const mensajeDiv = document.getElementById('mensaje');
  const botonesHora = document.querySelectorAll('.btnhora .hora');
  const modal = document.getElementById('modalConfirmacion');
  const resumenReserva = document.getElementById('resumenReserva');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const btnCancelar = document.getElementById('btnCancelar');

  let horaSeleccionada = null;

  function limpiarMensaje() {
    mensajeDiv.innerHTML = '';
    mensajeDiv.className = '';
  }

  function mostrarMensaje(texto, tipo = 'error') {
    mensajeDiv.innerHTML = texto.replace(/\n/g, '<br>');
    mensajeDiv.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito';
    setTimeout(limpiarMensaje, 4000);
  }

  // Selección de hora
  botonesHora.forEach(boton => {
    boton.addEventListener('click', () => {
      botonesHora.forEach(b => b.classList.remove('seleccionada'));
      boton.classList.add('seleccionada');
      horaSeleccionada = boton.value;
    });
  });

  // Evento submit del formulario
  form.addEventListener('submit', e => {
    e.preventDefault();
    limpiarMensaje();

    const data = {
      fecha_reservacion: form.fecha.value,           // Ajustado para coincidir con backend
      numero_mesa: parseInt(form.mesa.value),        // Ajustado para coincidir con backend
      hora: horaSeleccionada,
      numero_personas: form.personas.value,          // Ajustado para coincidir con backend
      comentarios: form.comentarios.value.trim(),
    };

    // Validación de campos obligatorios
    if (!data.fecha_reservacion || !data.numero_mesa || !data.numero_personas) {
      mostrarMensaje('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!horaSeleccionada) {
      mostrarMensaje('Selecciona una hora');
      return;
    }

    // Mostrar datos en el modal antes de enviar
    resumenReserva.innerHTML = `
      <p><strong>Fecha:</strong> ${data.fecha_reservacion}</p>
      <p><strong>Hora:</strong> ${data.hora}</p>
      <p><strong>Mesa:</strong> ${data.numero_mesa}</p>
      <p><strong>Personas:</strong> ${data.numero_personas}</p>
      ${data.comentarios ? `<p><strong>Comentarios:</strong> ${data.comentarios}</p>` : ''}
    `;
    modal.style.display = 'flex';

    // Confirmar envío
    btnConfirmar.onclick = async () => {
      modal.style.display = 'none';

      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          mostrarMensaje('Debes iniciar sesión para reservar');
          return;
        }

        const res = await fetch('/api/reservar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(data)
        });

        const json = await res.json();

        if (res.ok) {
          mostrarMensaje(json.mensaje, 'exito');
          form.reset();
          botonesHora.forEach(b => b.classList.remove('seleccionada'));
          horaSeleccionada = null;
        } else {
          mostrarMensaje(
            json.error || `Ya existe una reservación para:<br>Día: ${data.fecha_reservacion}<br>Hora: ${data.hora}<br>Mesa: ${data.numero_mesa}`
          );
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
        mostrarMensaje('Error al enviar la solicitud');
      }
    };

    // Cancelar confirmación
    btnCancelar.onclick = () => {
      modal.style.display = 'none';
    };
  });
});
