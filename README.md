# 🎬 MakiUrls - Acortador de URLs con Reproductor de Video

Una aplicación web moderna que permite acortar URLs de videos y reproducirlos con soporte para múltiples formatos (MP4, Google Drive, HLS).

## ✨ Características

- 🎬 Reproductor de video con soporte para MP4, Google Drive y HLS
- 🔗 Acortador de URLs personalizado
- 📊 Estadísticas de clicks por URL
- 🔐 Sistema de autenticación
- 📅 Filtros de estadísticas (Hoy, Esta Semana, Este Mes)
- 🗑️ Eliminación individual y masiva de URLs
- 🎨 Interfaz moderna y responsive

## 🚀 Despliegue Rápido

### Opción 1: Railway (Recomendado)

1. Haz fork de este repositorio o crea uno nuevo
2. Ve a [Railway](https://railway.app) e inicia sesión con GitHub
3. Crea un nuevo proyecto desde tu repositorio
4. Railway detectará automáticamente que es Python y desplegará
5. Agrega la variable de entorno `SECRET_KEY` (genera una clave secreta)
6. ¡Listo! Tu app estará disponible en `https://tu-app.railway.app`

### Opción 2: Render

1. Haz fork de este repositorio o crea uno nuevo
2. Ve a [Render](https://render.com) e inicia sesión con GitHub
3. Crea un nuevo "Web Service" desde tu repositorio
4. Configura:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Agrega la variable de entorno `SECRET_KEY`
6. ¡Listo! Tu app estará disponible en `https://tu-app.onrender.com`

## 📋 Instalación Local

1. Clona el repositorio:
```bash
git clone https://github.com/Andress232a/makiurls.git
cd makiurls
```

2. Instala las dependencias:
```bash
pip install -r requirements.txt
```

3. Configura las variables de entorno (opcional):
```bash
export SECRET_KEY="tu-clave-secreta-aqui"
```

4. Inicia el servidor:
```bash
python app.py
```

5. Abre tu navegador en `http://localhost:5000`

## 📁 Estructura del Proyecto

```
makiurls/
├── app.py                 # Servidor backend Flask
├── requirements.txt       # Dependencias de Python
├── Procfile              # Configuración para Railway/Render
├── railway.json          # Configuración específica de Railway
├── index.html            # Página principal
├── login.html            # Página de login
├── player.html           # Reproductor de video
├── script.js             # Lógica del frontend
├── styles.css            # Estilos CSS
├── users.json            # Base de datos de usuarios
├── urls_db.json.example  # Ejemplo de base de datos de URLs
└── README.md             # Este archivo
```

## 🔐 Credenciales por Defecto

- **Email:** `makiurls@urls.com`
- **Password:** `makiberpajero123`

⚠️ **IMPORTANTE:** Cambia estas credenciales en producción editando `users.json`.

## 🛠️ Tecnologías Utilizadas

- **Backend:** Python, Flask, Flask-CORS
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Video:** HTML5 Video API, HLS.js
- **Almacenamiento:** JSON (archivos locales)

## 📝 Notas

- El archivo `urls_db.json` se crea automáticamente al usar la aplicación
- Las sesiones se manejan con Flask sessions
- Los videos de Google Drive se convierten automáticamente a formato embebible
- Soporte para múltiples pistas de audio en videos HLS

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request.

---

Hecho con ❤️ por Andress232a
