document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formLogin');
  const mensajeDiv = document.getElementById('mensaje');

  // Si ya hay token y tipo_usuario en sessionStorage, redirigir según tipo de usuario
  const token = sessionStorage.getItem('token');
  const tipo_usuario = sessionStorage.getItem('tipo_usuario');
  if (token && tipo_usuario) {
    console.log('Token y tipo_usuario ya almacenados:', token, tipo_usuario);
    redirectUser(tipo_usuario);
  }

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
      console.log('Intentando login con:', { email, password: '*****' });

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password })
      });

      const data = await res.json();

      console.log('Respuesta login:', data, 'Estado:', res.status);

      if (res.ok) {
        // Guardar token y tipo_usuario en sessionStorage
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('tipo_usuario', data.tipo_usuario);

        mensajeDiv.classList.add('mensaje-exito');
        mensajeDiv.textContent = 'Inicio de sesión exitoso. Redirigiendo...';

        console.log('Redirigiendo usuario con tipo:', data.tipo_usuario);
        setTimeout(() => redirectUser(data.tipo_usuario), 1500);
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

  function redirectUser(tipo_usuario) {
   
    const tipo = tipo_usuario.toLowerCase();
    console.log('redirectUser: tipo_usuario recibido =', tipo);

    if (tipo === 'administrador') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'reservacion.html';
    }
  }
});
