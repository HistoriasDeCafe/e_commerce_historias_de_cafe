// Admin Dashboard JavaScript
// State
let activeView = 'Dashboard';
let adminProductos = [];
let listaUsuarios = [];
let listaOrdenes = [];
let currentPageProductos = 1;
let currentPageUsuarios = 1;
let currentPageOrdenes = 1;
const itemsPerPage = 5;

// API URL
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080'
  : 'https://e-commerce-historias-de-cafe-backend-3c6t.onrender.com';

// Helper: decode JWT payload for debugging
function decodeJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch (e) {
    console.warn('decodeJwt failed:', e);
    return null;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Admin page DOMContentLoaded');
  
  // Check user authentication
  const user = localStorage.getItem('usuarioActivo');
  console.log('User from localStorage:', user);
  
  if (!user) {
    console.log('No user found, redirecting to login');
    const baseUrl = window.BASE_URL || '';
    window.location.href = baseUrl + 'pages/users/users.html';
    return;
  }

  const userData = JSON.parse(user);
  console.log('User data:', userData);
  
  if (userData.role !== 'ADMIN') {
    console.log('User is not ADMIN, redirecting');
    Swal.fire({
      icon: 'error',
      iconColor: '#d93025',
      title: 'Acceso Denegado',
      text: 'No puedes acceder al dashboard de administrador.',
      confirmButtonColor: '#532721'
    }).then(() => {
      const baseUrl = window.BASE_URL || '';
      window.location.href = baseUrl + 'pages/home/home.html';
    });
    return;
  }

  console.log('User is ADMIN, proceeding to load data');

  // Load sidebar
  await loadSidebar();

  // Load data
  console.log('Starting to load products...');
  await loadProductos();
  console.log('Products loaded, adminProductos:', adminProductos);
  
  await loadUsuarios();
  await loadOrdenes();

  // Update dashboard stats
  updateDashboardStats();

  // Initialize event listeners
  initializeEventListeners();
  
  // Auto-refresh orders every 30 seconds
  setInterval(async () => {
    console.log('[ADMIN] Auto-refreshing orders...');
    await loadOrdenes();
    renderOrdenesTable();
    updateDashboardStats();
  }, 30000);
  
  console.log('Admin initialization complete');
});

// Load sidebar component
async function loadSidebar() {
  try {
    const baseUrl = window.BASE_URL || '';
    const response = await fetch(baseUrl + 'components/menuAdmin/menuAdmin.html');
    const html = await response.text();
    const container = document.getElementById('sidebar-container');
    container.innerHTML = html;
    // Fix paths for dynamically loaded components
    if (typeof fixComponentPaths === 'function') {
      fixComponentPaths(container);
    }
    initializeSidebar();
  } catch (error) {
    console.error('Error loading sidebar:', error);
  }
}

// Initialize sidebar navigation
function initializeSidebar() {
  const menuItems = document.querySelectorAll('.sidebar nav ul li');
  
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      const action = item.dataset.action;

      if (action === 'catalog') {
        const baseUrl = window.BASE_URL || '';
        window.location.href = baseUrl + 'pages/catalogo/catalogo.html';
        return;
      }

      if (action === 'logout') {
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('authToken');
        const baseUrl = window.BASE_URL || '';
        window.location.href = baseUrl + 'pages/users/users.html';
        return;
      }

      if (view) {
        switchView(view);
      }
    });
  });
}

// Switch between views
function switchView(viewName) {
  // Update active state in sidebar
  document.querySelectorAll('.sidebar nav ul li').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    }
  });

  // Update title
  document.getElementById('current-view').textContent = viewName;

  // Hide all views
  document.querySelectorAll('[id^="view-"]').forEach(view => {
    view.style.display = 'none';
  });

  // Show selected view
  const selectedView = document.getElementById(`view-${viewName.toLowerCase()}`);
  if (selectedView) {
    selectedView.style.display = 'block';
  }

  // Update data based on view
  if (viewName === 'Productos') {
    renderProductosTable();
  } else if (viewName === 'Usuarios') {
    renderUsuariosTable();
  } else if (viewName === 'Ordenes') {
    renderOrdenesTable();
  } else if (viewName === 'Dashboard') {
    updateDashboardStats();
  }

  activeView = viewName;
}

