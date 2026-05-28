// Estado de la aplicación para renderizar la tabla de administración
let listaProductos = [];

// Base URL de tu API de productos (detecta si estás en local o producción)
const API_URL_PRODUCTS = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:8080/products"
  : "https://e-commerce-historias-de-cafe-backend.onrender.com/products";

function obtenerHeadersAutenticados() {
  const token = localStorage.getItem("authToken");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function usuarioTienePermisosAdmin() {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  return usuarioActivo && usuarioActivo.role && usuarioActivo.role.toUpperCase() === "ADMIN";
}

// --- 1. LÓGICA DEL FORMULARIO (CONECTADA CON EL BACKEND) ---
function initProductLogic() {
  const form = document.getElementById("form-producto");
  const modal = document.getElementById("modal-producto");

  if (!form) {
    console.error("No se encontró el formulario con id 'form-producto'");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!usuarioTienePermisosAdmin()) {
      Swal.fire({
        icon: "error",
        title: "Permisos insuficientes",
        text: "Debes iniciar sesión con un usuario ADMIN para crear productos.",
        confirmButtonColor: "#532721"
      });
      return;
    }

    // Limpiar errores anteriores
    document.querySelectorAll(".invalid-feedback").forEach((el) => el.remove());
    document.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

    let isValid = true;

    // --- ENLAZAR INPUTS ---
    const nombreInput = document.getElementById("marca") || document.getElementById("nombre-producto");
    const origenInput = document.getElementById("origen");
    const tostadoInput = document.getElementById("tostado");
    const regionInput = document.getElementById("region");
    const imagenInput = document.getElementById("imagen");
    const stockInput = document.getElementById("stock");
    const precioInput = document.getElementById("precio");
    const descInput = document.getElementById("descripcion");

    // --- VALIDACIONES ---
    if (!nombreInput || nombreInput.value.trim().length < 3) {
      if (nombreInput) mostrarError(nombreInput, "El nombre del producto es obligatorio (mín. 3 caracteres)");
      isValid = false;
    }
    if (!origenInput || origenInput.value.trim().length < 3) {
      if (origenInput) mostrarError(origenInput, "La finca de origen es obligatoria (mín. 3 caracteres)");
      isValid = false;
    }
    if (!tostadoInput || !tostadoInput.value) {
      if (tostadoInput) mostrarError(tostadoInput, "Selecciona un tipo de tostión");
      isValid = false;
    }
    if (!regionInput || !regionInput.value) {
      if (regionInput) mostrarError(regionInput, "Selecciona la región del café");
      isValid = false;
    }
    if (!imagenInput || !imagenInput.files || !imagenInput.files[0]) {
      if (imagenInput) mostrarError(imagenInput, "Debes cargar una imagen");
      isValid = false;
    }
    if (!stockInput || stockInput.value === "" || parseInt(stockInput.value) < 0) {
      if (stockInput) mostrarError(stockInput, "El stock no puede ser negativo");
      isValid = false;
    }
    if (!precioInput || precioInput.value === "" || parseFloat(precioInput.value) <= 0) {
      if (precioInput) mostrarError(precioInput, "El precio debe ser mayor a 0");
      isValid = false;
    }
    if (!descInput || descInput.value.trim().length < 10) {
      if (descInput) mostrarError(descInput, "La descripción debe tener al menos 10 caracteres");
      isValid = false;
    }

    // --- ENVÍO DE DATOS A SPRING BOOT (CON OPTIMIZACIÓN DE CLOUDINARY) ---
    if (isValid) {
      const file = imagenInput.files[0];
      
      const CLOUD_NAME = "dg6oyckab"; 
      const UPLOAD_PRESET = "historias_de_cafe"; 
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const btnSubmit = form.querySelector("button[type='submit']");
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Subiendo imagen a la nube...";
      }

      try {
        // FASE A: Subir imagen a Cloudinary
        const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData
        });

        if (!cloudinaryResponse.ok) throw new Error("Error al subir la imagen a Cloudinary.");

        const cloudinaryData = await cloudinaryResponse.json();
        const urlPublicaImagen = cloudinaryData.secure_url; 

        if (btnSubmit) btnSubmit.textContent = "Guardando producto en base de datos...";

        const productoPayload = {
          name: nombreInput.value.trim(),
          origin: origenInput ? origenInput.value.trim() : "",
          roast: tostadoInput ? tostadoInput.value : "",
          description: descInput.value.trim(),
          price: parseFloat(precioInput.value),
          stock: parseInt(stockInput.value),
          categoryId: Number(regionInput.value),
          imagen: urlPublicaImagen
        };

        console.log("Enviando payload al backend:", productoPayload);

        // FASE C: Petición POST al Controlador de Spring Boot
        const response = await fetch(API_URL_PRODUCTS, {
          method: "POST",
          headers: obtenerHeadersAutenticados(),
          body: JSON.stringify(productoPayload)
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("No tienes autorización para crear productos. Vuelve a iniciar sesión como ADMIN.");
        }

        if (!response.ok) throw new Error(`El backend rechazó los datos (Error ${response.status}).`);

        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Guardar Producto";
        }

        form.reset();

        // Ocultar modal de forma segura
        if (modal) {
          if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
            modalInstance.hide();
          } else {
            modal.style.display = "none";
          }
        }

        if (typeof cargarProductosDesdeBackend === 'function') {
          await cargarProductosDesdeBackend();
        }

        Swal.fire({
          icon: "success",
          iconColor: "#532721",
          title: "¡Café Registrado!",
          text: "El producto y su imagen en la nube se guardaron exitosamente.",
          confirmButtonColor: "#B08D57",
          confirmButtonText: "Excelente",
        });

      } catch (error) {
        console.error("Error en el flujo de guardado:", error);
        
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Guardar Producto";
        }

        Swal.fire({
          icon: "error",
          title: "Error al procesar",
          text: error.message || "No se pudo registrar el producto. Verifica que los campos cumplan las validaciones del backend.",
          confirmButtonColor: "#532721"
        });
      }
    }
  }); 
} 

