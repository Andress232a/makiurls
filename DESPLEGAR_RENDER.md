# 🚀 Desplegar MakiUrls en Render (Gratis)

Render es otra excelente opción gratuita para aplicaciones Flask.

## 📋 Requisitos Previos

1. Cuenta en GitHub (gratis)
2. Cuenta en Render (gratis en https://render.com)

---

## 🚀 PASOS PARA DESPLEGAR

### PASO 1: Preparar Archivos

Ya están listos estos archivos:
- ✅ `app.py` - Aplicación Flask
- ✅ `requirements.txt` - Con gunicorn incluido
- ✅ `Procfile` - Para Render
- ✅ Todos los archivos HTML, CSS, JS

### PASO 2: Crear Repositorio en GitHub

1. Ve a https://github.com
2. Crea un nuevo repositorio (público o privado)
3. Sube todos los archivos de tu proyecto

### PASO 3: Conectar Render con GitHub

1. Ve a https://render.com
2. Inicia sesión con GitHub
3. Click en **"New +"** → **"Web Service"**
4. Conecta tu repositorio de GitHub
5. Configura:
   - **Name:** `makiurls` (o el nombre que prefieras)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Plan:** `Free`

### PASO 4: Configurar Variables de Entorno

1. En Render, ve a tu servicio
2. Click en **"Environment"**
3. Agrega:
   - `SECRET_KEY`: Genera una clave secreta

### PASO 5: Desplegar

1. Click en **"Create Web Service"**
2. Render comenzará a desplegar automáticamente
3. Espera a que termine (3-5 minutos)
4. Render te dará una URL como: `https://tu-app.onrender.com`

### PASO 6: Configurar Dominio Personalizado (Opcional)

1. En Render → **"Settings"** → **"Custom Domain"**
2. Agrega tu dominio `cortlink.cc`
3. Configura los DNS según las instrucciones de Render

---

## ✅ Verificar

1. Accede a: `https://tu-app.onrender.com/login.html`
2. Deberías ver la página de login de MakiUrls

---

## 💰 Límites del Plan Gratuito

- La aplicación se "duerme" después de 15 minutos de inactividad
- Tarda ~30 segundos en "despertar" cuando alguien la visita
- Suficiente para desarrollo y pruebas

---

## 🎯 Ventajas de Render

- ✅ Fácil de usar
- ✅ Despliegue automático desde GitHub
- ✅ Logs en tiempo real
- ✅ Dominio personalizado gratuito
- ✅ HTTPS automático