// Load products from API
async function loadProductos() {
  try {
    const token = localStorage.getItem('authToken');
    console.log('Loading products from:', `${API_URL}/products`);
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('[debug] decoded token:', decodeJwt(token));
    
    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);

    if (response.ok) {
      const products = await response.json();
      console.log('Raw products from API:', products);
      
      adminProductos = products.map(p => ({
        id: p.idProduct || p.id_product || p.id,
        nombre: p.name || 'Sin nombre',
        origen: p.origin || '',
        tostado: p.roast || '',
        region: p.categoryId || '',
        descripcion: p.description || '',
        precio: p.price || 0,
        stock: p.stock || 0,
        image: p.image || '',
        estado: 'activo'
      }));
      
      console.log('Mapped adminProductos:', adminProductos);
    } else {
      console.error('Failed to load products. Status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Load users from API
async function loadUsuarios() {
  try {
    const token = localStorage.getItem('authToken');
    console.log('[debug] decoded token (users):', decodeJwt(token));
    console.log('Loading users from:', `${API_URL}/users`);
    
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Users response status:', response.status);

    if (response.ok) {
      const users = await response.json();
      listaUsuarios = users.map(u => ({
        id: u.id,
        nombre: u.name,
        email: u.email,
        rol: u.role,
        estado: u.stateActive ? 'activo' : 'inactivo'
      }));
    } else {
      console.error('Failed to load users. Status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Load orders from API
async function loadOrdenes() {
  try {
    const token = localStorage.getItem('authToken');
    console.log('[debug] decoded token (orders):', decodeJwt(token));
    console.log('[ADMIN] Loading orders from:', `${API_URL}/orders`);
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('[ADMIN] Orders response status:', response.status);

    if (response.ok) {
      const orders = await response.json();
      console.log('[ADMIN] Raw orders from API:', orders);
      console.log('[ADMIN] Number of orders:', orders.length);
      
      listaOrdenes = orders.map(o => ({
        id: o.id,
        userId: o.userId,
        stateOrder: o.stateOrder,
        subtotal: o.subtotal,
        total: o.total,
        orderDate: o.orderDate,
        details: o.details || []
      }));
      
      console.log('[ADMIN] Mapped listaOrdenes:', listaOrdenes);
    } else {
      console.error('[ADMIN] Failed to load orders. Status:', response.status);
      const errorText = await response.text();
      console.error('[ADMIN] Error response:', errorText);
    }
  } catch (error) {
    console.error('[ADMIN] Error loading orders:', error);
  }
}

// Update dashboard statistics
function updateDashboardStats() {
  const totalVentas = listaOrdenes.reduce((sum, orden) => sum + (orden.total || 0), 0);
  const totalOrdenes = listaOrdenes.length;
  const totalUsuarios = listaUsuarios.length;
  const totalStockBajo = adminProductos.filter(p => p.stock < 5).length;

  document.getElementById('total-ventas').textContent = `$${totalVentas.toLocaleString()}`;
  document.getElementById('total-ordenes').textContent = totalOrdenes;
  document.getElementById('total-usuarios').textContent = totalUsuarios;
  document.getElementById('total-stock-bajo').textContent = totalStockBajo;

  // Update featured products
  updateFeaturedProducts();
}

// Update featured products widget
function updateFeaturedProducts() {
  const featuredContainer = document.getElementById('featured-products');
  const featuredProducts = adminProductos
    .filter(p => p.estado === 'activo')
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 3);

  if (featuredProducts.length === 0) {
    featuredContainer.innerHTML = '<div class="empty-featured"><p>No hay productos destacados</p></div>';
    return;
  }

  featuredContainer.innerHTML = featuredProducts.map((producto, index) => `
    <div class="featured-item">
      <span>${producto.nombre}</span>
      <span class="badge ${index === 0 ? 'badge-top' : index === 1 ? 'badge-nuevo' : 'badge-popular'}">
        ${index === 0 ? 'Top' : index === 1 ? 'Nuevo' : 'Popular'}
      </span>
    </div>
  `).join('');
}

// Render products table
function renderProductosTable() {
  console.log('renderProductosTable called');
  console.log('adminProductos:', adminProductos);
  console.log('adminProductos.length:', adminProductos.length);
  
  const tbody = document.getElementById('productos-table-body');
  const emptyState = document.getElementById('productos-empty-state');
  const pagination = document.getElementById('productos-pagination');

  console.log('tbody element:', tbody);
  console.log('emptyState element:', emptyState);
  console.log('pagination element:', pagination);

  if (!tbody) {
    console.error('productos-table-body not found');
    return;
  }

  document.getElementById('productos-count').textContent = adminProductos.length;

  if (adminProductos.length === 0) {
    console.log('No products to display, showing empty state');
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    pagination.style.display = 'none';
    return;
  }

  console.log('Rendering', adminProductos.length, 'products');
  emptyState.style.display = 'none';
  pagination.style.display = 'flex';

  const totalPages = Math.ceil(adminProductos.length / itemsPerPage);
  const start = (currentPageProductos - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginated = adminProductos.slice(start, end);

  console.log('Paginated products:', paginated);

  tbody.innerHTML = paginated.map(p => `
    <tr>
      <td class="text-left">
        <div class="product-cell">
          <div class="product-name">${p.nombre}</div>
          <div class="product-desc">${p.descripcion ? p.descripcion.substring(0, 50) + '...' : ''}</div>
        </div>
      </td>
      <td class="text-left">${p.origen}</td>
      <td class="text-left">${p.tostado}</td>
      <td class="text-left">${getRegionName(p.region)}</td>
      <td class="text-right">$${p.precio.toLocaleString()}</td>
      <td class="text-right">${p.stock}</td>
      <td class="text-center">
        <span class="status-pill ${p.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'}">
          ${p.estado}
        </span>
      </td>
      <td class="text-center">
        <div class="actions-wrapper">
          <button class="btn-table-edit" onclick="editProduct(${p.id})">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button class="btn-table-delete" onclick="deleteProduct(${p.id})">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  console.log('Table HTML updated');

  // Update pagination info
  document.getElementById('productos-showing-start').textContent = start + 1;
  document.getElementById('productos-showing-end').textContent = Math.min(end, adminProductos.length);
  document.getElementById('productos-total').textContent = adminProductos.length;
  document.getElementById('productos-current-page').textContent = currentPageProductos;
  document.getElementById('productos-total-pages').textContent = totalPages;

  document.getElementById('productos-prev').disabled = currentPageProductos === 1;
  document.getElementById('productos-next').disabled = currentPageProductos === totalPages;
}

// Render users table
function renderUsuariosTable() {
  const tbody = document.getElementById('usuarios-table-body');
  const emptyState = document.getElementById('usuarios-empty-state');
  const pagination = document.getElementById('usuarios-pagination');

  if (listaUsuarios.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    pagination.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  pagination.style.display = 'flex';

  const totalPages = Math.ceil(listaUsuarios.length / itemsPerPage);
  const start = (currentPageUsuarios - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginated = listaUsuarios.slice(start, end);

  tbody.innerHTML = paginated.map(u => `
    <tr>
      <td class="text-left">${u.nombre}</td>
      <td class="text-left">${u.email}</td>
      <td class="text-center">
        <span class="status-pill ${u.rol === 'ADMIN' ? 'badge-activo' : 'badge-inactivo'}">${u.rol || 'CLIENT'}</span>
      </td>
      <td class="text-center">
        <span class="status-pill ${u.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'}">${u.estado || 'activo'}</span>
      </td>
      <td class="text-center">
        <div class="actions-wrapper">
          <button class="btn-table-edit" onclick="editUser(${u.id})">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button class="btn-table-delete" onclick="deleteUser(${u.id})">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Update pagination info
  document.getElementById('usuarios-showing-start').textContent = start + 1;
  document.getElementById('usuarios-showing-end').textContent = Math.min(end, listaUsuarios.length);
  document.getElementById('usuarios-total').textContent = listaUsuarios.length;
  document.getElementById('usuarios-current-page').textContent = currentPageUsuarios;
  document.getElementById('usuarios-total-pages').textContent = totalPages;

  document.getElementById('usuarios-prev').disabled = currentPageUsuarios === 1;
  document.getElementById('usuarios-next').disabled = currentPageUsuarios === totalPages;
}

// Render orders table
function renderOrdenesTable() {
  const tbody = document.getElementById('ordenes-table-body');
  const emptyState = document.getElementById('ordenes-empty-state');
  const pagination = document.getElementById('ordenes-pagination');

  document.getElementById('ordenes-count').textContent = listaOrdenes.length;

  if (listaOrdenes.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    pagination.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  pagination.style.display = 'flex';

  const totalPages = Math.ceil(listaOrdenes.length / itemsPerPage);
  const start = (currentPageOrdenes - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginated = listaOrdenes.slice(start, end);

  tbody.innerHTML = paginated.map(o => `
    <tr>
      <td class="text-left">${o.id}</td>
      <td class="text-left">${formatDate(o.orderDate)}</td>
      <td class="text-left">${o.userId}</td>
      <td class="text-center">
        <span class="status-pill ${o.stateOrder === 'Completada' ? 'badge-activo' : 'badge-inactivo'}">
          ${o.stateOrder}
        </span>
      </td>
      <td class="text-right">${formatCurrency(o.subtotal)}</td>
      <td class="text-right">${formatCurrency(o.total)}</td>
      <td class="text-center">
        <div class="actions-wrapper">
          <button class="btn-table-edit" onclick="viewOrderDetails(${o.id})">
            <i class="bi bi-eye"></i> Ver Detalles
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Update pagination info
  document.getElementById('ordenes-showing-start').textContent = start + 1;
  document.getElementById('ordenes-showing-end').textContent = Math.min(end, listaOrdenes.length);
  document.getElementById('ordenes-total').textContent = listaOrdenes.length;
  document.getElementById('ordenes-current-page').textContent = currentPageOrdenes;
  document.getElementById('ordenes-total-pages').textContent = totalPages;

  document.getElementById('ordenes-prev').disabled = currentPageOrdenes === 1;
  document.getElementById('ordenes-next').disabled = currentPageOrdenes === totalPages;
}

// Helper functions
function getRegionName(regionId) {
  const regions = {
    '1': 'Andina',
    '2': 'Caribe',
    '3': 'Pacífica',
    '4': 'Orinoquía',
    '5': 'Amazonía'
  };
  return regions[regionId] || regionId || '-';
}

function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '-';
  return Number(amount).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Initialize event listeners
function initializeEventListeners() {
  // Toggle sidebar
  document.querySelector('.toggle-btn').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('collapsed');
  });

  // Product pagination
  document.getElementById('productos-prev').addEventListener('click', () => {
    if (currentPageProductos > 1) {
      currentPageProductos--;
      renderProductosTable();
    }
  });

  document.getElementById('productos-next').addEventListener('click', () => {
    const totalPages = Math.ceil(adminProductos.length / itemsPerPage);
    if (currentPageProductos < totalPages) {
      currentPageProductos++;
      renderProductosTable();
    }
  });

  // User pagination
  document.getElementById('usuarios-prev').addEventListener('click', () => {
    if (currentPageUsuarios > 1) {
      currentPageUsuarios--;
      renderUsuariosTable();
    }
  });

  document.getElementById('usuarios-next').addEventListener('click', () => {
    const totalPages = Math.ceil(listaUsuarios.length / itemsPerPage);
    if (currentPageUsuarios < totalPages) {
      currentPageUsuarios++;
      renderUsuariosTable();
    }
  });

  // Order pagination
  document.getElementById('ordenes-prev').addEventListener('click', () => {
    if (currentPageOrdenes > 1) {
      currentPageOrdenes--;
      renderOrdenesTable();
    }
  });

  document.getElementById('ordenes-next').addEventListener('click', () => {
    const totalPages = Math.ceil(listaOrdenes.length / itemsPerPage);
    if (currentPageOrdenes < totalPages) {
      currentPageOrdenes++;
      renderOrdenesTable();
    }
  });

  // Reload orders
  document.getElementById('btn-reload-ordenes').addEventListener('click', async () => {
    await loadOrdenes();
    renderOrdenesTable();
    updateDashboardStats();
  });

  // Close modals
  document.getElementById('close-modal-product').addEventListener('click', closeProductModal);
  document.getElementById('close-modal-user').addEventListener('click', closeUserModal);
  document.getElementById('close-modal-orden').addEventListener('click', closeOrderModal);

  // Add product buttons
  document.getElementById('btn-add-product').addEventListener('click', openAddProductModal);
  document.getElementById('btn-add-first-product').addEventListener('click', openAddProductModal);

  // Add user buttons
  document.getElementById('btn-add-user').addEventListener('click', openAddUserModal);
  document.getElementById('btn-add-first-user').addEventListener('click', openAddUserModal);

  // Modal overlay click to close
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // User form submit
  document.getElementById('user-form').addEventListener('submit', handleUserSubmit);

  // Password toggle
  const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('user-password');
  const passwordIcon = document.getElementById('password-icon');

  if (togglePasswordBtn && passwordInput && passwordIcon) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      passwordIcon.classList.toggle('bi-eye');
      passwordIcon.classList.toggle('bi-eye-slash');
    });
  }
}

// Modal functions
function closeProductModal() {
  document.getElementById('modal-producto').style.display = 'none';
  // Reset form when closing
  if (typeof resetForm === 'function') {
    resetForm();
  }
}

function openAddProductModal() {
  const modal = document.getElementById('modal-producto');
  if (modal) {
    modal.style.display = 'flex';
  }

  // Load product form
  loadProductForm().then(() => {
    // Reset form for new product
    if (typeof resetForm === 'function') {
      resetForm();
    }
  });
}

function closeUserModal() {
  document.getElementById('modal-usuario').style.display = 'none';
  // Reset form when closing
  document.getElementById('user-form').reset();
  document.getElementById('user-form').removeAttribute('data-userId');
  document.getElementById('estado-group').style.display = 'none';
  document.getElementById('password-hint').textContent = '(dejar vacío para mantener actual)';
  document.getElementById('user-submit-text').textContent = 'Guardar Usuario';
}

function openAddUserModal() {
  const modal = document.getElementById('modal-usuario');
  if (modal) {
    modal.style.display = 'flex';
  }

  // Reset form for new user
  document.getElementById('user-form').reset();
  document.getElementById('user-form').removeAttribute('data-userId');
  document.getElementById('estado-group').style.display = 'none';
  document.getElementById('password-hint').textContent = '';
  document.getElementById('user-submit-text').textContent = 'Crear Usuario';
}

function closeOrderModal() {
  document.getElementById('modal-orden').style.display = 'none';
}

// Product operations
function editProduct(id) {
  const product = adminProductos.find(p => p.id === id);
  if (!product) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se encontró el producto',
      confirmButtonColor: '#532721'
    });
    return;
  }

  // Open modal
  const modal = document.getElementById('modal-producto');
  if (modal) {
    modal.style.display = 'flex';
  }

  // Load product form
  loadProductForm().then(() => {
    // Load product data into form
    if (typeof loadProductForEdit === 'function') {
      loadProductForEdit(product);
    }
  });
}

function deleteProduct(id) {
  const product = adminProductos.find(p => p.id === id);
  if (!product) return;

  Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a eliminar "${product.nombre}" de la base de datos.`,
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
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('No se pudo eliminar el producto');

        await loadProductos();
        renderProductosTable();
        updateDashboardStats();

        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El producto ha sido removido con éxito.',
          confirmButtonColor: '#B08D57',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: error.message || 'No se pudo completar la acción',
          confirmButtonColor: '#532721'
        });
      }
    }
  });
}

// Load product form into modal
async function loadProductForm() {
  try {
    const baseUrl = window.BASE_URL || '';
    const formUrl = baseUrl + 'components/product/productForm.html';
    console.log(`[loadProductForm] Loading form from: ${formUrl}`);
    const response = await fetch(formUrl);
    if (!response.ok) {
      console.error(`[loadProductForm] Failed to load form. Status: ${response.status}, URL: ${formUrl}`);
      throw new Error("No se pudo cargar el formulario");
    }

    const htmlFormulario = await response.text();
    const container = document.getElementById("productform-container");
    if (container) {
      container.innerHTML = htmlFormulario;
      // Fix paths for dynamically loaded components
      if (typeof fixComponentPaths === 'function') {
        fixComponentPaths(container);
      }
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
}

function editUser(id) {
  const user = listaUsuarios.find(u => u.id === id);
  if (!user) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se encontró el usuario',
      confirmButtonColor: '#532721'
    });
    return;
  }

  // Open modal
  const modal = document.getElementById('modal-usuario');
  if (modal) {
    modal.style.display = 'flex';
  }

  // Load user data into form
  document.getElementById('user-nombre').value = user.nombre || '';
  document.getElementById('user-email').value = user.email || '';
  document.getElementById('user-rol').value = user.rol || 'CLIENT';
  document.getElementById('user-estado').value = user.estado || 'activo';
  document.getElementById('estado-group').style.display = 'block';
  document.getElementById('password-hint').textContent = '(dejar vacío para mantener actual)';
  document.getElementById('user-submit-text').textContent = 'Actualizar Usuario';

  // Store user ID for update
  document.getElementById('user-form').dataset.userId = id;
}

function deleteUser(id) {
  const user = listaUsuarios.find(u => u.id === id);
  if (!user) return;

  Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a desactivar "${user.nombre}" del sistema. El usuario permanecerá en la base de datos pero no podrá acceder.`,
    icon: 'warning',
    iconColor: '#d33',
    showCancelButton: true,
    confirmButtonColor: '#532721',
    cancelButtonColor: '#7a7a7a',
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/users/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ stateActive: false })
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Desactivado',
            text: 'El usuario ha sido desactivado exitosamente.',
            confirmButtonColor: '#532721'
          });
          await loadUsuarios();
          renderUsuariosTable();
        } else {
          throw new Error('No se pudo desactivar el usuario');
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo desactivar el usuario. Intenta nuevamente.',
          confirmButtonColor: '#532721'
        });
      }
    }
  });
}

function viewOrderDetails(id) {
  const orden = listaOrdenes.find(o => o.id === id);
  if (orden) {
    document.getElementById('orden-id').textContent = orden.id;
    document.getElementById('orden-details').innerHTML = `
      <div class="detail-row">
        <span class="detail-label">ID Orden:</span>
        <span class="detail-value">${orden.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Fecha:</span>
        <span class="detail-value">${formatDate(orden.orderDate)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Usuario ID:</span>
        <span class="detail-value">${orden.userId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Estado:</span>
        <span class="detail-value">
          <span class="status-pill ${orden.stateOrder === 'Completada' ? 'badge-activo' : 'badge-inactivo'}">
            ${orden.stateOrder}
          </span>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Subtotal:</span>
        <span class="detail-value">${formatCurrency(orden.subtotal)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total:</span>
        <span class="detail-value" style="font-weight: bold; font-size: 1.2rem;">${formatCurrency(orden.total)}</span>
      </div>
      <hr style="margin: 1.5rem 0; border: none; height: 2px; background: linear-gradient(90deg, #e8e0d5 0%, #b08d57 50%, #e8e0d5 100%);">
      <h4 style="margin-bottom: 1rem; color: #532721;">Productos en la Orden</h4>
      ${orden.details && orden.details.length > 0 ? orden.details.map(detalle => `
        <div class="product-detail-item">
          <div class="product-detail-info">
            <span class="product-detail-label">Producto ID:</span>
            <span class="product-detail-value">${detalle.productId}</span>
          </div>
          <div class="product-detail-info">
            <span class="product-detail-label">Cantidad:</span>
            <span class="product-detail-value">${detalle.quantityProducts}</span>
          </div>
        </div>
      `).join('') : '<div class="empty-details"><p>No hay detalles de productos disponibles</p></div>'}
    `;
    document.getElementById('modal-orden').style.display = 'flex';
  }
}

function handleUserSubmit(e) {
  e.preventDefault();
  
  const userId = document.getElementById('user-form').dataset.userId;
  const isEditMode = userId !== undefined;
  
  const userData = {
    name: document.getElementById('user-nombre').value.trim(),
    email: document.getElementById('user-email').value.trim(),
    role: document.getElementById('user-rol').value,
    stateActive: document.getElementById('user-estado').value === 'activo'
  };
  
  const password = document.getElementById('user-password').value;
  
  // Password is required for new users
  if (!isEditMode && !password) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La contraseña es obligatoria para crear un nuevo usuario.',
      confirmButtonColor: '#532721'
    });
    return;
  }
  
  if (password) {
    userData.passwordHash = password;
  }
  
  const token = localStorage.getItem('authToken');
  const method = isEditMode ? 'PATCH' : 'POST';
  const url = isEditMode ? `${API_URL}/users/${userId}` : `${API_URL}/users`;
  
  console.log('User submit - Mode:', isEditMode ? 'EDIT' : 'CREATE');
  console.log('User submit - URL:', url);
  console.log('User submit - Method:', method);
  console.log('User submit - userData:', userData);
  console.log('User submit - userId:', userId);
  
  Swal.fire({
    title: isEditMode ? 'Actualizando usuario...' : 'Creando usuario...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  })
  .then(response => {
    console.log('User submit - Response status:', response.status);
    if (!response.ok) {
      console.error('User submit - Response not OK');
      return response.text().then(text => {
        console.error('User submit - Error response:', text);
        throw new Error('No se pudo guardar el usuario');
      });
    }
    return response.json();
  })
  .then(data => {
    Swal.fire({
      icon: 'success',
      title: isEditMode ? 'Actualizado' : 'Creado',
      text: isEditMode ? 'El usuario ha sido actualizado exitosamente.' : 'El usuario ha sido creado exitosamente.',
      confirmButtonColor: '#532721'
    });
    closeUserModal();
    loadUsuarios().then(() => renderUsuariosTable());
  })
  .catch(error => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo guardar el usuario. Intenta nuevamente.',
      confirmButtonColor: '#532721'
    });
  });
}
