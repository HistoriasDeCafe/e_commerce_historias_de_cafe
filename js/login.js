function inicializarLogin() {
    const form = document.getElementById("login-form");
    const inputEmail = document.getElementById("log-email");
    const inputPassword = document.getElementById("log-password");

    if (!form) return;

    // ── Ojito: mostrar / ocultar contraseña ───────────────────────────────
    document.querySelectorAll(".toggle-pass").forEach(function (icono) {
        icono.addEventListener("click", function () {
            const input = document.getElementById(this.getAttribute("data-target"));
            const viendo = input.type === "text";
            input.type = viendo ? "password" : "text";
            this.classList.toggle("fa-eye", viendo);
            this.classList.toggle("fa-eye-slash", !viendo);
        });
    });

    // ── Submit ─────────────────────────────────────────────────────────────
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        [inputEmail, inputPassword].forEach(limpiarError);

        const emailOk = validarEmail(inputEmail);
        const passOk  = validarPassword(inputPassword);

        if (!emailOk || !passOk) return;

        // ── API: POST /auth/login ──────────────────────────────────────────
        const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? "http://localhost:8080"
            : "https://e-commerce-historias-de-cafe-backend-3c6t.onrender.com";

        const loginPayload = {
            email:    inputEmail.value.trim(),
            password: inputPassword.value
        };

        const btnSubmit = form.querySelector('[type="submit"]');
        if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = "Ingresando..."; }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginPayload)
            });

            if (response.status === 401 || response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    iconColor: '#8B5E3C',
                    title: '¡Correo o contraseña incorrectos!',
                    confirmButtonColor: '#8B5E3C'
                });
                return;
            }

            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

            // AuthResponseDTO: { token, user: { id, name, email, role } }
            const data = await response.json();
            const usuario = data.user;
            const token   = data.token;

            // Guardamos sesión en localStorage
            localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
            localStorage.setItem("authToken", token);

            // Redirigir según rol
            if (usuario.role && usuario.role.toUpperCase() === "ADMIN") {
                Swal.fire({
                    icon: 'success',
                    iconColor: '#8B5E3C',
                    title: '¡OK! Ingresando al módulo de administración!',
                    confirmButtonColor: '#8B5E3C',
                    timer: 3400,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "../../pages/admin/admin.html";
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    iconColor: '#8B5E3C',
                    title: `¡Bienvenid@ ${usuario.name}!`,
                    confirmButtonColor: '#8B5E3C',
                    timer: 3400,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "../../pages/home/home.html";
                });
            }

        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al conectar con el servidor',
                text: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
                confirmButtonColor: '#8B5E3C'
            });
        } finally {
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = "Ingresar"; }
        }
    });

    // ── Validaciones ──────────────────────────────────────────────────────

    function validarEmail(input) {
        const valor = input.value.trim();
        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (valor === "") { mostrarError(input, "El correo es obligatorio"); return false; }
        if (!formatoEmail.test(valor)) { mostrarError(input, "Formato inválido, ej: correo@dominio.com"); return false; }

        limpiarError(input);
        return true;
    }

    function validarPassword(input) {
        const valor = input.value;

        if (valor === "") { mostrarError(input, "La contraseña es obligatoria"); return false; }

        limpiarError(input);
        return true;
    }
}
