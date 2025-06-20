document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formRegistro');
  const mensajeDiv = document.getElementById('mensaje'); // Referencia al div de mensajes

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();

    // Limpia mensajes anteriores
    mensajeDiv.textContent = '';
    mensajeDiv.style.color = 'red';

    if (!nombre || !telefono || !correo || !contrasena) {
      mensajeDiv.textContent = 'Por favor, completa todos los campos.';
      return;
    }

    try {
      const res = await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, correo, contrasena })
      });

      const data = await res.json();

      if (res.ok) {
        mensajeDiv.style.color = 'green';
        mensajeDiv.textContent = data.mensaje;
        form.reset();
        setTimeout(() => {
          window.location.href = "/views/login";
        }, 1500);
      } else {
        mensajeDiv.textContent = data.error || 'Error al registrar';
      }
    } catch (error) {
      console.error('❌ Error en el registro:', error);
      mensajeDiv.textContent = 'Error de conexión con el servidor.<';
    }
  });
});
