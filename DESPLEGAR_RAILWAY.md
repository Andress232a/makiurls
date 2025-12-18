# 🚀 Desplegar MakiUrls en Railway (Gratis)

Railway es una excelente opción gratuita para aplicaciones Flask.

## 📋 Requisitos Previos

1. Cuenta en GitHub (gratis)
2. Cuenta en Railway (gratis en https://railway.app)

---

## 🚀 PASOS PARA DESPLEGAR

### PASO 1: Preparar Archivos

Ya están listos estos archivos:
- ✅ `app.py` - Aplicación Flask
- ✅ `requirements.txt` - Con gunicorn incluido
- ✅ `Procfile` - Para Railway
- ✅ `railway.json` - Configuración de Railway
- ✅ Todos los archivos HTML, CSS, JS

### PASO 2: Crear Repositorio en GitHub

1. Ve a https://github.com
2. Crea un nuevo repositorio (público o privado)
3. Sube todos los archivos de tu proyecto:
   - `app.py`
   - `requirements.txt`
   - `Procfile`
   - `railway.json`
   - `index.html`
   - `login.html`
   - `player.html`
   - `script.js`
   - `styles.css`
   - `users.json`
   - `.gitignore` (opcional, pero recomendado)

**⚠️ IMPORTANTE:** NO subas `urls_db.json` si tiene datos sensibles. Se creará automáticamente.

### PASO 3: Conectar Railway con GitHub

1. Ve a https://railway.app
2. Inicia sesión con GitHub
3. Click en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Selecciona tu repositorio
6. Railway detectará automáticamente que es una aplicación Python

### PASO 4: Configurar Variables de Entorno

1. En Railway, ve a tu proyecto
2. Click en **"Variables"**
3. Agrega:
   - `SECRET_KEY`: Genera una clave secreta (puedes usar: `openssl rand -hex 32`)

### PASO 5: Desplegar

1. Railway comenzará a desplegar automáticamente
2. Espera a que termine (2-5 minutos)
3. Railway te dará una URL como: `https://tu-app.railway.app`

### PASO 6: Configurar Dominio Personalizado (Opcional)

1. En Railway → **"Settings"** → **"Domains"**
2. Agrega tu dominio `cortlink.cc`
3. Configura los DNS según las instrucciones de Railway

---

## ✅ Verificar

1. Accede a: `https://tu-app.railway.app/login.html`
2. Deberías ver la página de login de MakiUrls

---

## 🔧 Solución de Problemas

### Error: "No module named 'gunicorn'"
- Verifica que `requirements.txt` incluya `gunicorn==21.2.0`

### Error: "Application failed to start"
- Revisa los logs en Railway → **"Deployments"** → **"View Logs"**

### La aplicación carga pero no funciona
- Verifica que todos los archivos estén en el repositorio
- Revisa los logs para errores de Python

---

## 💰 Límites del Plan Gratuito

- 500 horas de ejecución por mes
- $5 de crédito gratis por mes
- Suficiente para una aplicación pequeña

---

## 🎯 Ventajas de Railway

- ✅ Fácil de usar
- ✅ Despliegue automático desde GitHub
- ✅ Logs en tiempo real
- ✅ Dominio personalizado gratuito
- ✅ HTTPS automático

