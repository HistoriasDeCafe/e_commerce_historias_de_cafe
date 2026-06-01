const sidebarUrl = (typeof BASE_URL !== 'undefined' ? BASE_URL : '../../') + 'components/menuAdmin/menuAdmin.html';

// Cargar sidebar y luego inicializar todo
fetch(sidebarUrl)
  .then(response => response.text())
  .then(html => {
    const container = document.getElementById('sidebar-container');
    if (container) {
      container.innerHTML = html;
      inicializarMenuAdmin();
    }
  })
  .catch(err => console.error('Error cargando sidebar:', err));


function inicializarMenuAdmin() {
    const menuItems = document.querySelectorAll(".sidebar ul li");
    const title = document.querySelector(".top-bar span");
    const mainContent = document.querySelector(".content-padding");
    const sidebar = document.querySelector(".sidebar");
    const topBar = document.querySelector(".top-bar");
    const modalProducto = document.getElementById("modal-producto");

    if (!mainContent || !sidebar || !topBar) return;

    // --- FUNCIÓN COMPARTIDA PARA ABRIR EL MODAL ---
    const abrirModal = () => {
        if (modalProducto) {
            modalProducto.style.display = "flex";
        }
    };

    // --- FUNCIÓN COMPARTIDA PARA CERRAR EL MODAL ---
    const cerrarModal = () => {
        if (modalProducto) {
            modalProducto.style.display = "none";
        }
    };

    // Botón estático para añadir productos
    const btnAddEstatico = document.querySelector(".btn-add");
    if (btnAddEstatico) {
        btnAddEstatico.addEventListener("click", async (e) => {
            e.preventDefault();
            abrirModal();

            try {
                // Llamar a la función de admin.js que maneja la carga correcta del formulario
                if (typeof loadProductForm === 'function') {
                    await loadProductForm();
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

    // Cerrar modal con la X
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
            const link = item.querySelector("a");
            if (link) return; // Si tiene un enlace, dejar que navegue normalmente

            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const view = item.dataset.view;

            if (view === "Salir") {
                localStorage.removeItem("usuarioActivo");
                localStorage.removeItem("authToken");
                window.location.href = "../../pages/home/home.html";
                return;
            }

            mainContent.classList.add("fade-out");

            setTimeout(() => {
                if (title) title.textContent = view;
                mainContent.innerHTML = views[view] || "<h2>Vista</h2>";

                if (view === "Productos") {
                    const btnOpenDinamico = document.getElementById("openModal");
                    if (btnOpenDinamico) {
                        btnOpenDinamico.onclick = abrirModal;
                    }
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
        });
    });

    // Toggle sidebar
    const toggleBtn = document.querySelector(".toggle-btn");
    
    // Create overlay
    const overlay = document.createElement("div");
    overlay.classList.add("sidebar-overlay");
    document.body.appendChild(overlay);
    
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
            overlay.classList.toggle("active");
        });
    }
    
    // Close sidebar when clicking overlay
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });
    
    // Close sidebar when clicking a menu item on mobile
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
            }
        });
    });
}