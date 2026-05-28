const sidebarUrl = (typeof BASE_URL !== 'undefined' ? BASE_URL : '../../') + 'components/menuAdmin/menuAdmin.html';

fetch(sidebarUrl)
  .then(response => response.text())
  .then(html => {
    const container = document.getElementById('sidebar-container');
    if (container) {
      container.innerHTML = html;
      activarMenu();
    }
  })
  .catch(err => console.error('Error cargando sidebar:', err));


function activarMenu() {
  const items = document.querySelectorAll('.sidebar nav ul li');

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const view = item.getAttribute('data-view');
      const headerTitle = document.querySelector('.main-content h1');
      if (headerTitle) headerTitle.textContent = view;
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".sidebar ul li");
    const title = document.querySelector(".top-bar span");
    const mainContent = document.querySelector(".content-padding");
    
    // Capturamos el modal globalmente en este archivo
    const modalProducto = document.getElementById("modal-producto");

    // --- FUNCIÓN COMPARTIDA PARA ABRIR EL MODAL ---
    const abrirModal = () => {
        if (modalProducto) {
            // Si usas el JS de Bootstrap, lo abrimos con su API
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalProducto);
                modalInstance.show();
            } else {
                // Si solo usas CSS personalizado para el modal
                modalProducto.style.display = "flex";
            }
        }
    };

    // --- FUNCIÓN COMPARTIDA PARA CERRAR EL MODAL ---
    const cerrarModal = () => {
        if (modalProducto) {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modalInstance = bootstrap.Modal.getInstance(modalProducto);
                if (modalInstance) modalInstance.hide();
            } else {
                modalProducto.style.display = "none";
            }
        }
    };

    // ================================================================
    // SOLUCIÓN AL BOTÓN ESTÁTICO: Escuchamos al botón que ya viene en el HTML
    // ================================================================
    const btnAddEstatico = document.querySelector(".btn-add");
    if (btnAddEstatico) {
        btnAddEstatico.addEventListener("click", async (e) => {
            e.preventDefault();
            
            // Abrir el modal
            abrirModal();

            // Cargar el formulario HTML dinámicamente
            try {
                const formUrl = (typeof BASE_URL !== 'undefined' ? BASE_URL : '../../') + 'components/product/productForm.html';
                const respuesta = await fetch(formUrl);
                if (!respuesta.ok) throw new Error("No se pudo cargar el formulario");

                const htmlFormulario = await respuesta.text();
                const container = document.getElementById("productform-container");
                if (container) {
                    container.innerHTML = htmlFormulario;
                    
                    // Inicializar la lógica del formulario después de cargar el HTML
                    if (typeof initProductLogic === 'function') {
                        initProductLogic();
                    }
                }
            } catch (error) {
                console.error("Error cargando el form:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar el formulario de producto.',
                    confirmButtonColor: '#532721'
                });
            }
        });
    }

    // Escuchamos a la 'X' para cerrar el modal (usando event delegation)
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("close-btn") || e.target.closest(".close-btn")) {
            cerrarModal();
        }
    });

    const views = {
        "Dashboard": "<h2>Dashboard</h2>",
        "Productos": "<h2>Productos</h2><button id='openModal' class='btn-admin'>Nuevo Producto</button><div id='productform-container'></div>",
        "Ordenes": "<h2>Órdenes</h2>",
        "Usuarios": "<h2>Usuarios</h2>",
        "Configuración": "<h2>Configuración</h2>",
        "Salir": "<h2>Salir</h2>"
    };

    menuItems.forEach(item => {
        item.addEventListener("click", () => {

            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const view = item.dataset.view;

            if (view === "Salir") {
                localStorage.removeItem("usuarioActivo");
                localStorage.removeItem("authToken"); 
                window.location.href = "../../pages/home/home.html";
                return;
            }

            // Animación tipo SPA
            if (mainContent) {
                mainContent.classList.add("fade-out");

                setTimeout(() => {
                    if (title) title.textContent = view;
                    
                    // 1. Inyectamos el HTML de la vista
                    mainContent.innerHTML = views[view] || "<h2>Vista</h2>";

                    // 2. Si es la vista de Productos, escuchamos al botón DINÁMICO
                    if (view === "Productos") {
                        const btnOpenDinamico = document.getElementById("openModal");
                        if (btnOpenDinamico) {
                            btnOpenDinamico.onclick = abrirModal; 
                        }
                        
                        // Inicializamos tu lógica de validación y envío de products.js
                        if (typeof initProductLogic === 'function') {
                            initProductLogic();
                        }
                    }

                    mainContent.classList.remove("fade-out");
                    mainContent.classList.add("fade-in");

                    setTimeout(() => {
                        mainContent.classList.remove("fade-in");
                    }, 300);

                }, 200);
            }
        });
    });

    // Toggle sidebar
    const topBar = document.querySelector(".top-bar");
    const sidebar = document.querySelector(".sidebar");

    if (topBar && sidebar) {
        const toggleBtn = document.createElement("button");
        toggleBtn.innerHTML = "<i class='bi bi-list'></i>";
        toggleBtn.classList.add("toggle-btn");

        topBar.prepend(toggleBtn);

        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }
});