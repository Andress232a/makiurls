# 🔍 Verificación del Dominio cortlink.cc

## Problema: La aplicación no carga aunque esté "started"

Si el dominio no está configurado correctamente, la aplicación no funcionará aunque esté corriendo.

---

## ✅ PASO 1: Verificar Configuración del Dominio en cPanel

1. En cPanel, busca **"Domains"** o **"Dominios"**
2. Verifica que `cortlink.cc` esté listado
3. Verifica que el **Document Root** (Directorio de Documentos) sea:
   - `public_html` (si quieres la app en la raíz)
   - O que puedas configurar un subdirectorio

---

## ✅ PASO 2: Verificar DNS

1. Ve a **"Zone Editor"** o **"Editor de Zona"** en cPanel
2. Verifica que existan registros A para `cortlink.cc`:
   - Tipo: `A`
   - Nombre: `cortlink.cc` o `@`
   - Debe apuntar a la IP del servidor

---

## ✅ PASO 3: Probar Acceso Directo a Archivos

Prueba acceder directamente a estos archivos en el navegador:

- `https://cortlink.cc/makiurls/login.html`
- `https://cortlink.cc/makiurls/diagnostico.html`
- `https://cortlink.cc/makiurls/styles.css`

**Si estos archivos SÍ cargan:**
- El dominio está bien configurado
- El problema es con Passenger/Flask

**Si estos archivos NO cargan:**
- El dominio no está apuntando correctamente
- O hay un problema con la configuración del directorio

---

## 🔄 ALTERNATIVA 1: Mover la Aplicación a la Raíz

Si el subdirectorio está causando problemas, puedes mover la app a la raíz:

1. **Mover archivos:**
   - De: `public_html/makiurls/`
   - A: `public_html/`

2. **Recrear la aplicación en cPanel:**
   - Application Root: `/home/cort38171608/public_html`
   - Application URL: `cortlink.cc` (sin subdirectorio)
   - Application Startup File: `passenger_wsgi.py`
   - Application Entry Point: `application`

3. **Actualizar rutas en Flask** (si es necesario)

---

## 🔄 ALTERNATIVA 2: Usar un Subdominio

En lugar de un subdirectorio, usa un subdominio:

1. En cPanel → **"Subdomains"** o **"Subdominios"**
2. Crea: `makiurls.cortlink.cc`
3. Apunta a: `public_html/makiurls`
4. Recrea la aplicación:
   - Application URL: `makiurls.cortlink.cc`
   - Application Root: `/home/cort38171608/public_html/makiurls`

---

## 🔄 ALTERNATIVA 3: Verificar que el Dominio Esté Activo

1. En cPanel → **"Domains"**
2. Verifica que `cortlink.cc` esté **"Active"** o **"Activo"**
3. Si está inactivo, actívalo

---

## 📋 Checklist Rápido

- [ ] El dominio `cortlink.cc` está listado en "Domains"
- [ ] El Document Root apunta a `public_html`
- [ ] Los archivos estáticos (`login.html`, `styles.css`) se pueden acceder directamente
- [ ] La aplicación Python muestra "started" sin errores rojos
- [ ] El DNS está configurado correctamente

---

## 🚨 Si Nada Funciona

1. **Contacta al soporte de hosting** y pregunta:
   - ¿El dominio `cortlink.cc` está correctamente configurado?
   - ¿Hay algún problema con Passenger o Python Apps?
   - ¿Necesitan configurar algo especial para subdirectorios?

2. **Prueba con un subdominio** (más fácil de configurar):
   - `makiurls.cortlink.cc`

3. **Mueve la app a la raíz** (más simple):
   - `https://cortlink.cc/` directamente

