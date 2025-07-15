// 1. Mostrar resumen de usuarios y menús
fetch('/api/resumen')
  .then(res => res.json())
  .then(data => {
    document.getElementById('totalUsuariosCard').textContent = `Usuarios: ${data.totalUsuarios}`;
    document.getElementById('totalMenusCard').textContent = `Menús: ${data.totalMenus}`;
  })
  .catch(err => console.error('Error cargando resumen:', err));

// 2. Gráfico de líneas: Reservaciones por día
fetch('/api/reservaciones-por-dia')
  .then(res => res.json())
  .then(data => {
    const fechas = data.map(r => r.etiqueta); // Correctamente extraído del alias
    const cantidades = data.map(r => r.total);

    const ctx = document.getElementById('graficoReservaciones').getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Reservaciones por Día',
          data: cantidades,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  })
  .catch(err => console.error('Error cargando gráfica de reservaciones:', err));
