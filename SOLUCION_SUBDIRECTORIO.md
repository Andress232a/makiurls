# 🔧 Solución: cPanel no permite public_html directamente

cPanel bloquea crear aplicaciones Python en `public_html` por seguridad.

**Solución:** Crear un subdirectorio y mover los archivos ahí.

---

## 📋 PASOS

### PASO 1: Crear Subdirectorio

1. En cPanel → **File Manager** → `public_html/`
2. Click en **"Folder"** o **"Carpeta"** (botón en la barra superior)
3. Nombre: `app` (o `makiurls`)
4. Crear

### PASO 2: Mover Archivos al Subdirectorio

1. En `public_html/`, selecciona TODOS estos archivos:
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
   - `requirements.txt`
   - (y cualquier otro archivo de la app)

2. Click derecho → **"Move"** o **"Mover"**
3. Mueve a: `public_html/app/` (o el nombre que elegiste)
4. Confirma

### PASO 3: Crear la Aplicación en cPanel

1. En cPanel → **Applications** → **"+ CREATE APPLICATION"**
2. Configura:
   - **Python Version:** 3.11.13
   - **Application Root:** `/home/cort38171608/public_html/app` (con `/app` al final)
   - **Application URL:** `cortlink.cc` + `/app` (o crea un subdominio)
   - **Application Startup File:** `passenger_wsgi.py`
   - **Application Entry Point:** `application`
3. Click en **"CREATE"**

### PASO 4: Configurar Redirección (Opcional)

Si quieres que `cortlink.cc` redirija a `cortlink.cc/app`:

1. En `public_html/`, crea o edita `.htaccess`
2. Agrega:
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_URI} !^/app/
   RewriteRule ^(.*)$ /app/$1 [L]
   ```

---

## 🎯 URLs Finales

- Login: `https://cortlink.cc/app/login.html`
- Principal: `https://cortlink.cc/app/`
- Player: `https://cortlink.cc/app/player.html?short=XXXXX`

---

## 🔄 ALTERNATIVA: Usar Subdominio

Si prefieres `https://app.cortlink.cc`:

1. En cPanel → **Subdomains**
2. Crea: `app.cortlink.cc`
3. Apunta a: `public_html/app`
4. Crea la aplicación con:
   - Application URL: `app.cortlink.cc`
   - Application Root: `/home/cort38171608/public_html/app`

