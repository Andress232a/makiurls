# 🔍 Verificar Directorio app

El error "No such application (or application not configured) "public_html/app"" significa que cPanel no encuentra la aplicación en ese directorio.

---

## ✅ PASO 1: Verificar que el Directorio Existe

1. En cPanel → **File Manager**
2. Ve a `public_html/`
3. **Verifica que exista la carpeta `app/`**
4. Si NO existe, créala:
   - Click en **"Folder"** o **"Carpeta"**
   - Nombre: `app`
   - Crear

---

## ✅ PASO 2: Verificar que los Archivos Estén en `app/`

1. En File Manager, entra a `public_html/app/`
2. **Verifica que estos archivos estén ahí:**
   - ✅ `app.py`
   - ✅ `passenger_wsgi.py`
   - ✅ `.htaccess`
   - ✅ `index.html`
   - ✅ `login.html`
   - ✅ `player.html`
   - ✅ `script.js`
   - ✅ `styles.css`
   - ✅ `users.json`
   - ✅ `urls_db.json`

**Si los archivos NO están en `app/`:**
- Están todavía en `makiurls/` o en `public_html/` directamente
- Muévelos a `app/`

---

## ✅ PASO 3: Verificar Permisos

1. Selecciona `passenger_wsgi.py` en `app/`
2. Click derecho → **"Change Permissions"** o **"Permisos"**
3. Debe ser: **755** (rwxr-xr-x)
4. Aplica

---

## ✅ PASO 4: Crear la Aplicación

1. En cPanel → **Applications** → **"+ CREATE APPLICATION"**
2. Configura:
   - **Python Version:** 3.11.13
   - **Application Root:** `/home/cort38171608/public_html/app` (ruta completa)
   - **Application URL:** `cortlink.cc` + `/app`
   - **Application Startup File:** `passenger_wsgi.py`
   - **Application Entry Point:** `application`
3. Click en **"CREATE"**

---

## 🚨 Si Sigue el Error

Prueba con un nombre de directorio diferente:
- `maki` en lugar de `app`
- O `urls` en lugar de `app`

