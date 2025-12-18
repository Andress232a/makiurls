from flask import Flask, request, jsonify, redirect, send_from_directory, session
from flask_cors import CORS
import string
import random
import json
import os
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = os.environ.get('SECRET_KEY', 'makiurls_secret_key_2024_change_in_production')  # En producción, usa una clave segura
CORS(app)  # Permitir peticiones desde el frontend

# Archivo para almacenar usuarios
USERS_FILE = 'users.json'

# Archivo para almacenar las URLs (base de datos simple)
DB_FILE = 'urls_db.json'

# Cargar usuarios
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

# Cargar base de datos
def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

# Guardar base de datos
def save_db(db):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

# Decorador para requerir login
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or not session['logged_in']:
            if request.path.startswith('/api/'):
                return jsonify({'error': 'No autorizado. Por favor inicia sesión.'}), 401
            return redirect('/login.html')
        return f(*args, **kwargs)
    return decorated_function

# Generar código corto aleatorio
def generate_short_code(length=6):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

# Ruta de login
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        if not email or not password:
            return jsonify({'error': 'Email y contraseña requeridos'}), 400
        
        users = load_users()
        
        if email in users and users[email]['password'] == password:
            session['logged_in'] = True
            session['email'] = email
            return jsonify({
                'success': True,
                'message': 'Login exitoso'
            }), 200
        else:
            return jsonify({'error': 'Email o contraseña incorrectos'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Error del servidor: {str(e)}'}), 500

# Ruta de logout
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Sesión cerrada correctamente'
    }), 200

# Ruta para verificar si está logueado
@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if 'logged_in' in session and session['logged_in']:
        return jsonify({
            'authenticated': True,
            'email': session.get('email', '')
        }), 200
    return jsonify({'authenticated': False}), 200

