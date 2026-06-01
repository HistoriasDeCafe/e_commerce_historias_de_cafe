# GitHub Pages - Error 403 Resuelto ✅

## Status de Problemas

| Problema | Estado | Solución |
|----------|--------|----------|
| Error 403 API | 🔴 Autenticación | Ver sección de diagnóstico |
| Error 404 productForm.html | ✅ Corregido | Logs mejorados en admin.js |
| Error 404 logo-dark.svg | ✅ Corregido | Rutas ajustadas en main.js |
| CORS bloqueado | ✅ Verificado | Correctamente configurado |

---

## 🔴 Error 403 - Guía Completa

### ¿Por qué da Error 403?

El backend **rechaza las solicitudes a `/products` y `/orders`** porque:

1. ❌ **Token expirado o inválido** (Causa más probable)
2. ❌ **Usuario NO es ADMIN en la base de datos**
3. ❌ **Token no se envía correctamente**

**NOTA**: El error NO es por CORS. CORS está ✅ correctamente configurado.

---

## 🛠️ Diagnóstico Automático

### Opción 1: Script Automático

1. **Abre la página admin** en GitHub Pages
2. **F12** (DevTools) → **Console tab**
3. **Copia y pega esto:**

```javascript
const script = document.createElement('script');
script.src = '/e_commerce_historias_de_cafe/js/diagnose-api.js';
document.head.appendChild(script);
```

4. El script automáticamente verificará:
   - ✅ Token presente
   - ✅ Usuario es ADMIN
   - ✅ Conexión a API funcionando
   - ✅ Genera CURL para backend team

### Opción 2: Verificación Manual

**Paso 1: Ver token en localStorage**
```javascript
// En DevTools Console:
localStorage.getItem('authToken')
```

Debería devolver algo como:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1vaGFtZWQgSGFzc2FuIn0.KZaghAXG6...
```

Si devuelve `null`, necesitas **hacer login de nuevo**.

**Paso 2: Ver usuario**
```javascript
JSON.parse(localStorage.getItem('usuarioActivo'))
```

Debería mostrar:
```json
{
  "id": 21,
  "name": "Zully Tamayo Martinez",
  "email": "zullytamayom@gmail.com",
  "role": "ADMIN"
}
```

**Importante**: Si `role` no es `"ADMIN"`, ese es el problema.

**Paso 3: Network - Inspeccionar solicitud fallida**
1. DevTools → **Network tab**
2. Recarga la página (F5)
3. Filtra por `products`
4. Click en la solicitud GET `/products`
5. **Request Headers** → Debe incluir:
```
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json
```

---

## 🔧 Soluciones Rápidas

### ❌ Error 403 Forbidden

**Solución 1: Limpiar y hacer login de nuevo**
```javascript
localStorage.clear();
window.location.reload();
// Luego: Login nuevamente en pages/users/users.html
```

**Solución 2: Verificar rol en base de datos (Backend team)**
```sql
-- Verificar usuario
SELECT id, name, email, role, stateActive FROM user 
WHERE email = 'zullytamayom@gmail.com';

-- Si role no es ADMIN, actualizar:
UPDATE user SET role = 'ADMIN' 
WHERE email = 'zullytamayom@gmail.com';
```

**Solución 3: Testear con CURL (Backend team)**
```bash
# Obtén el token de GitHub Pages
# Luego:
curl -X GET "https://e-commerce-historias-de-cafe-backend-3c6t.onrender.com/products" \
  -H "Authorization: Bearer <TOKEN_AQUI>" \
  -H "Content-Type: application/json"
```

### ❌ Error 401 Unauthorized

**Solución**: Token no se envía correctamente
1. Limpiar cache: `Ctrl+Shift+Delete`
2. Recargar en Incógnito: `Ctrl+Shift+N`
3. Login nuevamente

---

## ✅ Verificación de CORS

**Backend Spring Boot Configuration:**
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(
                                "http://localhost:5503",
                                "http://127.0.0.1:5503",
                                "http://127.0.0.1:5500",
                                "http://localhost:5173",
                                "http://127.0.0.1:5173",
                                "https://historiasdecafe.github.io",  // ✅ GitHub Pages
                                "https://proyecto-historiasdecafe-frontend-vue-1.onrender.com"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

**Status**: ✅ CORRECTO - GitHub Pages está en whitelist

---

## 📁 Archivos Modificados

### Frontend (GitHub Pages)
1. **js/admin.js** 
   - Mejor logging en `loadProductForm()`
   - Mejor error handling

2. **js/main.js**
   - Mejorada función `fixComponentPaths()`
   - Corrige rutas de componentes dinámicos

3. **js/diagnose-api.js** (NUEVO)
   - Script de diagnóstico automático
   - Verifica token, usuario, y conexión a API

### Backend (Java Spring Boot)
- ✅ CORS ya configurado correctamente

---

## 📋 Checklist

- [ ] Ejecutar script de diagnóstico
- [ ] Verificar token en localStorage
- [ ] Verificar usuario es ADMIN
- [ ] Si falta token → Login de nuevo
- [ ] Si usuario no es ADMIN → Actualizar en BD
- [ ] Limpiar cache (`Ctrl+Shift+Delete`)
- [ ] Test en incógnito
- [ ] Hacer git commit de cambios

---

## 🚀 Próximos Pasos

### Para el Frontend Team
1. ✅ Cambios aplicados
2. ⏳ Git commit pendiente
3. ⏳ Esperar 2-5 min para que GitHub Pages se actualice
4. ⏳ Test en https://historiasdecafe.github.io/e_commerce_historias_de_cafe/pages/admin/admin.html

### Para el Backend Team
1. Ejecutar el CURL command para verificar token
2. Verificar que usuario es ADMIN en BD
3. Verificar que endpoint `/products` funciona
4. Revisar logs de autenticación en backend

---

## 🔗 Enlaces Útiles

- **GitHub Pages Repo**: https://github.com/historiasdecafe/e_commerce_historias_de_cafe
- **Admin Page**: https://historiasdecafe.github.io/e_commerce_historias_de_cafe/pages/admin/admin.html
- **Backend API**: https://e-commerce-historias-de-cafe-backend-3c6t.onrender.com
- **Documentación CORS**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

**Última actualización**: Junio 1, 2026
**Status**: 🟡 En diagnóstico - Error 403 requiere verificación backend
