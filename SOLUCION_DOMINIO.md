# 🔧 Solución: Dominio Sirviendo Página por Defecto

El problema es que `cortlink.cc` está sirviendo una página por defecto en lugar de pasar las peticiones a Flask.

## ✅ PASO 1: Verificar Configuración del Dominio

1. En cPanel → **"Domains"** o **"Dominios"**
2. Busca `cortlink.cc` en la lista
3. Haz clic en **"Manage"** o **"Gestionar"**
4. Verifica:
   - **Document Root:** Debe ser `public_html` o similar
   - **Redirects To:** Debe decir "Not Redirected"

## ✅ PASO 2: Verificar .htaccess en public_html

1. En File Manager, ve a `public_html/` (raíz)
2. Busca si hay un `.htaccess` ahí
3. Si existe, ábrelo y revisa su contenido
4. Si tiene reglas de redirección o RewriteRule, puede estar interceptando

## ✅ PASO 3: Crear .htaccess en public_html para Redirigir a /aqui/

Si no hay un `.htaccess` en `public_html/`, o si quieres forzar que todo vaya a `/aqui/`:

1. En File Manager → `public_html/`
2. Crea o edita `.htaccess`
3. Agrega esto:

```apache
RewriteEngine On
RewriteBase /

# Si la petición es para /aqui/, pasarla a Passenger
RewriteCond %{REQUEST_URI} ^/aqui/
RewriteRule ^aqui/(.*)$ /aqui/$1 [L]

# Si la petición es para la raíz, redirigir a /aqui/
RewriteCond %{REQUEST_URI} ^/$
RewriteRule ^$ /aqui/ [R=301,L]
```

## ✅ PASO 4: Alternativa - Mover Aplicación a la Raíz

Si nada funciona, puedes mover la aplicación a la raíz:

1. Mueve todos los archivos de `virtualenv/public_html/aqui/` a `public_html/`
2. Recrea la aplicación con:
   - Application Root: `/home/cort38171608/public_html`
   - Application URL: `cortlink.cc` (sin `/aqui`)