// --- 2. ELIMINAR PRODUCTO (CONECTADO A DELETE /products/{id}) ---
function eliminarProducto(id) {
  if (!id) return;

  if (!usuarioTienePermisosAdmin()) {
    Swal.fire({
      icon: "error",
      title: "Permisos insuficientes",
      text: "Debes iniciar sesión con un usuario ADMIN para eliminar productos.",
      confirmButtonColor: "#532721"
    });
    return;
  }

  const producto = listaProductos.find(prod => (prod.idProduct || prod.id) === id);
  const nombreDisplay = producto ? producto.name : "este producto";

  Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a eliminar "${nombreDisplay}" de la base de datos.`,
    icon: 'warning',
    iconColor: '#d33',
    showCancelButton: true,
    confirmButtonColor: '#532721',
    cancelButtonColor: '#7a7a7a',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true 
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL_PRODUCTS}/${id}`, {
          method: "DELETE",
          headers: obtenerHeadersAutenticados()
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("No tienes autorización para eliminar productos. Vuelve a iniciar sesión como ADMIN.");
        }

        if (!response.ok) throw new Error(`No se pudo eliminar el producto del servidor. Error ${response.status}.`);

        if (typeof cargarProductosDesdeBackend === 'function') {
          await cargarProductosDesdeBackend();
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El producto ha sido removido con éxito.',
          confirmButtonColor: '#B08D57',
          timer: 2000,
          showConfirmButton: false
        });

      } catch (error) {
        console.error("Error al eliminar producto:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: error.message || 'No se pudo completar la acción en el servidor.',
          confirmButtonColor: '#532721'
        });
      }
    }
  });
}

// --- 3. MOSTRAR ERRORES ---
function mostrarError(input, mensaje) {
  input.classList.add("is-invalid");
  const error = document.createElement("div");
  error.className = "invalid-feedback";
  error.textContent = mensaje;
  input.parentElement.appendChild(error);

  input.addEventListener("input", function handleInput() {
    if (input.value.trim() !== "") {
      input.classList.remove("is-invalid");
      error.remove();
      input.removeEventListener("input", handleInput);
    }
  });
}

// --- 4. RENDERIZAR TABLA ---
function actualizarTabla() {
  const tbody = document.getElementById("cuerpo-tabla");
  if (!tbody) return;

  tbody.innerHTML = "";

  listaProductos.forEach((prod) => {
    const estadoActual = "Activo";
    const badgeClass = "badge-activo";

    const idReal = prod.idProduct || prod.id;
    const nombreProd = prod.name || "Café Tradicional";
    const precioProd = prod.price || 0;
    const regionProd = prod.categoryName || "Región Premium";

    const fila = `
            <tr>
                <td class="text-left">
                  <strong>${nombreProd}</strong>
                  <br><small style="color: #888; font-size: 0.8rem;">📍 ${regionProd}</small>
                </td>
                <td class="text-right"><strong>$${precioProd.toLocaleString('es-CO')}</strong></td>
                <td class="text-right">${prod.stock} uds</td>
                <td class="text-center">
                    <span class="${badgeClass}">${estadoActual}</span>
                </td>
                <td class="text-center">
                    <div class="actions-wrapper">
                        <button class="btn-table-edit" title="Editar">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn-table-delete" title="Borrar" data-id="${idReal}" onclick="eliminarProducto(${idReal})">
                            <i class="bi bi-trash"></i> Borrar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    tbody.innerHTML += fila;
  });
}

// --- 5. CARGAR PRODUCTOS DESDE BACKEND ---
async function cargarProductosDesdeBackend() {
  try {
    console.log("Cargando productos desde:", API_URL_PRODUCTS);
    const response = await fetch(API_URL_PRODUCTS, {
      headers: obtenerHeadersAutenticados()
    });
    if (!response.ok) throw new Error("No se pudieron recuperar los productos.");

    const productosRecuperados = await response.json();
    console.log("Productos recibidos del backend:", productosRecuperados);
    listaProductos = productosRecuperados;
    console.log("Lista de productos actualizada:", listaProductos);
    actualizarTabla();
  } catch (error) {
    console.error("Error cargando productos desde la API:", error);
  }
}

// --- 6. INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  cargarProductosDesdeBackend();
});
