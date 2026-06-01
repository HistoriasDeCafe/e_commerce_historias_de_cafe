// BASE_URL - Se usa para cargar componentes dinámicos
const BASE_URL = (() => {
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    // En GitHub Pages, extraer el nombre del repo de la URL
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const repoName = pathParts[0];
    console.log(`[BASE_URL] GitHub Pages detectado, repo: ${repoName}`);
    return `/${repoName}/`;
  }
  
  // Para desarrollo local - calcular desde la ubicación del script main.js
  const scripts = document.querySelectorAll('script[src]');
  for (const s of scripts) {
    if (s.src.includes('main.js')) {
      const scriptUrl = new URL(s.src);
      // Si el script está en /js/main.js, la raíz es un nivel arriba
      const pathParts = scriptUrl.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && pathParts[pathParts.length - 2] === 'js') {
        pathParts.pop(); // Remover main.js
        pathParts.pop(); // Remover js
        const basePath = scriptUrl.origin + '/' + pathParts.join('/') + (pathParts.length > 0 ? '/' : '');
        console.log(`[BASE_URL] Local detectado desde script: ${basePath}`);
        return basePath;
      }
      console.log(`[BASE_URL] Local fallback desde script: ${scriptUrl.origin}/`);
      return scriptUrl.origin + '/';
    }
  }
  
  // Fallback - usar origin del documento
  console.log(`[BASE_URL] Local fallback: ${window.location.origin}/`);
  return window.location.origin + '/';
})();

// Hacer BASE_URL disponible globalmente para otros scripts
window.BASE_URL = BASE_URL;

console.log(`[main.js] BASE_URL detectado: ${BASE_URL}`);
console.log(`[main.js] Hostname: ${window.location.hostname}`);
console.log(`[main.js] Pathname: ${window.location.pathname}`);

function loadComponent(containerId, relativePath, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Construir URL absoluta desde la raíz del proyecto
  const url = BASE_URL + relativePath;

  console.log(`[loadComponent] Cargando: ${url} en #${containerId}`);

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.text();
    })
    .then((data) => {
      container.innerHTML = data;
      console.log(`[loadComponent] Componente cargado exitosamente: #${containerId}`);
      
      // Corregir rutas en el componente cargado
      fixComponentPaths(container);
      
      if (callback) callback();
    })
    .catch((err) => {
      console.error(`[loadComponent] Error cargando componente:`, url, err);
      container.innerHTML = `<div style="padding: 20px; color: red;">Error cargando componente: ${err.message}</div>`;
    });
}

// Función para corregir rutas en componentes dinámicos
function fixComponentPaths(container) {
  console.log(`[fixComponentPaths] Corrigiendo rutas en container:`, container.id);
  
  // Marcar container como procesado para evitar bucles
  if (container.dataset.pathsFixed === 'true') {
    console.log(`[fixComponentPaths] Container ya procesado, omitiendo`);
    return;
  }
  
  // Corregir links href
  container.querySelectorAll('a[href]').forEach(link => {
    const originalHref = link.getAttribute('href');
    if (originalHref && originalHref.startsWith('/')) {
      const needsBasePath = !originalHref.startsWith(BASE_URL.slice(0, -1));
      if (needsBasePath) {
        const newHref = BASE_URL + originalHref.substring(1);
        link.setAttribute('href', newHref);
        console.log(`[fixComponentPaths] a href: ${originalHref} -> ${newHref}`);
      }
    }
  });
  
  // Corregir imágenes - verificar el atributo src original
  container.querySelectorAll('img').forEach(img => {
    const originalSrc = img.getAttribute('src');
    if (originalSrc && originalSrc.startsWith('/')) {
      const needsBasePath = !originalSrc.startsWith(BASE_URL.slice(0, -1));
      if (needsBasePath) {
        const newSrc = BASE_URL + originalSrc.substring(1);
        img.setAttribute('src', newSrc);
        console.log(`[fixComponentPaths] img: ${originalSrc} -> ${newSrc}`);
      }
    }
  });
  
  // Corregir enlaces en scripts (onclick, etc)
  container.querySelectorAll('[href]').forEach(el => {
    if (el.href && el.href.includes('/')) {
      const href = el.href;
      if (href.includes(BASE_URL.slice(0, -1)) === false && href.startsWith(window.location.origin + '/')) {
        const pathOnly = href.replace(window.location.origin, '');
        if (pathOnly.startsWith('/') && !pathOnly.startsWith(BASE_URL.slice(0, -1))) {
          const newHref = window.location.origin + BASE_URL + pathOnly.substring(1);
          el.href = newHref;
          console.log(`[fixComponentPaths] [href]: ${href} -> ${newHref}`);
        }
      }
    }
  });
  
  // Marcar como procesado
  container.dataset.pathsFixed = 'true';
}

