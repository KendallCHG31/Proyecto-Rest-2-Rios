document.addEventListener('DOMContentLoaded', () => {
  const botonesHora = document.querySelectorAll('.btnhora .hora');

  botonesHora.forEach(boton => {
    boton.addEventListener('click', () => {
      // Eliminar clase "seleccionada" de todos los botones
      botonesHora.forEach(btn => btn.classList.remove('seleccionada'));

      // Agregar clase "seleccionada" al botón clicado
      boton.classList.add('seleccionada');

      // Si quieres guardar la hora seleccionada en un input oculto, puedes hacer esto:
      let inputHora = document.getElementById('horaSeleccionada');
      if (!inputHora) {
        inputHora = document.createElement('input');
        inputHora.type = 'hidden';
        inputHora.id = 'horaSeleccionada';
        inputHora.name = 'hora';
        document.getElementById('formReserva').appendChild(inputHora);
      }
      inputHora.value = boton.value;
    });
  });
});
