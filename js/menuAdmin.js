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
                localStorage.removeItem("authToken"); // Limpieza completa
                window.location.href = "../../pages/home/home.html";
                return;
            }

            // Animación tipo SPA
            if (mainContent) {
                mainContent.classList.add("fade-out");

                setTimeout(() => {
                    if (title) title.textContent = view;
                    mainContent.innerHTML = views[view] || "<h2>Vista</h2>";

                    if (view === "Productos") {
                        // Enlazar el botón que abre el modal ahora que ya existe en el HTML
                        const btnOpen = document.getElementById("openModal");
                        if (btnOpen) {
                            btnOpen.onclick = () => {
                                const modalProducto = document.getElementById("modal-producto");
                                if (modalProducto) modalProducto.style.display = "flex";
                            };
                        }
                        
                        // Inicializar el formulario si tienes la función inyectada en esta vista
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
