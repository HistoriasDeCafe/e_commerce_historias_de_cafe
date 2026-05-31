const Validators = {
    validateText: (val, min) => ({
        notEmpty: val.length > 0,
        minLength: val.length >= min
    }),
    validateEmail: (val) => ({
        notEmpty: val.length > 0,
        format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    }),
    notEmpty: (val) => val.length > 0
};

function mostrarError(input, mensaje) {
    input.classList.add("is-invalid");
    const errorDiv = input.parentElement.querySelector(".invalid-feedback");
    if (errorDiv) {
        errorDiv.innerText = mensaje;
    }
}

// Validación del formulario contactanos — solo si existe en esta página
function cargarFormContact() {
  const form = document.getElementById('contact-form');

  if (!form) {
    console.warn("No se encontró el formulario con ID 'contact-form'.");
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Limpiar errores previos
    form.querySelectorAll(".invalid-feedback").forEach((el) => el.innerText = "");
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

    let isValid = true;

    // Buscamos los inputs DENTRO del formulario
    const nombreInput = form.querySelector("#name");
    const emailInput = form.querySelector("#email");
    const telefonoInput = form.querySelector("#number");
    const mensajeInput = form.querySelector("#message");

    // --- Validaciones usando Validators ---
    // Nombre
    const nombreVal = nombreInput.value.trim();
    const nombreValid = Validators.validateText(nombreVal, 3);
    if (!nombreValid.notEmpty) {
      mostrarError(nombreInput, "Ingresa tu nombre");
      isValid = false;
    } else if (!nombreValid.minLength) {
      mostrarError(nombreInput, "Mínimo 3 caracteres");
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreVal)) {
      mostrarError(nombreInput, "Solo letras y espacios");
      isValid = false;
    }

    // Email
    const emailVal = emailInput.value.trim();
    const emailValid = Validators.validateEmail(emailVal);
    if (!emailValid.notEmpty) {
      mostrarError(emailInput, "Ingresa tu email");
      isValid = false;
    } else if (!emailValid.format) {
      mostrarError(emailInput, "Email no válido");
      isValid = false;
    }

    // Teléfono (opcional)
    const telefonoVal = telefonoInput.value.trim();
    if (telefonoVal && (telefonoVal.length < 10 || !/^[0-9+\s]+$/.test(telefonoVal))) {
      mostrarError(telefonoInput, "Teléfono inválido (mín. 10 dígitos)");
      isValid = false;
    }

    // Mensaje
    const mensajeVal = mensajeInput.value.trim();
    if (!Validators.notEmpty(mensajeVal)) {
      mostrarError(mensajeInput, "El mensaje no puede estar vacío");
      isValid = false;
    } else if (mensajeVal.length < 10) {
      mostrarError(mensajeInput, "Mensaje demasiado corto (mín. 10)");
      isValid = false;
    }

    if (isValid) {
      try {
        // Enviar a Formspree usando fetch
        const formData = {
          name: nombreVal,
          email: emailVal,
          number: telefonoVal,
          message: mensajeVal
        };

        const response = await fetch('https://formspree.io/f/xlgajpkq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          // Mostrar SweetAlert profesional con tema de café
          Swal.fire({
            title: '¡Mensaje Recibido!',
            text: 'Gracias por contactarnos. Tu mensaje ha sido recibido como una taza recién preparada. Te responderemos pronto con el mismo cuidado que ponemos en cada grano de café.',
            icon: 'success',
            confirmButtonText: 'Excelente',
            confirmButtonColor: '#532721',
            background: '#fdfcfb',
            color: '#532721'
          });

          // Limpiar formulario tras éxito
          form.reset();
        } else {
          throw new Error('Error al enviar el mensaje');
        }
      } catch (error) {
        Swal.fire({
          title: '¡Ups!',
          text: 'Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo, como cuando se prepara una taza perfecta.',
          icon: 'error',
          confirmButtonText: 'Intentar de nuevo',
          confirmButtonColor: '#532721'
        });
      }
    }
  });
}