# Ruta para acortar URLs
@app.route('/shorten', methods=['POST'])
@login_required
def shorten_url():
    try:
        data = request.get_json()
        original_url = data.get('url', '').strip()
        
        if not original_url:
            return jsonify({'error': 'URL no proporcionada'}), 400
        
        # Validar que sea una URL válida
        if not (original_url.startswith('http://') or original_url.startswith('https://')):
            return jsonify({'error': 'URL inválida. Debe comenzar con http:// o https://'}), 400
        
        # Cargar base de datos
        db = load_db()
        
        # Generar código corto único
        short_code = generate_short_code()
        while short_code in db:
            short_code = generate_short_code()
        
        # Guardar en la base de datos
        db[short_code] = {
            'original_url': original_url,
            'created_at': datetime.now().isoformat(),
            'clicks': 0
        }
        save_db(db)
        # Debug: verificar que se guardó
        print(f"[DEBUG] URL guardada: {short_code} -> {original_url}")
        # Verificar que se guardó correctamente
        db_verify = load_db()
        if short_code in db_verify:
            print(f"[DEBUG] ✅ Verificación: {short_code} existe en BD")
        else:
            print(f"[DEBUG] ❌ ERROR: {short_code} NO existe en BD después de guardar!")
        
        return jsonify({
            'short_code': short_code,
            'short_url': f'{request.host_url}{short_code}',
            'original_url': original_url
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error del servidor: {str(e)}'}), 500

# Ruta de login (página)
@app.route('/login.html', methods=['GET'])
def login_page():
    return send_from_directory('.', 'login.html')

# Ruta raíz - servir el archivo HTML
@app.route('/', methods=['GET'])
def index():
    # Si no está logueado, redirigir a login
    if 'logged_in' not in session or not session['logged_in']:
        return redirect('/login.html', code=302)
    # Servir el HTML (el JS manejará la carga del video si hay parámetro 'short')
    return send_from_directory('.', 'index.html')

# Ruta para servir archivos estáticos (CSS, JS)
@app.route('/<path:filename>')
def serve_static(filename):
    # Debug: siempre imprimir cuando se llama esta función
    print(f"[DEBUG] serve_static llamado con filename: '{filename}'")
    # Permitir acceso a login.html sin autenticación
    if filename == 'login.html':
        return send_from_directory('.', filename)
    
    # Permitir acceso a player.html sin autenticación (para URLs acortadas públicas)
    if filename == 'player.html':
        return send_from_directory('.', filename)
    
    # Si es un archivo estático conocido, servirlo
    if filename.endswith(('.css', '.js')):
        return send_from_directory('.', filename)
    
    # Si es index.html, requerir login
    if filename == 'index.html':
        if 'logged_in' not in session or not session['logged_in']:
            return redirect('/login.html')
        return send_from_directory('.', filename)
    
    # Si no es un archivo estático, tratar como código corto
    # Verificar primero si existe en la base de datos
    db = load_db()
    # Debug: imprimir en logs
    print(f"[DEBUG] Buscando código corto: {filename}")
    print(f"[DEBUG] Base de datos tiene {len(db)} entradas")
    print(f"[DEBUG] Códigos disponibles: {list(db.keys())[:10]}")  # Primeros 10
    if filename in db:
        original_url = db[filename]['original_url']
        
        # Inicializar clicks si no existe (retrocompatibilidad)
        if 'clicks' not in db[filename]:
            db[filename]['clicks'] = 0
        # Si created_at es una IP (URLs antiguas), convertirla a fecha ISO
        import re
        if 'created_at' not in db[filename] or not isinstance(db[filename]['created_at'], str) or re.match(r'^\d+\.\d+\.\d+\.\d+$', str(db[filename]['created_at'])):
            # Solo actualizar si es una IP o no existe, no si ya tiene una fecha válida
            db[filename]['created_at'] = datetime.now().isoformat()
            save_db(db)
        
        # Incrementar contador de clicks
        db[filename]['clicks'] += 1
        save_db(db)
        
        # Si es una petición AJAX o tiene header Accept: application/json, devolver JSON
        accept_header = request.headers.get('Accept', '')
        if 'application/json' in accept_header or request.is_json:
            return jsonify({
                'original_url': original_url,
                'short_code': filename
            }), 200
        
        # Si no, mostrar la página minimalista solo con el reproductor
        return redirect(f'/player.html?short={filename}', code=302)
    else:
        # Si no se encuentra, devolver error
        if 'application/json' in request.headers.get('Accept', ''):
            return jsonify({'error': 'URL acortada no encontrada'}), 404
        # Devolver página HTML de error 404
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>URL no encontrada - MakiUrls</title>
            <meta charset="utf-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    text-align: center;
                    background: rgba(0,0,0,0.3);
                    padding: 40px;
                    border-radius: 10px;
                }
                h1 { font-size: 48px; margin: 0; }
                p { font-size: 18px; margin: 20px 0; }
                a {
                    color: #fff;
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404</h1>
                <p>URL acortada no encontrada</p>
                <p>El enlace que buscas no existe o ha sido eliminado.</p>
                <p><a href="/">Volver al inicio</a></p>
            </div>
        </body>
        </html>
        ''', 404

# Ruta para obtener estadísticas de todas las URLs
@app.route('/api/stats', methods=['GET'])
@login_required
def get_stats():
    try:
        import re
        db = load_db()
        stats = []
        
        # Convertir a lista para mantener el orden y poder asignar índices
        items_list = list(db.items())
        
        for index, (short_code, data) in enumerate(items_list):
            created_at = data.get('created_at', 'N/A')
            
            # Si created_at es una IP (URLs antiguas), asignar fecha actual (hoy)
            if isinstance(created_at, str) and re.match(r'^\d+\.\d+\.\d+\.\d+$', created_at):
                # Asignar fecha de hoy para que aparezcan en los filtros
                created_at = datetime.now().isoformat()
                
                # Actualizar en la base de datos para futuras consultas
                db[short_code]['created_at'] = created_at
                save_db(db)
            
            stats.append({
                'short_code': short_code,
                'short_url': f'{request.host_url}{short_code}',
                'original_url': data.get('original_url', ''),
                'clicks': data.get('clicks', 0),
                'created_at': created_at
            })
        
        # Ordenar por clicks descendente
        stats.sort(key=lambda x: x['clicks'], reverse=True)
        
        return jsonify({
            'total_urls': len(stats),
            'total_clicks': sum(s['clicks'] for s in stats),
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error del servidor: {str(e)}'}), 500

# Ruta para eliminar una URL individual
@app.route('/api/delete/<short_code>', methods=['DELETE'])
@login_required
def delete_url(short_code):
    try:
        db = load_db()
        
        if short_code not in db:
            return jsonify({'error': 'URL no encontrada'}), 404
        
        # Eliminar la URL
        del db[short_code]
        save_db(db)
        
        return jsonify({
            'success': True,
            'message': 'URL eliminada correctamente'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error del servidor: {str(e)}'}), 500

# Ruta para eliminar todas las URLs
@app.route('/api/clear-all', methods=['DELETE'])
@login_required
def clear_all_urls():
    try:
        # Crear base de datos vacía
        db = {}
        save_db(db)
        
        return jsonify({
            'success': True,
            'message': 'Todas las URLs han sido eliminadas correctamente'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error del servidor: {str(e)}'}), 500

# Manejador de errores 404 - capturar todas las rutas no encontradas
@app.errorhandler(404)
def not_found(error):
    # Obtener la ruta solicitada
    path = request.path.lstrip('/')
    print(f"[DEBUG] Error 404 capturado para ruta: '{path}'")
    
    # Si es un código corto (no es un archivo estático conocido), verificar en BD
    if not path.endswith(('.css', '.js', '.html', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg')):
        db = load_db()
        print(f"[DEBUG] Verificando si '{path}' existe en BD (tiene {len(db)} entradas)")
        if path in db:
            print(f"[DEBUG] ✅ Encontrado en BD! Redirigiendo a player.html")
            original_url = db[path]['original_url']
            
            # Incrementar clicks
            if 'clicks' not in db[path]:
                db[path]['clicks'] = 0
            db[path]['clicks'] += 1
            save_db(db)
            
            # Redirigir a player.html
            return redirect(f'/player.html?short={path}', code=302)
        else:
            print(f"[DEBUG] ❌ No encontrado en BD. Códigos disponibles: {list(db.keys())[:10]}")
    
    # Si no es un código corto válido, devolver página de error 404
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>URL no encontrada - MakiUrls</title>
        <meta charset="utf-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                text-align: center;
                background: rgba(0,0,0,0.3);
                padding: 40px;
                border-radius: 10px;
            }
            h1 { font-size: 48px; margin: 0; }
            p { font-size: 18px; margin: 20px 0; }
            a {
                color: #fff;
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>404</h1>
            <p>URL acortada no encontrada</p>
            <p>El enlace que buscas no existe o ha sido eliminado.</p>
            <p><a href="/">Volver al inicio</a></p>
        </div>
    </body>
    </html>
    ''', 404

if __name__ == '__main__':
    # Configuración para desarrollo
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Servidor iniciado en http://localhost:{port}")
    print("📝 Asegúrate de abrir index.html en tu navegador")
    app.run(debug=True, host='0.0.0.0', port=port)
else:
    # Configuración para producción (cPanel/Passenger o Railway/Render)
    application = app


