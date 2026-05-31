// Calcula la ruta base desde la ubicación del script hacia la raíz del proyecto
// main.js está en /js/, así que la raíz es un nivel arriba
const BASE_URL = (() => {
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    // En GitHub Pages, extraer el nombre del repo de la URL
    // Formato: https://username.github.io/repo-name/pages/home/home.html
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    // El primer segmento es el nombre del repo en GitHub Pages
    const repoName = pathParts[0];
    console.log(`[BASE_URL] GitHub Pages detectado, repo: ${repoName}`);
    return `/${repoName}/`;
  }
  
  // Para desarrollo local
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
        console.log(`[BASE_URL] Local detectado, path: ${basePath}`);
        return basePath;
      }
      console.log(`[BASE_URL] Local fallback: ${scriptUrl.origin}/`);
      return scriptUrl.origin + '/';
    }
  }
  
  // Fallback
  console.log(`[BASE_URL] Fallback: /`);
  return '/';
})();

// Hacer BASE_URL disponible globalmente para otros scripts
window.BASE_URL = BASE_URL;

console.log(`[main.js] BASE_URL detectado: ${BASE_URL}`);
console.log(`[main.js] Hostname: ${window.location.hostname}`);
console.log(`[main.js] Pathname: ${window.location.pathname}`);

// Función para corregir rutas de assets para GitHub Pages
function fixAssetPaths() {
  // Solo corregir si BASE_URL no es '/'
  if (BASE_URL === '/') return;
  
  console.log(`[fixAssetPaths] Corrigiendo rutas de assets con BASE_URL: ${BASE_URL}`);
  
  // Corregir imágenes
  document.querySelectorAll('img[src^="/"]').forEach(img => {
    const originalSrc = img.src;
    if (originalSrc.startsWith(window.location.origin + '/')) {
      const path = originalSrc.replace(window.location.origin + '/', '');
      img.src = BASE_URL + path;
      console.log(`[fixAssetPaths] img: ${originalSrc} -> ${img.src}`);
    }
  });
  
  // Corregir videos
  document.querySelectorAll('video source[src^="/"]').forEach(source => {
    const originalSrc = source.src;
    if (originalSrc.startsWith(window.location.origin + '/')) {
      const path = originalSrc.replace(window.location.origin + '/', '');
      source.src = BASE_URL + path;
      console.log(`[fixAssetPaths] video source: ${originalSrc} -> ${source.src}`);
    }
  });
  
  // Corregir background-image en estilos inline
  document.querySelectorAll('[style*="background-image"]').forEach(el => {
    const style = el.getAttribute('style');
    const bgMatch = style.match(/url\(['"]?\/[^'")]+['"]?\)/);
    if (bgMatch) {
      const originalUrl = bgMatch[0];
      const cleanUrl = originalUrl.replace(/url\(['"]?|['"]?\)/g, '');
      if (cleanUrl.startsWith('/')) {
        const newUrl = `url('${BASE_URL + cleanUrl.substring(1)}')`;
        el.setAttribute('style', style.replace(originalUrl, newUrl));
        console.log(`[fixAssetPaths] background-image: ${originalUrl} -> ${newUrl}`);
      }
    }
  });
  
  // Corregir links CSS
  document.querySelectorAll('link[href^="/"]').forEach(link => {
    const originalHref = link.href;
    if (originalHref.startsWith(window.location.origin + '/')) {
      const path = originalHref.replace(window.location.origin + '/', '');
      link.href = BASE_URL + path;
      console.log(`[fixAssetPaths] link: ${originalHref} -> ${link.href}`);
    }
  });
  
  // Corregir scripts
  document.querySelectorAll('script[src^="/"]').forEach(script => {
    const originalSrc = script.src;
    if (originalSrc.startsWith(window.location.origin + '/')) {
      const path = originalSrc.replace(window.location.origin + '/', '');
      script.src = BASE_URL + path;
      console.log(`[fixAssetPaths] script: ${originalSrc} -> ${script.src}`);
    }
  });
  
  // Corregir links (a href)
  document.querySelectorAll('a[href^="/"]').forEach(link => {
    const originalHref = link.getAttribute('href');
    if (originalHref && originalHref.startsWith('/')) {
      link.setAttribute('href', BASE_URL + originalHref.substring(1));
      console.log(`[fixAssetPaths] a href: ${originalHref} -> ${link.getAttribute('href')}`);
    }
  });
}

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
      if (callback) callback();
    })
    .catch((err) => {
      console.error(`[loadComponent] Error cargando componente:`, url, err);
      container.innerHTML = `<div style="padding: 20px; color: red;">Error cargando componente: ${err.message}</div>`;
    });
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

  // Corregir rutas de assets para GitHub Pages
  fixAssetPaths();

  loadComponent("navbar-container", "components/navBar/navBar.html", () => {
    initNavbar();
    // Corregir rutas después de cargar navbar
    fixAssetPaths();
  });
  
  loadComponent("footer-container", "components/footer/footer.html", () => {
    // Corregir rutas después de cargar footer
    fixAssetPaths();
  });

  if (document.getElementById("register-container")) {
    loadComponent("register-container", "components/register/register.html", () => {
      cargarFormRegister();
      fixAssetPaths();
    });
  }

  if (document.getElementById("login-container")) {
    loadComponent("login-container", "components/login/login.html", () => {
      inicializarLogin();
      fixAssetPaths();
    });
  }

  if (document.getElementById("contact-container")) {
    loadComponent("contact-container", "components/contact/contact.html", () => {
      cargarFormContact();
      fixAssetPaths();
    });
  }

  loadComponent("carrito-container", "components/cart/cart.html",
    () => {
      if (typeof initCart === 'function') initCart();
      else console.warn("initCart no definida");
      fixAssetPaths();
    }
  );

  loadComponent("productform-container", "components/product/productForm.html",
    () => {
      if (typeof initProductLogic === 'function') initProductLogic();
      else console.warn("producto no definido");
      fixAssetPaths();
    }
  );
});
