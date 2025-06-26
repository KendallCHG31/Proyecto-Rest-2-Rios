

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formLogin');
  const mensajeDiv = document.getElementById('mensaje');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    mensajeDiv.textContent = '';
    mensajeDiv.className = '';

    if (!email || !password) {
      mensajeDiv.textContent = 'Por favor, complete todos los campos.';
      mensajeDiv.classList.add('mensaje-error');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password })
      });

      const data = await res.json();

      if (res.ok) {
        mensajeDiv.classList.add('mensaje-exito');
        mensajeDiv.textContent = 'Inicio de sesión exitoso. Redirigiendo...';

        // Redirige dependiendo del tipo de usuario
        setTimeout(() => {
          if (email.endsWith('@admin.com')) {
            window.location.href = 'admenu.html';
          } else {
            window.location.href = 'reservacion.html';
          }
        }, 1500);
      } else {
        mensajeDiv.classList.add('mensaje-error');
        mensajeDiv.textContent = data.error || 'Correo o contraseña incorrectos.';
      }

    } catch (error) {
      console.error('❌ Error en el inicio de sesión:', error);
      mensajeDiv.classList.add('mensaje-error');
      mensajeDiv.textContent = 'Error de conexión con el servidor.';
    }
  });
});
