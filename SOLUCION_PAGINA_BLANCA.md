# Solución: Página en Blanco en cortlink.cc/makiurls

## Diagnóstico Rápido

### 1. Verificar que la aplicación Python esté activa
- En cPanel → Applications → CORTLINK.CC/
- Verifica que el estado sea "Running" o "Activa"
- Si está "Stopped", haz clic en "Start" o "Iniciar"

### 2. Probar acceso directo a archivos
Prueba acceder directamente a estos archivos:
- `https://cortlink.cc/makiurls/login.html`
- `https://cortlink.cc/makiurls/index.html`
- `https://cortlink.cc/makiurls/styles.css`

Si estos archivos SÍ cargan, el problema es con las rutas de Flask.
Si NO cargan, el problema es con la configuración de Passenger.

### 3. Verificar Application URL en cPanel
En Applications → CORTLINK.CC/:
- **Application URL** debe ser: `/makiurls` (con la barra inicial)
- O puede estar vacío si quieres que sea la raíz

### 4. Revisar logs de Passenger
En cPanel, busca:
- "Application Logs" o "Python Logs"
- O en la configuración de la aplicación, busca "View Logs"

### 5. Crear archivo de prueba simple
Crea un archivo `test_simple.py` en `public_html/makiurls`:

```python
def application(environ, start_response):
    status = '200 OK'
    headers = [('Content-type', 'text/html; charset=utf-8')]
    start_response(status, headers)
    return [b'<h1>¡Funciona! Passenger está activo.</h1>']
```

Luego cambia temporalmente en la configuración:
- Application startup file: `test_simple.py`
- Application Entry point: `application`

Si esto funciona, el problema está en `passenger_wsgi.py` o `app.py`.

### 6. Verificar permisos
Asegúrate de que estos archivos tengan permisos correctos:
- `passenger_wsgi.py` → 755
- `app.py` → 644
- Todos los demás archivos → 644

### 7. Verificar que Flask esté instalado
En la aplicación Python, ejecuta:
```python
import flask
print(flask.__version__)
```

Si da error, Flask no está instalado correctamente.


