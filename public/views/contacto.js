// Script para enviar formulario de contacto con EmailJS
//  Inicializa EmailJS con tu Public Key ANTES de enviar formularios
emailjs.init("rv5hN5bbZzvBe5QRF"); // Public Key real

// Evento submit del formulario de contacto
document.getElementById('formContacto').addEventListener('submit', function(event) {
  event.preventDefault(); // Evita recarga

  // Envía el formulario usando EmailJS
  emailjs.sendForm(
    'service_oxxsvyc', // Service ID exacto  cuenta EmailJS
    'template_iprlzex', // Template ID 
    this // 'this' es el formulario HTML
  )
  .then(function() {
    
    alert('Mensaje enviado correctamente. Gracias por contactarnos.');
    document.getElementById('formContacto').reset(); // Limpia formulario
  }, function(error) {
    
    console.log('FAILED...', error);
    alert('Error al enviar mensaje. Intente más tarde.');
  });
});
