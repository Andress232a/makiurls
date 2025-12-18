# Guía de Despliegue a Producción - MakiUrls

## Paso a Paso para Subir a cortlink.cc

### 📋 Requisitos Previos
- Acceso a cPanel
- Dominio: cortlink.cc
- Python habilitado en el servidor

---

## 🚀 PASOS PARA DESPLEGAR

### **PASO 1: Preparar los Archivos Localmente**

Ya están preparados los siguientes archivos:
- ✅ `app.py` - Aplicación Flask
- ✅ `passenger_wsgi.py` - Configuración para Passenger (cPanel)
- ✅ `.htaccess` - Reglas de redirección
- ✅ `requirements.txt` - Dependencias Python
- ✅ Archivos HTML, CSS, JS actualizados para producción

---

### **PASO 2: Acceder al File Manager en cPanel**

1. En cPanel, busca y haz clic en **"File Manager"**
2. Navega a la carpeta `public_html` (o la carpeta de tu dominio)
3. Si vas a usar un subdominio, crea una carpeta (ej: `public_html/maki`)

---

### **PASO 3: Subir los Archivos**

1. En File Manager, ve a la carpeta donde quieres instalar la app
2. Haz clic en **"Upload"** (botón azul en la barra superior)
3. Sube TODOS estos archivos:
   - `app.py`
   - `passenger_wsgi.py`
   - `.htaccess`
   - `requirements.txt`
   - `index.html`
   - `player.html`
   - `script.js`
   - `styles.css`
   - `urls_db.json` (se creará automáticamente si no existe)

**⚠️ IMPORTANTE:** Asegúrate de que `.htaccess` se suba correctamente (puede estar oculto)

---

### **PASO 4: Configurar Python en cPanel**

1. En cPanel, busca **"Setup Python App"** o **"Python Selector"**
2. Haz clic en **"Create Application"** o **"Add Application"**
3. Configura:
   - **Python Version:** Selecciona la más reciente (3.9, 3.10 o 3.11)
   - **Application Root:** `/home/cort38171608/public_html` (o la ruta donde subiste los archivos)
   - **Application URL:** `/` (raíz) o `/maki` (si usas subcarpeta)
   - **Application Startup File:** `passenger_wsgi.py`
   - **Application Entry Point:** `application`
4. Haz clic en **"Create"**

---

### **PASO 5: Instalar Dependencias Python**

1. En la sección de Python App, busca **"Install Python Packages"** o similar
2. O usa **"Terminal"** en cPanel:
   ```bash
   cd ~/public_html
   pip3 install --user Flask==3.0.0 flask-cors==4.0.0
   ```
3. O edita `requirements.txt` y haz clic en **"Install"** si hay esa opción

---

### **PASO 6: Configurar Permisos de Archivos**

En File Manager, asegúrate de que estos archivos tengan permisos correctos:

1. Selecciona `passenger_wsgi.py`
2. Click derecho → **"Change Permissions"**
3. Marca: **755** (o **644** para archivos, **755** para scripts)
4. Repite para `app.py`

---

### **PASO 7: Crear Base de Datos (Opcional)**

El archivo `urls_db.json` se creará automáticamente, pero puedes crearlo manualmente:

1. En File Manager, crea un archivo nuevo llamado `urls_db.json`
2. Pega este contenido:
   ```json
   {}
   ```
3. Cambia permisos a **644** (lectura/escritura)

---

### **PASO 8: Configurar el Dominio**

1. En cPanel, ve a **"Domains"** o **"Subdomains"**
2. Si usas el dominio principal (`cortlink.cc`):
   - Asegúrate de que apunte a `public_html`
3. Si usas un subdominio (ej: `maki.cortlink.cc`):
   - Crea el subdominio apuntando a `public_html/maki`

---

### **PASO 9: Verificar y Probar**

1. Abre tu navegador y ve a: `https://cortlink.cc` (o tu subdominio)
2. Deberías ver la página de MakiUrls
3. Prueba:
   - Acortar una URL
   - Ver estadísticas
   - Acceder a una URL acortada

---

### **PASO 10: Configurar SSL (HTTPS)**

1. En cPanel, busca **"SSL/TLS Status"**
2. Activa SSL para `cortlink.cc`
3. Esto es importante para que las URLs acortadas funcionen con HTTPS

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "Application failed to start"
- Verifica que `passenger_wsgi.py` existe y tiene permisos 755
- Revisa los logs en cPanel → **"Errors"**

### Error: "Module not found"
- Instala las dependencias: `pip3 install --user Flask flask-cors`
- Verifica que Python está configurado correctamente

### Error 500 Internal Server Error
- Revisa los logs de error en cPanel
- Verifica permisos de `urls_db.json` (debe ser 644 o 666)

### Las URLs no funcionan
- Verifica que `.htaccess` está en la raíz
- Asegúrate de que Passenger está activado para Python

---

## 📝 NOTAS IMPORTANTES

1. **Backup:** Haz backup de `urls_db.json` regularmente
2. **Logs:** Revisa los logs en cPanel → **"Errors"** si hay problemas
3. **Actualizaciones:** Para actualizar, solo sube los archivos modificados
4. **Seguridad:** Considera agregar autenticación si es necesario

---

## ✅ CHECKLIST FINAL

- [ ] Archivos subidos a `public_html`
- [ ] Python App creada en cPanel
- [ ] Dependencias instaladas
- [ ] Permisos configurados (755 para scripts, 644 para archivos)
- [ ] Dominio configurado
- [ ] SSL activado
- [ ] Aplicación funciona en el navegador
- [ ] URLs acortadas funcionan

---

¡Listo! Tu aplicación debería estar funcionando en producción. 🎉


