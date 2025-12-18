# 🚀 Solución Final: Usar Subdominio

En lugar de un subdirectorio, usemos un subdominio. Es más confiable en cPanel.

---

## 📋 PASOS

### PASO 1: Crear Subdominio

1. En cPanel → **"Subdomains"** o **"Subdominios"**
2. Click en **"Create a Subdomain"** o **"Crear Subdominio"**
3. Configura:
   - **Subdomain:** `makiurls` (o el nombre que prefieras)
   - **Domain:** `cortlink.cc`
   - **Document Root:** `public_html/makiurls` (o deja el que sugiere)
4. Click en **"Create"**

### PASO 2: Mover Archivos al Directorio del Subdominio

1. En File Manager, ve a donde están tus archivos (puede ser `public_html/appp/` o `public_html/makiurls/`)
2. Selecciona TODOS los archivos:
   - `app.py`
   - `passenger_wsgi.py`
   - `.htaccess`
   - `index.html`
   - `login.html`
   - `player.html`
   - `script.js`
   - `styles.css`
   - `users.json`
   - `urls_db.json`
3. Click derecho → **"Move"**
4. Mueve a: `public_html/makiurls/` (o el directorio que creó el subdominio)
5. Confirma

### PASO 3: Crear la Aplicación Python

1. En cPanel → **Applications** → **"+ CREATE APPLICATION"**
2. Configura:
   - **Python Version:** 3.11.13
   - **Application Root:** `/home/cort38171608/public_html/makiurls` (el directorio del subdominio)
   - **Application URL:** `makiurls.cortlink.cc` (el subdominio completo)
   - **Application Startup File:** `passenger_wsgi.py`
   - **Application Entry Point:** `application`
3. Click en **"CREATE"**

### PASO 4: Probar

1. Espera 30-60 segundos
2. Accede a: `https://makiurls.cortlink.cc/login.html`
3. Deberías ver la página de login

---

## ✅ Ventajas del Subdominio

- ✅ Más confiable en cPanel
- ✅ No hay conflictos con directorios
- ✅ URL más limpia: `makiurls.cortlink.cc`
- ✅ Fácil de configurar

---

## 🔄 Si el Subdominio No Funciona

**Última opción:** Contacta al soporte de tu hosting y diles:
- "Necesito ayuda para configurar una aplicación Python en cPanel"
- "El directorio no se reconoce aunque existe y tiene los archivos"
- "¿Pueden verificar la configuración de Passenger?"

