const API_URL = 'http://localhost:3000/api';
let token = sessionStorage.getItem('token') || null;

const mensajeDiv = document.getElementById('mensaje');
const tablaUsuarios = document.getElementById('tablaUsuarios');

// Revisión de token desde localStorage
if (!token) {
  alert('Debe iniciar sesión para acceder a esta página.');
  window.location.href = '/login';
}

// Función para mostrar mensajes temporales
function mostrarMensaje(texto, tipo = 'exito') {
  mensajeDiv.textContent = texto;
  mensajeDiv.style.color = tipo === 'error' ? 'red' : 'green';
  setTimeout(() => {
    mensajeDiv.textContent = '';
  }, 4000);
}


// Cargar y mostrar usuarios
async function cargarUsuarios() {
  try {
    const res = await fetch(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) {
      alert('Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.');
      logout();
      return;
    }

    const usuarios = await res.json();
    if (res.ok || res.status === 200) {
      tablaUsuarios.innerHTML = '';
      usuarios.forEach(u => {
        const fila = document.createElement('tr');

        // Usa u.id en lugar de u.usuario_id si tu PK es 'id'
        fila.innerHTML = `
          <td>${u.nombre}</td>
          <td>${u.telefono}</td>
          <td>${u.correo}</td>
          <td>${u.tipo_usuario}</td>
          <td>
            <select id="selectTipo_${u.id}">
              <option value="administrador" ${u.tipo_usuario === 'administrador' ? 'selected' : ''}>Administrador</option>
              <option value="empleado" ${u.tipo_usuario === 'empleado' ? 'selected' : ''}>Empleado</option>
              <option value="usuario" ${u.tipo_usuario === 'usuario' ? 'selected' : ''}>Usuario</option>
            </select>
          </td>
          <td>
            <button onclick="actualizarTipo(${u.id})">Actualizar</button>
          </td>
        `;

        tablaUsuarios.appendChild(fila);
      });
    } else {
      mostrarMensaje('Error al cargar usuarios', 'error');
    }
  } catch (error) {
    mostrarMensaje('Error al conectar con el servidor', 'error');
    console.error('❌ Error al cargar usuarios:', error);
  }
}


// Función para actualizar tipo de usuario

async function actualizarTipo(id) {
  const select = document.getElementById(`selectTipo_${id}`);
  const nuevoTipo = select.value;

  try {
    const res = await fetch(`${API_URL}/usuarios/${id}/tipo`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tipo_usuario: nuevoTipo })
    });

    if (res.status === 401) {
      alert('Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.');
      logout();
      return;
    }

    const data = await res.json();

    if (res.ok) {
      mostrarMensaje(`Tipo de usuario actualizado a ${nuevoTipo}`);
      cargarUsuarios(); // recargar para reflejar cambios
    } else {
      mostrarMensaje(`Error: ${data.error}`, 'error');
    }
  } catch (error) {
    mostrarMensaje('Error al actualizar tipo de usuario', 'error');
    console.error('❌ Error al cambiar tipo de usuario:', error);
  }
}


// Función logout
function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('tipo_usuario');
  token = null;
  alert('Sesión cerrada');
  window.location.href = '/login';
}


// Cargar usuarios al inicio
cargarUsuarios();

