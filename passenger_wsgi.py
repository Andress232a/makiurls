import sys
import os

# Agregar el directorio actual al path
application_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, application_root)

# Cambiar al directorio de la aplicación
os.chdir(application_root)

# Importar la aplicación Flask
try:
    from app import app as application
    # Verificar que la aplicación se cargó correctamente
    if application is None:
        raise Exception("La aplicación Flask no se pudo cargar")
except ImportError as e:
    # Error de importación - mostrar detalles
    from flask import Flask
    error_app = Flask(__name__)
    @error_app.route('/')
    def import_error():
        return f'''
        <h1>Error de Importación</h1>
        <p><strong>Error:</strong> {str(e)}</p>
        <p><strong>Directorio:</strong> {application_root}</p>
        <p><strong>Python Path:</strong> {sys.path}</p>
        <p>Verifica que Flask esté instalado: pip install Flask flask-cors</p>
        ''', 500
    application = error_app
except Exception as e:
    # Otro error - mostrar detalles
    from flask import Flask
    error_app = Flask(__name__)
    @error_app.route('/')
    def error():
        import traceback
        error_details = traceback.format_exc()
        return f'''
        <h1>Error al Cargar la Aplicación</h1>
        <p><strong>Error:</strong> {str(e)}</p>
        <pre>{error_details}</pre>
        <p><strong>Directorio:</strong> {application_root}</p>
        ''', 500
    application = error_app

# Configuración para producción
if __name__ == "__main__":
    application.run()

