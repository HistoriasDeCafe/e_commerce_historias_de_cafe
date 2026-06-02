const API_URL_PRODUCTS = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:8080/products"
  : "https://e-commerce-historias-de-cafe-backend-3c6t.onrender.com/products";

let productosBackend = [];
let loading = false;

async function cargarProductosBackend() {
  const contenedor = document.getElementById('catalogo-container');
  const loadingState = document.getElementById('loading-state');
  
  if (!contenedor) return;

  loading = true;
  
  try {
    const response = await fetch(API_URL_PRODUCTS);
    if (!response.ok) throw new Error("No se pudo obtener la lista de cafés del servidor.");
    
    const listaProductos = await response.json();
    
    console.log('=== DEBUG PRODUCTOS DEL BACKEND ===');
    console.log('Total productos:', listaProductos.length);
    if (listaProductos.length > 0) {
      console.log('Primer producto completo:', JSON.stringify(listaProductos[0], null, 2));
    }
    
    productosBackend = listaProductos.map(prod => {
      // El backend devuelve en el campo "image"
      const imageUrl = prod.image || '/assets/img/iconoPepitaCafe-dark.svg';
      
      console.log(`Producto: ${prod.name || 'Sin nombre'} -> image: "${imageUrl}"`);
      
      return {
        id: prod.idProduct || prod.id_product || prod.id,
        nombre: prod.name || "Café Premium",
        origen: prod.origin || prod.categoryName || "Región Origen",
        descripcion: prod.description || "Sin descripción disponible.",
        precio: prod.price || 0,
        image: imageUrl
      };
    });
    
    console.log('Productos procesados:', productosBackend);
    
    // Hide loading state
    if (loadingState) {
      loadingState.style.display = 'none';
    }
    
    // Render products
    renderizarCatalogo();
    
  } catch (error) {
    console.error("Error cargando productos del backend:", error);
    
    // Hide loading state
    if (loadingState) {
      loadingState.style.display = 'none';
    }
    
    Swal.fire({
      icon: 'warning',
      title: 'Error de conexión',
      text: 'No se pudo conectar con el servidor. Por favor intenta más tarde.',
      confirmButtonColor: '#532721'
    });
  } finally {
    loading = false;
  }
}

function renderizarCatalogo() {
  const contenedor = document.getElementById('catalogo-container');
  if (!contenedor) return;
  
  // Clear container except loading state
  const loadingState = document.getElementById('loading-state');
  contenedor.innerHTML = '';
  if (loadingState) {
    contenedor.appendChild(loadingState);
  }
  
  if (productosBackend.length === 0) {
    contenedor.innerHTML += `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--color-secondary, #B08D57);"></i>
        <p style="margin-top: 20px; color: var(--color-primary, #532721);">No hay productos disponibles en este momento.</p>
      </div>
    `;
    return;
  }
  
  // Render each product card
  productosBackend.forEach(product => {
    const cardHTML = `
      <article class="card" data-product-id="${product.id}">
        <div class="image-placeholder">
          <img src="${product.image}" alt="${product.nombre}" onerror="this.src='/assets/img/iconoPepitaCafe-dark.svg'">
        </div>
        <div class="card-content">
          <h3 class="product-name">${product.nombre}</h3>
          <p class="finca product-origin">${product.origen}</p>
          <div class="stars">★★★★★</div>
          <p class="description product-description">${product.descripcion}</p>
          <div class="card-footer">
            <p class="price product-price">$${Number(product.precio).toLocaleString()}</p>
            <button class="btn-cart add-to-cart-btn" data-product-id="${product.id}">
              <i class="fa-solid fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </article>
    `;
    contenedor.innerHTML += cardHTML;
  });
  
  // Notify cart that catalog is ready
  document.dispatchEvent(new CustomEvent('catalogoListo'));
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', cargarProductosBackend);