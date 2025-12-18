from flask import Flask

app = Flask(__name__)

@app.route('/')
def test():
    return '<h1>¡Funciona! Flask está corriendo correctamente.</h1><p>Si ves esto, Passenger está funcionando.</p>'

@app.route('/test')
def test2():
    return '<h1>Ruta /test funciona</h1>'

if __name__ == '__main__':
    app.run()
else:
    application = app


