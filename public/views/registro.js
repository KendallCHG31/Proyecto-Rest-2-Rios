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
    mensajeDiv.classList.add('mensaje-error');
// Ocultar automáticamente después de 3 segundos
setTimeout(() => {
  mensajeDiv.textContent = '';
  mensajeDiv.className = '';
}, 3000);
    
    if (!nombre || !telefono || !correo || !contrasena) {
  mensajeDiv.textContent = 'Por favor, completa todos los campos.';
  return;
}

 if (contrasena.length < 8) {
  mensajeDiv.className = '';
  mensajeDiv.classList.add('mensaje-error');
  mensajeDiv.textContent = 'La contraseña debe tener al menos 8 caracteres.';

  setTimeout(() => {
    mensajeDiv.textContent = '';
    mensajeDiv.className = '';
  }, 3000);
  return;

}

if (!/[A-Z]/.test(contrasena)) {
  mensajeDiv.className = '';
  mensajeDiv.classList.add('mensaje-error');
  mensajeDiv.textContent = 'La contraseña debe incluir al menos una letra mayúscula.';
  setTimeout(() => {
    mensajeDiv.textContent = '';
    mensajeDiv.className = '';
  }, 3000);
  return;
}

if (!/[0-9]/.test(contrasena)) {
  mensajeDiv.className = '';
  mensajeDiv.classList.add('mensaje-error');
  mensajeDiv.textContent = 'La contraseña debe incluir al menos un número.';
  setTimeout(() => {
    mensajeDiv.textContent = '';
    mensajeDiv.className = '';
  }, 3000);
  
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
        mensajeDiv.className = '';
        mensajeDiv.classList.add('mensaje-exito');
        mensajeDiv.textContent = data.mensaje;
        form.reset();
        setTimeout(() => {
          window.location.href = "/views/login.html";
        }, 1500);
      } else {
        mensajeDiv.classList.add('mensaje-error');
        mensajeDiv.textContent = data.error || 'Error al registrar';
      }
    } catch (error) {
      console.error('❌ Error en el registro:', error);
      mensajeDiv.textContent = 'Error de conexión con el servidor.';
    }
  });
});
