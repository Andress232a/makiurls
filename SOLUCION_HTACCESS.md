# 🔧 Solución: .htaccess para Subdirectorio

El problema es que el `.htaccess` no está redirigiendo correctamente a Passenger.

## ✅ PASO 1: Verificar .htaccess en public_html

1. En File Manager, ve a `public_html/` (raíz)
2. Busca si hay un `.htaccess` ahí
3. Si existe, ábrelo y revisa su contenido
4. Si tiene reglas que redirigen todo, puede estar interceptando las peticiones

## ✅ PASO 2: Actualizar .htaccess en virtualenv/public_html/aqui/

El `.htaccess` en `virtualenv/public_html/aqui/` debe permitir que Passenger maneje las peticiones.

**Opción A: Dejar que cPanel lo genere automáticamente**
1. Elimina el `.htaccess` de `virtualenv/public_html/aqui/`
2. Reinicia la aplicación
3. cPanel debería generar uno automáticamente

**Opción B: Crear uno mínimo**
Si cPanel no genera uno, crea un `.htaccess` con solo esto:

```apache
# Permitir que Passenger maneje las peticiones
# cPanel genera automáticamente las directivas de Passenger
```

## ✅ PASO 3: Verificar que la Aplicación Esté Corriendo

1. En cPanel → Applications → tu aplicación
2. Verifica que el estado sea "Running" o "Started"
3. Si no, haz clic en "RESTART"

## ✅ PASO 4: Probar Acceso Directo a Flask

Prueba acceder a:
- `https://cortlink.cc/aqui/api/check-auth` (debería devolver JSON)
- Si esto funciona, Flask está corriendo pero hay un problema con las rutas HTML

