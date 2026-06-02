// Product Card Component JavaScript
// Renders a product card with the given product data

function renderProductCard(product, container) {
  const cardTemplate = `
    <article class="card" data-product-id="${product.id || product.idProduct || product.id_product}">
      <div class="image-placeholder">
        <img src="${product.imagen || '/assets/img/iconoPepitaCafe-dark.svg'}" 
             alt="${product.nombre || 'Producto'}" 
             class="product-image"
             onerror="this.src='/assets/img/iconoPepitaCafe-dark.svg'">
      </div>
      <div class="card-content">
        <h3 class="product-name">${product.nombre || 'Sin nombre'}</h3>
        <p class="finca product-origin">${product.origen || product.finca || ''}</p>
        <div class="stars">★★★★★</div>
        <p class="description product-description">${product.descripcion || ''}</p>
        <div class="card-footer">
          <p class="price product-price">$${Number(product.precio || 0).toLocaleString()}</p>
          <button class="btn-cart add-to-cart-btn" data-product-id="${product.id || product.idProduct || product.id_product}">
            <i class="fa-solid fa-cart-plus"></i>
          </button>
        </div>
      </div>
    </article>
  `;
  
  container.insertAdjacentHTML('beforeend', cardTemplate);
}

// Function to render multiple product cards
function renderProductCards(products, container) {
  container.innerHTML = '';
  products.forEach(product => {
    renderProductCard(product, container);
  });
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderProductCard, renderProductCards };
}
