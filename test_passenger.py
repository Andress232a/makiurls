def application(environ, start_response):
    """Aplicación de prueba simple para verificar Passenger"""
    status = '200 OK'
    headers = [('Content-type', 'text/html; charset=utf-8')]
    start_response(status, headers)
    
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Passenger</title>
        <style>
            body { font-family: Arial; padding: 50px; background: #1a1a1a; color: #fff; }
            h1 { color: #4CAF50; }
            .info { background: #2a2a2a; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <h1>✅ ¡Passenger está funcionando!</h1>
        <div class="info">
            <p><strong>Si ves este mensaje, Passenger está activo y Python funciona correctamente.</strong></p>
            <p>El problema está en la configuración de Flask o en los archivos de la aplicación.</p>
        </div>
        <p>Ahora prueba acceder a: <a href="/login.html" style="color: #4CAF50;">/login.html</a></p>
    </body>
    </html>
    '''
    return [html.encode('utf-8')]


