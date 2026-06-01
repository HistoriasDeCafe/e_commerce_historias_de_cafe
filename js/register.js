function cargarFormRegister() {
  const form = document.getElementById("register-form");
  const inputName = document.getElementById("reg-name");
  const inputEmail = document.getElementById("reg-email");
  const inputPass1 = document.getElementById("password1");
  const inputPass2 = document.getElementById("password2");
  const pswd_info = document.getElementById("pswd_info");

  if (!form) return;

  // ── Ojito: mostrar / ocultar contraseña Inicio Sesión ────────────────────────────────
  document.querySelectorAll(".toggle-pass").forEach(function (icono) {
    icono.addEventListener("click", function () {
      const input = document.getElementById(this.getAttribute("data-target-login"));
      const viendo = input.type === "text";
      input.type = viendo ? "password" : "text";
      this.classList.toggle("fa-eye", viendo);
      this.classList.toggle("fa-eye-slash", !viendo);
    });
  });

  // ── Ojito: mostrar / ocultar contraseña registro  ────────────────────────────────
  document.querySelectorAll(".toggle-pass").forEach(function (icono) {
    icono.addEventListener("click", function () {
      const input = document.getElementById(this.getAttribute("data-target-register"));
      const viendo = input.type === "text";
      input.type = viendo ? "password" : "text";
      this.classList.toggle("fa-eye", viendo);
      this.classList.toggle("fa-eye-slash", !viendo);
    });
  });

  // ── Indicadores de fortaleza en tiempo real ────────────────────────────
  function setIndicator(id, isValid) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("valid", isValid);
    el.classList.toggle("invalid", !isValid);
  }

  function handlePasswordInput() {
    const p1 = inputPass1.value;
    const p2 = inputPass2.value;
    const r = Validators.validatePassword(p1, p2);

    setIndicator("length", r.length);
    setIndicator("letter", r.letter);
    setIndicator("capital", r.capital);
    setIndicator("number", r.number);
    setIndicator("blank", r.blank);
    setIndicator("match", r.match);
    setIndicator("null", r.null);

    if (p2.length > 0) {
      validarContrasenas(inputPass1, inputPass2);
    } else {
      limpiarError(inputPass2);
    }
  }

  inputPass1.addEventListener("keyup", handlePasswordInput);
  inputPass2.addEventListener("keyup", handlePasswordInput);
  inputPass1.addEventListener("focus", () => pswd_info.style.display = "block");
  inputPass1.addEventListener("blur", () => {
    pswd_info.style.display = "none";
    validarFortaleza(inputPass1);
  });
  inputPass2.addEventListener("blur", () => validarContrasenas(inputPass1, inputPass2));

  inputName.addEventListener("blur", () => validarNombre(inputName));
  inputEmail.addEventListener("blur", () => validarEmail(inputEmail));

  // ── Submit ─────────────────────────────────────────────────────────────
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    [inputName, inputEmail, inputPass1, inputPass2].forEach(limpiarError);

    const nombreOk = validarNombre(inputName);
    const emailOk  = validarEmail(inputEmail);
    const passOk   = validarFortaleza(inputPass1);
    const matchOk  = validarContrasenas(inputPass1, inputPass2);

    if (!nombreOk || !emailOk || !passOk || !matchOk) return;

    // ── API: POST /auth/register ───────────────────────────────────────
    const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:8080"
      : "https://e-commerce-historias-de-cafe-backend-3c6t.onrender.com";

    const registerPayload = {
      name:     inputName.value.trim(),
      email:    inputEmail.value.trim(),
      password: inputPass1.value
    };

    const btnSubmit = form.querySelector('[type="submit"]');
    if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = "Registrando..."; }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerPayload)
      });

      if (response.status === 409) {
        // El backend devuelve 409 si el correo ya existe
        mostrarError(inputEmail, "El correo ya está registrado");
        Swal.fire({
          icon: 'info',
          iconColor: '#8B5E3C',
          title: 'Este correo ya está registrado',
          confirmButtonColor: '#8B5E3C',
          timer: 3400,
          showConfirmButton: false
        });
        return;
      }

      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

      // UserResponseDTO: { id, name, email, role }
      const nuevoUsuario = await response.json();

      Swal.fire({
        icon: 'success',
        iconColor: '#8B5E3C',
        title: `¡Bienvenid@ ${nuevoUsuario.name}!`,
        text: 'Tu cuenta fue creada exitosamente.',
        confirmButtonColor: '#8B5E3C',
        timer: 3400,
        showConfirmButton: false
      });

      console.log("Usuario registrado:", nuevoUsuario);

      form.reset();
      [inputName, inputEmail, inputPass1, inputPass2].forEach(limpiarError);

    } catch (error) {
      console.error("Error al registrar:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error al conectar con el servidor',
        text: 'No se pudo completar el registro. Inténtalo de nuevo.',
        confirmButtonColor: '#8B5E3C'
      });
    } finally {
      if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = "Registrarse"; }
    }
  });

  // ── Validaciones por campo ─────────────────────────────────────────────────

  function validarNombre(input) {
    const valor = input.value.trim();
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (valor === "") { mostrarError(input, "El nombre es obligatorio"); return false; }
    if (valor.length < 3) { mostrarError(input, "Mínimo 3 caracteres"); return false; }
    if (!soloLetras.test(valor)) { mostrarError(input, "Solo letras y espacios, sin números"); return false; }

    limpiarError(input);
    return true;
  }

  function validarEmail(input) {
    const valor = input.value.trim();
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (valor === "") { mostrarError(input, "El correo es obligatorio"); return false; }
    if (!formatoEmail.test(valor)) { mostrarError(input, "Formato inválido, ej: correo@dominio.com"); return false; }

    limpiarError(input);
    return true;
  }

  function validarFortaleza(input) {
    const valor = input.value;

    if (valor === "") { mostrarError(input, "La contraseña es obligatoria"); return false; }
    if (valor.length < 8) { mostrarError(input, "Mínimo 8 caracteres"); return false; }
    if (!/[A-Z]/.test(valor)) { mostrarError(input, "Debe tener al menos una mayúscula"); return false; }
    if (!/\d/.test(valor)) { mostrarError(input, "Debe tener al menos un número"); return false; }
    if (/ /.test(valor)) { mostrarError(input, "No puede contener espacios"); return false; }

    limpiarError(input);
    return true;
  }

  function validarContrasenas(input1, input2) {
    const p1 = input1.value;
    const p2 = input2.value;

    if (p2 === "") { mostrarError(input2, "Confirma tu contraseña"); return false; }
    if (p1 !== p2) { mostrarError(input2, "Las contraseñas no coinciden"); return false; }

    limpiarError(input2);
    return true;
  }
}