//  Navbar logic
function initNavbar() {
  const links = document.querySelectorAll(".opcionesBarra");

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (
        window.location.pathname ===
        new URL(href, window.location.origin).pathname
      ) {
        return;
      }

      e.preventDefault();

      const transition = document.getElementById("coffecup-transition");
      if (!transition) {
        window.location.href = href;
        return;
      }

      sessionStorage.setItem("coffeeAnimation", "played");
      document.body.style.overflow = "hidden";
      transition.style.display = "flex";
      transition.classList.add("launching");

      setTimeout(() => {
        window.location.href = href;
      }, 900);
    });
  });

  const navLinks = document.querySelectorAll(".nav-link");
  const menuCollapse = document.getElementById("navbarMenu");
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  const userInfo = document.getElementById("user-info");
  const userName = document.getElementById("user-name");
  const authBtn = document.getElementById("nav-auth-btn");
  const adminLink = document.getElementById("admin-link");

  // Limpiar carrito al cargar si hay cambio de usuario
  const lastUserId = localStorage.getItem('lastUserId');
  const currentUserId = usuarioActivo ? usuarioActivo.id : null;
  
  if (lastUserId && currentUserId && lastUserId !== String(currentUserId)) {
    localStorage.removeItem('carritoCafe');
    console.log('Carrito limpiado por cambio de usuario');
  }
  
  if (currentUserId) {
    localStorage.setItem('lastUserId', String(currentUserId));
  }

  if (usuarioActivo && authBtn && userInfo && userName) {
    // ESTADO: LOGUEADO
    const primerNombre = usuarioActivo.name ? usuarioActivo.name.split(" ")[0] : (usuarioActivo.fullName ? usuarioActivo.fullName.split(" ")[0] : 'Usuario');
    userName.textContent = primerNombre;
    userInfo.style.display = "flex";
    
    authBtn.innerHTML = '<i class="bi bi-box-arrow-right"></i> Cerrar Sesión';
    authBtn.classList.remove("login-btn");
    authBtn.classList.add("logout-btn");

    // Mostrar admin link si es ADMIN
    if (adminLink && usuarioActivo.role === 'ADMIN') {
      adminLink.style.display = "flex";
    }

    authBtn.onclick = () => {
      localStorage.removeItem("usuarioActivo");
      localStorage.removeItem("authToken");
      window.location.href = BASE_URL + "pages/home/home.html";
    };
  } else if (authBtn && userInfo && userName) {
    // ESTADO: INVITADO
    userInfo.style.display = "none";
    authBtn.innerHTML = '<i class="bi bi-person"></i> Iniciar Sesión';
    authBtn.classList.remove("logout-btn");
    authBtn.classList.add("login-btn");

    if (adminLink) {
      adminLink.style.display = "none";
    }

    authBtn.onclick = () => {
      window.location.href = BASE_URL + "pages/users/users.html";
    };
  }

  navLinks.forEach((l) => {
    l.addEventListener("click", () => {
      if (window.innerWidth < 992) {
        const bsCollapse = new bootstrap.Collapse(menuCollapse);
        bsCollapse.hide();
      }
    });
  });
}

//  CONTROL DE ANIMACIÓN
function handlePageAnimation() {
  const transition = document.getElementById("coffecup-transition");
  const played = sessionStorage.getItem("coffeeAnimation");

  if (!transition) return;

  if (played === "played") {
    transition.style.display = "none";
    sessionStorage.removeItem("coffeeAnimation");
  } else {
    transition.style.display = "none";
  }
}

// UN SOLO DOMContentLoaded — aquí va TODO
document.addEventListener("DOMContentLoaded", () => {
  handlePageAnimation();

  loadComponent("navbar-container", "components/navBar/navBar.html", initNavbar);
  loadComponent("footer-container", "components/footer/footer.html");

  if (document.getElementById("register-container")) {
    loadComponent("register-container", "components/register/register.html", cargarFormRegister);
  }

  if (document.getElementById("login-container")) {
    loadComponent("login-container", "components/login/login.html", inicializarLogin);
  }

  if (document.getElementById("contact-container")) {
    loadComponent("contact-container", "components/contact/contact.html", cargarFormContact);
  }

  loadComponent("carrito-container", "components/cart/cart.html",
    (typeof initCart === 'function') ? initCart : () => console.warn("initCart no definida")
  );

  // productForm se carga dinámicamente desde admin.js cuando se necesita
  // No se carga aquí para evitar intentos fallidos en páginas que no lo necesitan
});
