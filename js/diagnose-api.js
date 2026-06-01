/**
 * Script de Diagnóstico para problemas de API en GitHub Pages
 * Uso: Abre DevTools (F12) → Console tab → Copia y pega este código
 */

async function diagnosticarAPI() {
  console.log('%c=== DIAGNÓSTICO DE API ===', 'color: blue; font-size: 14px; font-weight: bold;');
  
  // 1. Verificar localStorage
  console.log('\n%c1. VERIFICACIÓN DE TOKENS Y USUARIO', 'color: green; font-weight: bold;');
  
  const token = localStorage.getItem('authToken');
  const usuarioActivo = localStorage.getItem('usuarioActivo');
  
  console.log('Token presente:', !!token);
  if (token) {
    console.log('Token (primeros 50 chars):', token.substring(0, 50) + '...');
    console.log('Token completo para testing:', token);
  } else {
    console.log('%c⚠️ TOKEN NO ENCONTRADO - Necesitas hacer LOGIN primero', 'color: red;');
  }
  
  console.log('\nUsuario activo:', usuarioActivo ? JSON.parse(usuarioActivo) : 'NO ENCONTRADO');
  
  if (usuarioActivo) {
    const user = JSON.parse(usuarioActivo);
    if (user.role !== 'ADMIN') {
      console.log('%c⚠️ USUARIO NO ES ADMIN - Rol actual: ' + user.role, 'color: red;');
    } else {
      console.log('%c✅ Usuario es ADMIN', 'color: green;');
    }
  }
  
  // 2. Probar conexión a API
  console.log('\n%c2. TESTEO DE CONEXIÓN A API', 'color: green; font-weight: bold;');
  
  const API_URL = 'https://e-commerce-historias-de-cafe-backend-3c6t.onrender.com';
  
  if (!token) {
    console.log('%c⚠️ No hay token, saltando test de API', 'color: orange;');
    return;
  }
  
  try {
    console.log('Intentando conectar a:', API_URL + '/products');
    
    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': window.location.origin
      }
    });
    
    console.log('Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('%c✅ ÉXITO - API funcionando', 'color: green; font-weight: bold;');
      console.log('Productos recibidos:', data.length);
      console.log('Primer producto:', data[0] || 'N/A');
    } else {
      const errorText = await response.text();
      console.log('%c❌ ERROR - Status ' + response.status, 'color: red; font-weight: bold;');
      console.log('Error detail:', errorText);
      
      if (response.status === 403) {
        console.log('\n%c💡 SOLUCIONES PARA ERROR 403:', 'color: blue; font-weight: bold;');
        console.log('1. Token expirado → Hacer login nuevamente');
        console.log('2. Usuario no es ADMIN en BD → Verificar roles en base de datos');
        console.log('3. Token inválido → Limpiar localStorage y login de nuevo');
      } else if (response.status === 401) {
        console.log('\n%c💡 SOLUCIONES PARA ERROR 401:', 'color: blue; font-weight: bold;');
        console.log('Token no válido o expirado → Hacer login nuevamente');
      }
    }
  } catch (error) {
    console.log('%c❌ ERROR DE RED:', 'color: red; font-weight: bold;');
    console.log(error);
  }
  
  // 3. Información para debugging
  console.log('\n%c3. INFORMACIÓN PARA DEBUGGING', 'color: green; font-weight: bold;');
  console.log('Hostname:', window.location.hostname);
  console.log('Pathname:', window.location.pathname);
  console.log('Origin:', window.location.origin);
  console.log('BASE_URL:', window.BASE_URL);
  
  // 4. Comando CURL para backend team
  console.log('\n%c4. COMANDO CURL PARA BACKEND TEAM', 'color: green; font-weight: bold;');
  console.log('Usa este comando para probar desde terminal:');
  console.log(`\ncurl -X GET "https://e-commerce-historias-de-cafe-backend-3c6t.onrender.com/products" \\`);
  console.log(`  -H "Authorization: Bearer ${token}" \\`);
  console.log(`  -H "Content-Type: application/json"`);
}

// Ejecutar automáticamente
diagnosticarAPI();

console.log('\n%cℹ️ Diagnóstico completado. Comparte los resultados con el equipo.', 'color: blue;');
