# 🚀 Solución: Mover la Aplicación a la Raíz

El problema es que `cortlink.cc` está apuntando a `public_html` directamente, no a `public_html/makiurls`.

**Solución:** Mover todos los archivos a la raíz del dominio.

---

## 📋 PASOS PARA MOVER A LA RAÍZ

### PASO 1: Verificar Archivos en File Manager

1. En cPanel → **File Manager**
2. Ve a `public_html/makiurls/`
3. Verifica que todos estos archivos estén ahí:
   - `app.py`
   - `passenger_wsgi.py`
   - `.htaccess`
   - `index.html`
   - `login.html`
   - `player.html`
   - `script.js`
   - `styles.css`
   - `users.json`
   - `urls_db.json` (si existe)

### PASO 2: Mover Archivos a la Raíz

1. En File Manager, selecciona TODOS los archivos de `public_html/makiurls/`
2. Click derecho → **"Move"** o **"Mover"**
3. Mueve a: `public_html/` (la raíz)
4. Confirma

**O manualmente:**
- Selecciona cada archivo
- Click derecho → **"Move"**
- Escribe: `../` (un nivel arriba)
- Confirma

### PASO 3: Eliminar la Carpeta Vacía (Opcional)

1. Después de mover los archivos, elimina `public_html/makiurls/` si está vacía

### PASO 4: Destruir la Aplicación Actual

1. En cPanel → **Applications** → tu aplicación (`cortlink.cc/makiurls`)
2. Click en el ícono de **papelera** (Delete)
3. Confirma la eliminación

### PASO 5: Recrear la Aplicación en la Raíz

1. En cPanel → **Applications** → **"+ CREATE APPLICATION"**
2. Configura:
   - **Python Version:** 3.11 (o la más reciente)
   - **Application Root:** `/home/cort38171608/public_html` (sin `/makiurls`)
   - **Application URL:** `cortlink.cc` (sin `/makiurls`)
   - **Application Startup File:** `passenger_wsgi.py`
   - **Application Entry Point:** `application`
3. Click en **"CREATE"**

### PASO 6: Verificar

1. Espera 30-60 segundos
2. Prueba acceder a: `https://cortlink.cc/login.html`
3. Deberías ver la página de login de MakiUrls

---

## ✅ Checklist Final

- [ ] Todos los archivos están en `public_html/` (raíz)
- [ ] La aplicación Python está creada con:
  - Application Root: `/home/cort38171608/public_html`
  - Application URL: `cortlink.cc`
- [ ] La aplicación muestra "started" sin errores rojos
- [ ] `https://cortlink.cc/login.html` carga correctamente

---

## 🎯 URLs Finales

Después de mover a la raíz, las URLs serán:
- Login: `https://cortlink.cc/login.html`
- Principal: `https://cortlink.cc/`
- Player: `https://cortlink.cc/player.html?short=XXXXX`

