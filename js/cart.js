function initCart() {
  // 1. VARIABLES
  let cantidadItems = 0;
  let totalAcumulado = 0;
  let items = [];

  // 2. LOCAL STORAGE
  let carritoGuardado = JSON.parse(localStorage.getItem("carritoCafe")) || [];

  // 3. REFERENCIAS
  const carritoLateral = document.querySelector('#carrito-lateral');
  const carritoOverlay = document.querySelector('#carrito-overlay');
  const carritoItems = document.querySelector('#carrito-items');
  const carritoVacio = document.querySelector('#carrito-vacio');
  const subtotalValor = document.querySelector('#subtotal-valor');
  const conteoProductos = document.querySelector('.conteo-productos');
  const btnPagar = document.querySelector('.btn-pagar');
  const notasPedido = document.getElementById('notas-pedido');

  carritoItems.innerHTML = '';

  // =========================================================
  // 4. FUNCIONES DE UTILERÍA Y CONTEO
  // =========================================================
  function guardarCarritoStorage() {
    localStorage.setItem("carritoCafe", JSON.stringify(items));
  }

  function updateConteo() {
    if (conteoProductos) {
      conteoProductos.textContent = cantidadItems === 1 ? '1 producto' : `${cantidadItems} productos`;
    }

    // Try to get badge again in case it wasn't loaded initially
    const badgeNav = document.getElementById('conteo-productos-nav');
    if (badgeNav) {
      badgeNav.textContent = cantidadItems;
      badgeNav.style.display = cantidadItems > 0 ? 'flex' : 'none';
    }
  }

  function updateSubtotal() {
    if (subtotalValor) {
      subtotalValor.textContent = '$' + totalAcumulado.toLocaleString('es-CO');
    }
  }

  function updateEmptyState() {
    if (carritoVacio) {
      carritoVacio.style.display = items.length === 0 ? 'flex' : 'none';
    }
  }

  // ABRIR / CERRAR
  window.toggleCarrito = function() {
    carritoLateral.classList.toggle('abierto');
    carritoOverlay.classList.toggle('activo');
  };

  // =========================================================
  // 5. AGREGAR AL CARRITO
  // =========================================================
  function agregarAlCarrito(producto) {
    console.log('[CART] agregarAlCarrito llamado para:', producto.nombre);
    console.log('[CART] cantidadItems antes:', cantidadItems);
    console.log('[CART] precio recibido:', producto.precio);
    console.log('[CART] tipo de precio:', typeof producto.precio);
    
    const { id, nombre, precio, image } = producto;
    
    const itemExistente = items.find(item => item.nombre === nombre);

    if (itemExistente) {
      itemExistente.cantidad += 1;
      console.log('[CART] Item existente, nueva cantidad:', itemExistente.cantidad);
    } else {
      items.push({
        id: id,
        nombre: nombre,
        precio: precio,
        image: image,
        cantidad: 1
      });
      console.log('[CART] Nuevo item agregado con precio:', precio);
    }

    cantidadItems += 1;
    totalAcumulado += precio;

    console.log('[CART] cantidadItems después:', cantidadItems);
    console.log('[CART] total items en array:', items.length);
    console.log('[CART] totalAcumulado:', totalAcumulado);

    guardarCarritoStorage();
    renderizarCarrito();
    updateConteo();
    updateSubtotal();
    updateEmptyState();

    Swal.fire({
      icon: 'success',
      iconColor: '#532721',
      title: '¡Producto agregado!',
      text: `${nombre} se ha añadido a tu carretilla cafetera.`,
      confirmButtonColor: '#532721',
      timer: 2000,
      showConfirmButton: false
    });
  }

  // =========================================================
  // 6. RENDERIZAR CARRITO
  // =========================================================
  function renderizarCarrito() {
    carritoItems.innerHTML = '';
    
    if (carritoVacio) {
      carritoItems.appendChild(carritoVacio);
    }

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'carrito-item';
      div.dataset.productId = item.id;
      div.dataset.nombre = item.nombre;
      div.dataset.precio = item.precio;
      div.dataset.cantidad = item.cantidad;

      div.innerHTML = `
        <div class="prod-info">
          <div class="prod-img-placeholder">
            <img src="${item.image}" alt="${item.nombre}" onerror="this.src='/assets/img/iconoPepitaCafe-dark.svg'">
          </div>
          <div class="prod-detalles">
            <p class="prod-nombre">${item.nombre}</p>
            <button class="btn-eliminar" data-nombre="${item.nombre}" title="Eliminar producto">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Eliminar</span>
            </button>
          </div>
        </div>

        <div class="prod-cantidad">
          <div class="control-cantidad">
            <button class="btn-restar-item" data-nombre="${item.nombre}">−</button>
            <span class="item-cantidad">${item.cantidad}</span>
            <button class="btn-sumar-item" data-nombre="${item.nombre}">+</button>
          </div>
        </div>

        <div class="prod-total item-subtotal">
          $${(item.precio * item.cantidad).toLocaleString('es-CO')}
        </div>
      `;

      carritoItems.appendChild(div);
    });

    // Event listeners
    document.querySelectorAll('.btn-sumar-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nombre = e.currentTarget.dataset.nombre;
        updateQty(nombre, 1);
      });
    });

    document.querySelectorAll('.btn-restar-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nombre = e.currentTarget.dataset.nombre;
        updateQty(nombre, -1);
      });
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nombre = e.currentTarget.dataset.nombre;
        eliminarItem(nombre);
      });
    });
  }

  // =========================================================
  // 7. ACTUALIZAR CANTIDAD
  // =========================================================
  function updateQty(nombre, cambio) {
    const item = items.find(i => i.nombre === nombre);
    if (!item) return;

    const nuevaCantidad = item.cantidad + cambio;
    if (nuevaCantidad < 1 || nuevaCantidad > 99) return;

    item.cantidad = nuevaCantidad;
    cantidadItems += cambio;
    totalAcumulado += item.precio * cambio;

    guardarCarritoStorage();
    renderizarCarrito();
    updateConteo();
    updateSubtotal();
  }

  // =========================================================
  // 8. ELIMINAR ITEM
  // =========================================================
  function eliminarItem(nombre) {
    const item = items.find(i => i.nombre === nombre);
    if (!item) return;

    // Cerrar el carrito para que el alert sea visible
    carritoLateral.classList.remove('abierto');
    carritoOverlay.classList.remove('activo');

    Swal.fire({
      title: "¿Eliminar producto?",
      html: `¿Deseas quitar <strong>${nombre}</strong> del carrito?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      zIndex: 10001
    }).then((result) => {
      if (result.isConfirmed) {
        cantidadItems -= item.cantidad;
        totalAcumulado -= item.precio * item.cantidad;

        items = items.filter(i => i.nombre !== nombre);

        guardarCarritoStorage();
        renderizarCarrito();
        updateConteo();
        updateSubtotal();
        updateEmptyState();
      }
    });
  }

  // =========================================================
  // 9. PROCESAR PAGO
  // =========================================================
  async function irAPagar() {
    if (items.length === 0) {
      return Swal.fire({
        icon: 'info',
        iconColor: '#532721',
        title: '¡Tu carretilla está vacía!',
        text: 'Agrega algunos cafés premium antes de procesar tu pedido.',
        confirmButtonColor: '#532721',
        timer: 2400,
        showConfirmButton: false
      });
    }

    try {
      toggleCarrito();

      const token = localStorage.getItem("authToken");
      const usuarioActivo = localStorage.getItem("usuarioActivo");

      console.log('[PAYMENT_FLOW] Iniciando proceso de pago');
      console.log('[PAYMENT_FLOW] Token presente:', !!token);
      console.log('[PAYMENT_FLOW] Usuario activo presente:', !!usuarioActivo);

      if (!token) {
        return Swal.fire({
          icon: 'warning',
          iconColor: '#532721',
          title: 'Sesión requerida',
          text: 'No hay token de autenticación. Por favor, inicia sesión nuevamente.',
          confirmButtonColor: '#532721'
        });
      }

      if (!usuarioActivo) {
        return Swal.fire({
          icon: 'warning',
          iconColor: '#532721',
          title: 'Sesión requerida',
          text: 'No hay información de usuario. Por favor, inicia sesión nuevamente.',
          confirmButtonColor: '#532721'
        });
      }

      const userData = JSON.parse(usuarioActivo);
      const userId = userData.id || userData.idUser;

      console.log('[PAYMENT_FLOW] Datos del usuario:', userData);
      console.log('[PAYMENT_FLOW] Rol del usuario:', userData.role || userData.rol || 'No especificado');

      if (!userId) {
        return Swal.fire({
          icon: 'warning',
          iconColor: '#532721',
          title: 'Datos de usuario incompletos',
          text: 'La información de usuario no contiene un ID válido. Por favor, inicia sesión nuevamente.',
          confirmButtonColor: '#532721'
        });
      }

      // Preparar detalles de la orden
      const details = items.map(item => {
        const productId = Number(item.id || 1);
        console.log('[PAYMENT_FLOW] Item:', item.nombre, 'ID enviado:', productId);
        return {
          productId: productId,
          quantityProducts: Number(item.cantidad)
        };
      });

      console.log('[PAYMENT_FLOW] Detalles de la orden:', details);

      const invalidDetails = details.filter(d => 
        !d.productId || !d.quantityProducts || d.quantityProducts <= 0
      );

      if (invalidDetails.length > 0) {
        throw new Error('Hay productos con información inválida en el carrito');
      }

      Swal.fire({
        title: 'Procesando tu pedido...',
        text: 'Creando orden en el sistema',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:8080"
        : "https://e-commerce-historias-de-cafe-backend-3c6t.onrender.com";

      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const orderPayload = {
        userId: userId,
        stateOrder: "En proceso",
        details: details
      };

      console.log('[PAYMENT_FLOW] Enviando OrderRequestDto:', orderPayload);
      console.log('[PAYMENT_FLOW] Endpoint:', `${API_URL}/orders`);

      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(orderPayload)
      });

      console.log('[PAYMENT_FLOW] Respuesta orden - Status:', orderResponse.status);

      if (orderResponse.status === 401) {
        Swal.close();
        return Swal.fire({
          icon: 'error',
          iconColor: '#dc3545',
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          confirmButtonColor: '#532721'
        });
      }

      if (orderResponse.status === 403) {
        Swal.close();
        return Swal.fire({
          icon: 'error',
          iconColor: '#dc3545',
          title: 'Sin permisos para crear órdenes',
          html: `Tu cuenta (ID: ${userId}) con rol <strong>${userData.role || userData.rol || 'No especificado'}</strong> no tiene permisos para crear órdenes de compra.`,
          confirmButtonColor: '#532721',
          width: '550px'
        });
      }

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        throw new Error(`Error al crear la orden: ${orderResponse.status} - ${errorText}`);
      }

      const orderData = await orderResponse.json();
      console.log('[PAYMENT_FLOW] OrderResponseDto recibido:', orderData);

      const nuevoOrderId = orderData.id;
      
      if (!nuevoOrderId) {
        throw new Error('La respuesta del servidor no contiene un ID de orden válido');
      }

      console.log('[PAYMENT_FLOW] Orden creada exitosamente con ID:', nuevoOrderId);

      Swal.update({
        title: 'Configurando pago...',
        text: 'Conectando con la pasarela de pago segura'
      });

      const paymentPayload = {
        orderId: nuevoOrderId
      };

      console.log('[PAYMENT_FLOW] Enviando PaymentRequestDto:', paymentPayload);
      console.log('[PAYMENT_FLOW] Endpoint:', `${API_URL}/payments`);

      const paymentResponse = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(paymentPayload)
      });

      console.log('[PAYMENT_FLOW] Respuesta pago - Status:', paymentResponse.status);

      if (paymentResponse.status === 401) {
        Swal.close();
        return Swal.fire({
          icon: 'error',
          iconColor: '#dc3545',
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado durante el proceso de pago. Por favor, inicia sesión nuevamente.',
          confirmButtonColor: '#532721'
        });
      }

      if (paymentResponse.status === 403) {
        Swal.close();
        return Swal.fire({
          icon: 'error',
          iconColor: '#dc3545',
          title: 'Sin permisos',
          text: 'No tienes los permisos necesarios para procesar el pago.',
          confirmButtonColor: '#532721'
        });
      }

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        throw new Error(`Error al crear la preferencia de pago: ${paymentResponse.status} - ${errorText}`);
      }

      const paymentData = await paymentResponse.json();
      console.log('[PAYMENT_FLOW] PaymentResponseDto recibido:', paymentData);

      const paymentUrl = paymentData.paymentUrl;
      
      if (!paymentUrl) {
        throw new Error('La respuesta del servidor no contiene una URL de pago válida');
      }

      console.log('[PAYMENT_FLOW] URL de pago obtenida:', paymentUrl);
      console.log('[PAYMENT_FLOW] Redirigiendo a pasarela de pago...');

      Swal.close();
      window.location.href = paymentUrl;

    } catch (error) {
      console.error('[PAYMENT_FLOW] Error no manejado:', error);
      Swal.fire({
        icon: 'error',
        iconColor: '#dc3545',
        title: 'Error al procesar el pedido',
        text: error.message || 'No se pudo procesar tu compra de café. Por favor, inténtalo de nuevo.',
        confirmButtonColor: '#532721'
      });
    }
  }

  // =========================================================
  // 10. BOTONES DEL CATÁLOGO
  // =========================================================
  // Single event delegation for all add-to-cart buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const productId = btn.dataset.productId;
    const card = btn.closest('.card');
    
    if (!card) return;
    
    const nombre = card.querySelector('.product-name')?.textContent.trim();
    const precioTexto = card.querySelector('.product-price')?.textContent.replace('$', '').replace(/\./g, '').replace(/,/g, '').trim();
    const precio = parseFloat(precioTexto);
    const image = card.querySelector('img')?.src || '/assets/img/iconoPepitaCafe-dark.svg';

    agregarAlCarrito({
      id: productId,
      nombre: nombre,
      precio: precio,
      image: image
    });
  });

  // =========================================================
  // 11. INICIALIZACIÓN
  // =========================================================
  if (btnPagar) {
    btnPagar.addEventListener('click', irAPagar);
  }

  // Cargar desde storage
  if (carritoGuardado.length > 0) {
    items = carritoGuardado;
    cantidadItems = items.reduce((acc, i) => acc + i.cantidad, 0);
    totalAcumulado = items.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
    
    renderizarCarrito();
    updateConteo();
    updateSubtotal();
    updateEmptyState();
  } else {
    updateEmptyState();
  }

  // Exponer función global
  window.addToCart = agregarAlCarrito;
}