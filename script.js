// Detectar si estamos en producción o desarrollo
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000' 
    : window.location.origin;

// Elementos del DOM
const videoUrlInput = document.getElementById('videoUrl');
const processBtn = document.getElementById('processBtn');
const resultContainer = document.getElementById('result');
const videoPlayer = document.getElementById('videoPlayer');

// Variable global para HLS
let hls = null;

// Función principal: acortar URL y reproducir video
async function processVideo() {
    const url = videoUrlInput.value.trim();
    
    if (!url) {
        showError('Por favor, ingresa una URL válida');
        return;
    }

    // Validar que sea una URL válida
    try {
        new URL(url);
    } catch (e) {
        showError('Por favor, ingresa una URL válida');
        return;
    }

    // Detectar URLs de Google Drive (mostrar advertencia pero permitir acortar)
    const isGoogleDrive = url.includes('drive.google.com') || url.includes('docs.google.com');

    // Deshabilitar botón durante el proceso
    setButtonLoading(true);

    try {
        // Si es una URL acortada de nuestro servicio, expandirla y reproducir
        if (url.includes(API_URL) || url.includes(window.location.hostname)) {
            const parts = url.split('/');
            const shortCode = parts[parts.length - 1].split('?')[0];
            
            if (shortCode && shortCode.length > 0) {
                await expandAndPlay(shortCode);
                return;
            }
        }

        // Si es una URL normal, acortarla y luego reproducir
        await shortenAndPlay(url, isGoogleDrive);
    } finally {
        setButtonLoading(false);
    }
}

// Controlar estado del botón
function setButtonLoading(loading) {
    if (loading) {
        processBtn.disabled = true;
        processBtn.innerHTML = `
            <span class="btn-text">Procesando...</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="32" stroke-dashoffset="24" opacity="0.3"/>
            </svg>
        `;
    } else {
        processBtn.disabled = false;
        processBtn.innerHTML = `
            <span class="btn-text">Shorten</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
}

// Acortar URL y reproducir video
async function shortenAndPlay(originalUrl, isGoogleDrive = false) {
    // Mostrar loading
    resultContainer.className = 'result-container show loading';
    resultContainer.innerHTML = '<p>Procesando URL y preparando reproductor...</p>';

    try {
        // Paso 1: Acortar la URL
        const urlNameInput = document.getElementById('urlName');
        const urlName = urlNameInput ? urlNameInput.value.trim() : '';
        
        const response = await fetch(`${API_URL}/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                url: originalUrl,
                name: urlName  // Incluir el nombre si se proporcionó
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.error || 'Error al procesar la URL. Por favor, verifica que sea válida.');
            return;
        }

        const shortUrl = `${API_URL}/${data.short_code}`;
        
        // Paso 2: Mostrar la URL acortada
        showSuccess(shortUrl, originalUrl, isGoogleDrive);
        
        // Paso 3: Cargar el video automáticamente
        if (isGoogleDrive) {
            // Si es Google Drive, cargar en iframe
            loadGoogleDriveVideo(originalUrl);
        } else if (isHLS(originalUrl)) {
            // Si es HLS, cargar con hls.js
            await loadHLSVideo(originalUrl);
        } else {
            // Si no es Google Drive ni HLS, intentar cargar como video MP4 normal
            try {
                await loadVideoWithTimeout(originalUrl);
            } catch (error) {
                // El error ya se maneja en loadVideoWithTimeout
                console.log('Video no pudo cargarse, pero la URL se acortó correctamente');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión con el servidor. Por favor, intenta de nuevo.');
    }
}

// Expandir URL acortada y reproducir video
async function expandAndPlay(shortCode) {
    resultContainer.className = 'result-container show loading';
    resultContainer.innerHTML = '<p>Expandiendo URL acortada...</p>';

    try {
        const response = await fetch(`${API_URL}/${shortCode}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            showError('URL acortada no encontrada o inválida');
            return;
        }
        
        const data = await response.json();
        
        if (data.original_url) {
            // Mostrar solo la URL acortada (no la original)
            const shortUrl = `${API_URL}/${shortCode}`;
            resultContainer.className = 'result-container show success';
            resultContainer.innerHTML = `
                <div class="result-url">
                    <strong>URL Acortada:</strong><br>
                    <a href="${shortUrl}" target="_blank">${shortUrl}</a>
                </div>
                <div class="info-note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
                    </svg>
                    <span>Video cargado desde URL acortada. Si el video no se reproduce, puede requerir autenticación o tener restricciones del servidor.</span>
                </div>
                <button class="copy-btn" onclick="copyToClipboard('${shortUrl}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                        <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                    </svg>
                    Copiar URL Acortada
                </button>
            `;
            
            // Cargar el video
            const isGoogleDrive = isGoogleDriveUrl(data.original_url);
            if (isGoogleDrive) {
                // Si es Google Drive, cargar en iframe
                loadGoogleDriveVideo(data.original_url);
            } else if (isHLS(data.original_url)) {
                // Si es HLS, cargar con hls.js
                await loadHLSVideo(data.original_url);
            } else {
                // Si no es Google Drive ni HLS, intentar cargar como video MP4 normal
                try {
                    await loadVideoWithTimeout(data.original_url);
                } catch (error) {
                    // El error ya se maneja en loadVideoWithTimeout
                    console.log('Video no pudo cargarse, pero la URL se expandió correctamente');
                }
            }
        } else {
            showError('URL original no encontrada en la base de datos');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión con el servidor');
    }
}

// Verificar si es una URL de Google Drive
function isGoogleDriveUrl(url) {
    return url.includes('drive.google.com') || url.includes('docs.google.com');
}

// Verificar si es una URL HLS
function isHLS(url) {
    return url.includes('.m3u8') || url.includes('hls') || url.toLowerCase().includes('m3u8');
}

// Cargar video HLS con hls.js
async function loadHLSVideo(hlsUrl) {
    return new Promise((resolve, reject) => {
        const placeholder = document.querySelector('.video-placeholder');
        const placeholderText = document.getElementById('placeholder-text');
        
        if (placeholderText) {
            placeholderText.textContent = 'Cargando video HLS...';
        }
        if (placeholder) placeholder.style.display = 'flex';
        
        // Limpiar instancia HLS anterior si existe
        if (hls) {
            hls.destroy();
            hls = null;
        }
        
        // Verificar si el navegador soporta HLS nativamente
        if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari soporta HLS nativamente
            videoPlayer.src = hlsUrl;
            videoPlayer.load();
            
            videoPlayer.addEventListener('loadeddata', () => {
                if (placeholder) placeholder.style.display = 'none';
                updateSuccessMessageOnVideoLoad();
                detectHLSAudioTracks();
                resolve();
            }, { once: true });
            
            videoPlayer.addEventListener('error', () => {
                reject(new Error('Error al cargar video HLS'));
            }, { once: true });
        } else if (Hls.isSupported()) {
            // Usar hls.js para navegadores que no soportan HLS nativamente
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            
            hls.loadSource(hlsUrl);
            hls.attachMedia(videoPlayer);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (placeholder) placeholder.style.display = 'none';
                updateSuccessMessageOnVideoLoad();
                detectHLSAudioTracks();
                resolve();
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('Error HLS:', data);
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            reject(new Error('Error de red al cargar HLS'));
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            reject(new Error('Error de media al cargar HLS'));
                            break;
                        default:
                            reject(new Error('Error fatal al cargar HLS'));
                            break;
                    }
                }
            });
        } else {
            reject(new Error('Tu navegador no soporta HLS. Prueba con Chrome, Firefox o Safari.'));
        }
    });
}

// Detectar y configurar pistas de audio HLS
function detectHLSAudioTracks() {
    try {
        const languageSelector = document.getElementById('languageSelector');
        const audioTrackSelect = document.getElementById('audioTrackSelect');
        
        if (!languageSelector || !audioTrackSelect) return;
        
        // Limpiar opciones anteriores
        audioTrackSelect.innerHTML = '';
        
        let audioTracks = [];
        
        // Obtener pistas de audio desde hls.js o del video nativo
        if (hls && hls.audioTracks && hls.audioTracks.length > 0) {
            // HLS con hls.js
            audioTracks = hls.audioTracks;
            console.log(`HLS tiene ${audioTracks.length} pistas de audio disponibles`);
            
            // Agregar opciones para cada pista
            for (let i = 0; i < audioTracks.length; i++) {
                const track = audioTracks[i];
                const option = document.createElement('option');
                option.value = i;
                const trackName = track.name || track.lang || `Idioma ${i + 1}`;
                option.textContent = trackName;
                if (track.default) {
                    option.selected = true;
                }
                audioTrackSelect.appendChild(option);
            }
            
            // Mostrar el selector
            languageSelector.style.display = 'flex';
            
            // Configurar evento para cambiar de pista
            audioTrackSelect.addEventListener('change', function() {
                changeHLSAudioTrack(parseInt(this.value));
            });
            
        } else if (videoPlayer.audioTracks && videoPlayer.audioTracks.length > 1) {
            // HLS nativo (Safari)
            audioTracks = Array.from(videoPlayer.audioTracks);
            console.log(`HLS nativo tiene ${audioTracks.length} pistas de audio disponibles`);
            
            // Agregar opciones para cada pista
            for (let i = 0; i < audioTracks.length; i++) {
                const track = audioTracks[i];
                const option = document.createElement('option');
                option.value = i;
                const trackName = track.label || track.language || `Idioma ${i + 1}`;
                option.textContent = trackName;
                if (track.enabled) {
                    option.selected = true;
                }
                audioTrackSelect.appendChild(option);
            }
            
            // Mostrar el selector
            languageSelector.style.display = 'flex';
            
            // Configurar evento para cambiar de pista
            audioTrackSelect.addEventListener('change', function() {
                changeAudioTrack(parseInt(this.value));
            });
        } else {
            // No se detectaron pistas, pero mostrar selector con mensaje
            const instructionOption = document.createElement('option');
            instructionOption.value = '';
            instructionOption.textContent = 'Cargando pistas...';
            instructionOption.disabled = true;
            audioTrackSelect.appendChild(instructionOption);
            
            languageSelector.style.display = 'flex';
        }
    } catch (e) {
        console.error('Error al detectar pistas HLS:', e);
    }
}

// Cambiar pista de audio HLS
function changeHLSAudioTrack(trackIndex) {
    try {
        if (!hls || !hls.audioTracks || trackIndex < 0 || trackIndex >= hls.audioTracks.length) {
            console.error('Índice de pista HLS inválido');
            return;
        }
        
        // Cambiar la pista de audio en HLS
        hls.audioTrack = trackIndex;
        
        const track = hls.audioTracks[trackIndex];
        console.log(`Cambiado a pista HLS ${trackIndex + 1}: ${track.name || track.lang || 'Idioma ' + (trackIndex + 1)}`);
        
        showVideoMessage(`Idioma cambiado a: ${track.name || track.lang || 'Idioma ' + (trackIndex + 1)}`, 'success');
        
    } catch (e) {
        console.error('Error al cambiar pista HLS:', e);
        showVideoMessage('Error al cambiar el idioma HLS', 'error');
    }
}

// Cargar video de Google Drive en iframe
function loadGoogleDriveVideo(driveUrl) {
    // Convertir URL de Google Drive a formato de visualización
    let embedUrl = driveUrl;
    
    // Si es un enlace de visualización, convertirlo a formato de reproducción
    if (driveUrl.includes('/file/d/')) {
        const fileId = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileId && fileId[1]) {
            // Usar el formato de previsualización de Google Drive
            embedUrl = `https://drive.google.com/file/d/${fileId[1]}/preview`;
        }
    }
    
    // Ocultar el video player y placeholder, mostrar el iframe
    const placeholder = document.querySelector('.video-placeholder');
    const placeholderText = document.getElementById('placeholder-text');
    const languageSelector = document.getElementById('languageSelector');
    
    if (videoPlayer) {
        videoPlayer.style.display = 'none';
    }
    if (placeholder) {
        placeholder.style.display = 'none';
    }
    
    // Ocultar selector de idioma para Google Drive (Google Drive lo maneja automáticamente)
    if (languageSelector) {
        languageSelector.style.display = 'none';
    }
    
    const iframe = document.getElementById('googleDriveFrame');
    if (iframe) {
        iframe.src = embedUrl;
        iframe.style.display = 'block';
        
        // Actualizar el mensaje cuando el iframe se carga exitosamente
        iframe.onload = function() {
            updateSuccessMessageForGoogleDrive();
        };
    }
}

// Actualizar mensaje de éxito cuando el video se carga correctamente
function updateSuccessMessageOnVideoLoad() {
    const infoNoteText = document.getElementById('info-note-text');
    if (infoNoteText) {
        infoNoteText.innerHTML = '<strong>✓ Video cargado exitosamente.</strong> El video está listo para reproducir. Si tiene múltiples idiomas, usa el selector de idioma en la esquina superior derecha del reproductor o haz clic derecho → "Configuración" → "Pistas".';
        
        // Cambiar el color del borde a verde (éxito)
        const infoNote = document.querySelector('.info-note');
        if (infoNote) {
            infoNote.style.borderColor = 'var(--success-color)';
            infoNote.style.background = 'rgba(34, 197, 94, 0.1)';
        }
    }
}

// Actualizar mensaje de éxito para Google Drive cuando se carga correctamente
function updateSuccessMessageForGoogleDrive() {
    const infoNoteText = document.getElementById('info-note-text');
    if (infoNoteText) {
        infoNoteText.innerHTML = '<strong>✓ Video de Google Drive cargado exitosamente.</strong> El video está listo para reproducir. Puedes cambiar de idioma usando los controles del reproductor de Google Drive.';
        
        // Cambiar el color del borde a verde (éxito)
        const infoNote = document.querySelector('.info-note');
        if (infoNote) {
            infoNote.style.borderColor = 'var(--success-color)';
            infoNote.style.background = 'rgba(34, 197, 94, 0.1)';
        }
    }
}

// Mostrar resultado exitoso
function showSuccess(shortUrl, originalUrl, isGoogleDrive = false) {
    const isGoogleDriveUrl = isGoogleDrive || originalUrl.includes('drive.google.com') || originalUrl.includes('docs.google.com');
    const isHLSUrl = isHLS(originalUrl);
    
    resultContainer.className = 'result-container show success';
    resultContainer.innerHTML = `
        <div class="result-url">
            <strong>URL Acortada:</strong><br>
            <a href="${shortUrl}" target="_blank">${shortUrl}</a>
        </div>
        <div class="result-url">
            <strong>URL Original:</strong><br>
            <small>${originalUrl}</small>
        </div>
        <div class="info-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
            </svg>
            <span id="info-note-text"><strong>✓ URL acortada generada exitosamente.</strong> ${isGoogleDriveUrl ? 'Cargando reproductor de Google Drive... El video se mostrará automáticamente cuando esté listo. Puedes cambiar de idioma usando los controles del reproductor.' : isHLSUrl ? 'Video HLS detectado. El reproductor soporta múltiples idiomas. Usa el selector de idioma en la esquina superior derecha del reproductor para cambiar entre pistas de audio disponibles.' : 'Cargando video... Si el video tiene múltiples idiomas, usa el selector de idioma en la esquina superior derecha del reproductor o haz clic derecho → "Configuración" → "Pistas".'}</span>
        </div>
        <button class="copy-btn" onclick="copyToClipboard('${shortUrl}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
            </svg>
            Copiar URL Acortada
        </button>
    `;
}

// Mostrar error
function showError(message) {
    resultContainer.className = 'result-container show error';
    resultContainer.innerHTML = `<p>❌ ${message}</p>`;
}

// Copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target.closest('.copy-btn') || event.target;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
            </svg>
            Copiado
        `;
        btn.style.background = 'var(--success-color)';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        showVideoMessage('Error al copiar. Por favor, copia manualmente.', 'error');
    });
}

// Cargar video con timeout y mejor manejo de errores
function loadVideoWithTimeout(videoUrl) {
    return new Promise((resolve, reject) => {
        const placeholder = document.querySelector('.video-placeholder');
        const placeholderText = document.getElementById('placeholder-text');
        const timeoutDuration = 30000; // 30 segundos (aumentado para videos que tardan más en cargar)
        let timeoutId;
        let hasLoaded = false;
        let hasErrored = false;

        // Mostrar mensaje de carga
        if (placeholderText) {
            placeholderText.textContent = 'Cargando video...';
        }
        if (placeholder) placeholder.style.display = 'flex';

        // Limpiar listeners anteriores
        videoPlayer.removeEventListener('error', handleVideoError);
        videoPlayer.removeEventListener('loadeddata', onVideoLoaded);
        videoPlayer.removeEventListener('canplay', onVideoLoaded);
        videoPlayer.removeEventListener('canplaythrough', onVideoLoaded);
        videoPlayer.removeEventListener('playing', onVideoLoaded);

        // Función para manejar carga exitosa
        function onVideoLoaded() {
            if (hasErrored) return;
            hasLoaded = true;
            clearTimeout(timeoutId);
            if (placeholder) placeholder.style.display = 'none';
            if (placeholderText) placeholderText.textContent = 'El video aparecerá aquí';
            
            // Actualizar mensaje de éxito cuando el video se carga correctamente
            updateSuccessMessageOnVideoLoad();
            
            // Detección de pistas de audio deshabilitada
            
            // Limpiar todos los listeners
            videoPlayer.removeEventListener('error', handleVideoError);
            videoPlayer.removeEventListener('loadeddata', onVideoLoaded);
            videoPlayer.removeEventListener('canplay', onVideoLoaded);
            videoPlayer.removeEventListener('canplaythrough', onVideoLoaded);
            videoPlayer.removeEventListener('playing', onVideoLoaded);
            videoPlayer.removeEventListener('progress', checkVideoProgress);
            resolve();
        }
        
        // Función para verificar si el video está cargando progresivamente
        function checkVideoProgress() {
            // Si el video tiene datos y no hay error real, considerarlo cargado
            if (videoPlayer.readyState >= 2 && !hasLoaded && !hasErrored) {
                console.log('Video cargando progresivamente, readyState:', videoPlayer.readyState);
                // Si tiene suficiente buffer, marcarlo como cargado
                if (videoPlayer.buffered.length > 0 && videoPlayer.buffered.end(0) > 0) {
                    console.log('Video tiene buffer suficiente, marcando como cargado');
                    onVideoLoaded();
                }
            }
        }
        
        // Variable para rastrear si se disparó el evento error
        let errorEventFired = false;
        
        // Función para manejar errores del video
        function handleVideoError() {
            // Solo marcar que el evento se disparó, pero NO mostrar el error todavía
            errorEventFired = true;
            console.log('Evento error disparado, pero esperando a verificar si el video se carga...');
            
            // Verificar periódicamente si el video se carga después del error
            let checkCount = 0;
            const checkInterval = setInterval(() => {
                checkCount++;
                
                // Verificar si el video tiene datos o se está cargando
                const currentReadyState = videoPlayer.readyState;
                const hasVideoData = currentReadyState >= 2; // HAVE_CURRENT_DATA o superior
                const canPlay = currentReadyState >= 3; // HAVE_FUTURE_DATA o superior
                
                // Si el video se cargó o puede reproducirse, cancelar el error
                if (hasLoaded || hasVideoData || canPlay) {
                    console.log('Video se cargó exitosamente a pesar del error inicial. ReadyState:', currentReadyState);
                    clearInterval(checkInterval);
                    errorEventFired = false;
                    
                    // Si aún no se marcó como cargado, hacerlo ahora
                    if (!hasLoaded) {
                        onVideoLoaded();
                    }
                    return;
                }
                
                // Después de 5 segundos, verificar si realmente hay un error
                if (checkCount >= 5) {
                    clearInterval(checkInterval);
                    
                    // Verificar una última vez si el video se cargó
                    if (hasLoaded || videoPlayer.readyState >= 2) {
                        console.log('Video se cargó en el último momento');
                        return;
                    }
                    
                    // Verificar si realmente hay un error persistente
                    const error = videoPlayer.error;
                    if (!error) {
                        // No hay error real, el video puede estar cargando todavía
                        console.log('No hay error real, el video puede estar cargando todavía');
                        return;
                    }
                    
                    // Verificar si el video puede reproducirse a pesar del error
                    if (videoPlayer.readyState >= 1) {
                        console.log('Video tiene metadatos, puede que funcione');
                        // Intentar reproducir para verificar
                        videoPlayer.play().then(() => {
                            console.log('Video se puede reproducir!');
                            if (!hasLoaded) {
                                onVideoLoaded();
                            }
                        }).catch(() => {
                            // Si no se puede reproducir, mostrar el error
                            showActualError(error);
                        });
                        return;
                    }
                    
                    // Solo mostrar error si realmente no se puede cargar
                    showActualError(error);
                }
            }, 1000); // Verificar cada segundo
            
            // Función auxiliar para mostrar el error real
            function showActualError(error) {
                if (hasErrored) return;
                hasErrored = true;
                clearTimeout(timeoutId);
                if (placeholder) placeholder.style.display = 'flex';
                
                let message = 'Error al cargar el video';
                let placeholderMsg = 'No se pudo cargar el video';
                
                if (error) {
                    switch(error.code) {
                        case 1: // MEDIA_ERR_ABORTED
                            message = 'Carga del video cancelada';
                            placeholderMsg = 'Carga cancelada';
                            break;
                        case 2: // MEDIA_ERR_NETWORK
                            message = 'Error de conexión de red. La URL puede requerir autenticación o no estar accesible';
                            placeholderMsg = 'Error de conexión';
                            break;
                        case 3: // MEDIA_ERR_DECODE
                            message = 'Error al decodificar el formato de video';
                            placeholderMsg = 'Formato no compatible';
                            break;
                        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                            message = 'El servidor rechazó la solicitud (Error 500). El video puede requerir autenticación, tener restricciones CORS, o no estar disponible para reproducción directa.';
                            placeholderMsg = 'Error del servidor';
                            break;
                        default:
                            message = 'Error desconocido al cargar el video';
                            placeholderMsg = 'Error al cargar';
                    }
                }
                
                if (placeholderText) placeholderText.textContent = placeholderMsg;
                
                // Mensaje más específico para errores de servidor
                let userMessage = message;
                if (error && error.code === 4) {
                    userMessage = 'El servidor rechazó la solicitud (Error 500). El video puede requerir autenticación, tener restricciones CORS, o no estar disponible para reproducción directa.';
                }
                
                // Actualizar mensaje de error en el info-note
                const infoNoteText = document.getElementById('info-note-text');
                if (infoNoteText) {
                    infoNoteText.innerHTML = `<strong>⚠️ Error al cargar el video.</strong> ${userMessage} La URL acortada se generó correctamente y puedes compartirla, pero el video no puede reproducirse directamente desde este navegador.`;
                    
                    // Cambiar el color del borde a rojo (error)
                    const infoNote = document.querySelector('.info-note');
                    if (infoNote) {
                        infoNote.style.borderColor = 'var(--error-color)';
                        infoNote.style.background = 'rgba(239, 68, 68, 0.1)';
                    }
                }
                
                showVideoMessage(`⚠️ ${userMessage} La URL acortada se generó correctamente y puedes compartirla, pero el video no puede reproducirse directamente desde este navegador.`, 'error');
                reject(new Error(message));
            }
        }
        
        // Función para detectar y configurar pistas de audio disponibles
        function detectAudioTracks() {
            try {
                const languageSelector = document.getElementById('languageSelector');
                const audioTrackSelect = document.getElementById('audioTrackSelect');
                
                if (!languageSelector || !audioTrackSelect) return;
                
                // Limpiar opciones anteriores
                audioTrackSelect.innerHTML = '';
                
                // Verificar si el navegador soporta audioTracks
                if (videoPlayer.audioTracks && videoPlayer.audioTracks.length > 1) {
                    console.log(`Video tiene ${videoPlayer.audioTracks.length} pistas de audio disponibles`);
                    
                    // Agregar opciones para cada pista detectada
                    for (let i = 0; i < videoPlayer.audioTracks.length; i++) {
                        const track = videoPlayer.audioTracks[i];
                        const option = document.createElement('option');
                        option.value = i;
                        const trackName = track.label || track.language || `Idioma ${i + 1}`;
                        option.textContent = trackName;
                        if (track.enabled) {
                            option.selected = true;
                        }
                        audioTrackSelect.appendChild(option);
                    }
                    
                    // Mostrar el selector
                    languageSelector.style.display = 'flex';
                    
                    // Configurar evento para cambiar de pista
                    audioTrackSelect.addEventListener('change', function() {
                        changeAudioTrack(parseInt(this.value));
                    });
                    
                } else {
                    // Si no se detectan pistas automáticamente, mostrar opciones comunes y instrucciones
                    console.log('No se detectaron pistas automáticamente. Mostrando opciones manuales.');
                    
                    // Agregar opción con instrucciones
                    const instructionOption = document.createElement('option');
                    instructionOption.value = '';
                    instructionOption.textContent = 'Usa los controles del reproductor';
                    instructionOption.disabled = true;
                    audioTrackSelect.appendChild(instructionOption);
                    
                    // Agregar opciones comunes de idioma (por si el video las tiene)
                    const commonLanguages = [
                        { value: 'es', label: 'Español' },
                        { value: 'en', label: 'Inglés' },
                        { value: 'fr', label: 'Francés' },
                        { value: 'pt', label: 'Portugués' }
                    ];
                    
                    commonLanguages.forEach(lang => {
                        const option = document.createElement('option');
                        option.value = lang.value;
                        option.textContent = lang.label;
                        audioTrackSelect.appendChild(option);
                    });
                    
                    // Mostrar el selector con instrucciones
                    languageSelector.style.display = 'flex';
                    languageSelector.title = 'Si el video tiene múltiples idiomas, usa: Clic derecho → Configuración → Pistas, o el menú de configuración (⚙️) del reproductor';
                    
                    // Mostrar hint
                    const languageHint = document.getElementById('languageHint');
                    if (languageHint) {
                        languageHint.style.display = 'block';
                    }
                    
                    // Configurar evento informativo
                    audioTrackSelect.addEventListener('change', function() {
                        if (this.value) {
                            showVideoMessage('💡 Para cambiar el idioma: Haz clic derecho en el video → "Configuración" → "Pistas", o usa el menú de configuración (⚙️) en los controles del reproductor.', 'success');
                        }
                    });
                }
                
                // Detectar subtítulos también
                if (videoPlayer.textTracks && videoPlayer.textTracks.length > 0) {
                    console.log(`Video tiene ${videoPlayer.textTracks.length} pistas de subtítulos disponibles`);
                }
            } catch (e) {
                console.error('Error al detectar pistas de audio:', e);
                // Aún así mostrar el selector con instrucciones
                const languageSelector = document.getElementById('languageSelector');
                if (languageSelector) {
                    languageSelector.style.display = 'flex';
                }
            }
        }
        
        // Función para cambiar la pista de audio
        function changeAudioTrack(trackIndex) {
            try {
                if (!videoPlayer.audioTracks || trackIndex < 0 || trackIndex >= videoPlayer.audioTracks.length) {
                    console.error('Índice de pista inválido');
                    return;
                }
                
                // Desactivar todas las pistas
                for (let i = 0; i < videoPlayer.audioTracks.length; i++) {
                    videoPlayer.audioTracks[i].enabled = false;
                }
                
                // Activar la pista seleccionada
                videoPlayer.audioTracks[trackIndex].enabled = true;
                
                const track = videoPlayer.audioTracks[trackIndex];
                console.log(`Cambiado a pista ${trackIndex + 1}: ${track.label || track.language || 'Idioma ' + (trackIndex + 1)}`);
                
                // Mostrar mensaje temporal
                showVideoMessage(`Idioma cambiado a: ${track.label || track.language || 'Idioma ' + (trackIndex + 1)}`, 'success');
                
            } catch (e) {
                console.error('Error al cambiar pista de audio:', e);
                showVideoMessage('Error al cambiar el idioma. Tu navegador puede no soportar esta función.', 'error');
            }
        }


        // Configurar timeout (solo si realmente no hay progreso)
        timeoutId = setTimeout(() => {
            // Verificar una última vez si el video se cargó antes de mostrar el error
            const finalReadyState = videoPlayer.readyState;
            const finalBuffered = videoPlayer.buffered.length > 0 ? videoPlayer.buffered.end(0) : 0;
            
            // Si el video tiene metadatos y buffer, aún puede estar cargando
            if (finalReadyState >= 1 && finalBuffered > 0 && !hasLoaded && !hasErrored) {
                console.log('Video tiene progreso al final del timeout, dándole más tiempo - readyState:', finalReadyState, 'buffer:', finalBuffered);
                // Dar 5 segundos más si hay progreso
                setTimeout(() => {
                    if (!hasLoaded && !hasErrored && videoPlayer.readyState >= 1) {
                        console.log('Video cargado después de extensión del timeout');
                        onVideoLoaded();
                    } else if (!hasLoaded && !hasErrored) {
                        showTimeoutError();
                    }
                }, 5000);
                return;
            }
            
            if (!hasLoaded && !hasErrored) {
                showTimeoutError();
            }
            
            function showTimeoutError() {
                hasErrored = true;
                videoPlayer.pause();
                videoPlayer.src = '';
                if (placeholder) placeholder.style.display = 'flex';
                if (placeholderText) placeholderText.textContent = 'Tiempo de espera agotado';
                
                // Actualizar mensaje de error en el info-note
                const infoNoteText = document.getElementById('info-note-text');
                if (infoNoteText) {
                    infoNoteText.innerHTML = '<strong>⚠️ Tiempo de espera agotado.</strong> El video puede requerir autenticación o no estar disponible para reproducción directa. La URL acortada se generó correctamente y puedes compartirla.';
                    
                    // Cambiar el color del borde a rojo (error)
                    const infoNote = document.querySelector('.info-note');
                    if (infoNote) {
                        infoNote.style.borderColor = 'var(--error-color)';
                        infoNote.style.background = 'rgba(239, 68, 68, 0.1)';
                    }
                }
                
                showVideoMessage('⏱️ Tiempo de espera agotado. El video puede requerir autenticación o no estar disponible para reproducción directa. La URL acortada se generó correctamente.', 'error');
                reject(new Error('Timeout'));
            }
        }, timeoutDuration);

        // Configurar listeners
        videoPlayer.addEventListener('error', handleVideoError, { once: true });
        videoPlayer.addEventListener('loadeddata', onVideoLoaded, { once: true });
        videoPlayer.addEventListener('canplay', onVideoLoaded, { once: true });
        videoPlayer.addEventListener('canplaythrough', onVideoLoaded, { once: true });
        videoPlayer.addEventListener('playing', onVideoLoaded, { once: true });
        videoPlayer.addEventListener('progress', checkVideoProgress);
        videoPlayer.addEventListener('loadstart', () => {
            console.log('Video iniciando carga...');
        });

        // Intentar cargar el video
        try {
            videoPlayer.src = videoUrl;
            videoPlayer.load();
            
            // Verificar periódicamente si el video se carga (incluso si hay un error inicial)
            let lastReadyState = -1;
            let lastBufferedTime = 0;
            const progressCheck = setInterval(() => {
                const currentReadyState = videoPlayer.readyState;
                const currentBuffered = videoPlayer.buffered.length > 0 ? videoPlayer.buffered.end(0) : 0;
                
                // Si el readyState cambió o hay buffer, el video está cargando
                if (currentReadyState !== lastReadyState || currentBuffered > lastBufferedTime) {
                    console.log('Video cargando progresivamente - readyState:', currentReadyState, 'buffer:', currentBuffered);
                    lastReadyState = currentReadyState;
                    lastBufferedTime = currentBuffered;
                }
                
                // Si el video tiene metadatos y buffer, considerarlo cargado (más permisivo)
                if (currentReadyState >= 1 && currentBuffered > 0 && !hasLoaded && !hasErrored) {
                    console.log('Video detectado como cargado (readyState >= 1 con buffer):', currentReadyState);
                    clearInterval(progressCheck);
                    onVideoLoaded();
                    return;
                }
                
                // Si el video tiene datos suficientes para reproducir, considerarlo cargado
                if (currentReadyState >= 2 && !hasLoaded && !hasErrored) {
                    console.log('Video detectado como cargado (readyState >= 2):', currentReadyState);
                    clearInterval(progressCheck);
                    onVideoLoaded();
                    return;
                }
                
                // Si el video puede reproducirse, considerarlo cargado
                if (currentReadyState >= 3 && !hasLoaded && !hasErrored) {
                    console.log('Video puede reproducirse (readyState >= 3):', currentReadyState);
                    clearInterval(progressCheck);
                    onVideoLoaded();
                    return;
                }
                
                // Si ya se resolvió o hay error, limpiar
                if (hasLoaded || hasErrored) {
                    clearInterval(progressCheck);
                }
            }, 200); // Verificar cada 200ms para detectar más rápido
            
            // También verificar cuando el video tiene suficiente buffer (más agresivo)
            videoPlayer.addEventListener('progress', () => {
                const buffered = videoPlayer.buffered.length > 0 ? videoPlayer.buffered.end(0) : 0;
                const readyState = videoPlayer.readyState;
                
                if (buffered > 0 && readyState >= 1 && !hasLoaded && !hasErrored) {
                    console.log('Video tiene buffer y metadatos, considerando cargado - readyState:', readyState, 'buffer:', buffered);
                    clearInterval(progressCheck);
                    onVideoLoaded();
                }
            });
            
            // Verificar también cuando se cargan los metadatos
            videoPlayer.addEventListener('loadedmetadata', () => {
                const buffered = videoPlayer.buffered.length > 0 ? videoPlayer.buffered.end(0) : 0;
                if (buffered > 0 && !hasLoaded && !hasErrored) {
                    console.log('Metadatos cargados y hay buffer, considerando cargado');
                    clearInterval(progressCheck);
                    onVideoLoaded();
                }
            });
            
            // Limpiar el intervalo después del timeout
            setTimeout(() => {
                clearInterval(progressCheck);
            }, timeoutDuration);
            
        } catch (error) {
            clearTimeout(timeoutId);
            handleVideoError();
            reject(error);
        }
    });
}

// Manejar errores del video (función auxiliar)
function handleVideoError() {
    const error = videoPlayer.error;
    let message = 'Error al cargar el video';
    
    if (error) {
        switch(error.code) {
            case error.MEDIA_ERR_ABORTED:
                message = 'Carga del video cancelada';
                break;
            case error.MEDIA_ERR_NETWORK:
                message = 'Error de conexión de red';
                break;
            case error.MEDIA_ERR_DECODE:
                message = 'Error al decodificar el formato de video';
                break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                message = 'Formato no soportado o URL inválida';
                break;
            default:
                message = 'Error desconocido al cargar el video';
        }
    }
    
    showVideoMessage(`${message}. Verifica que la URL sea válida y accesible.`, 'error');
    console.error('Error del video:', error);
}

// Mostrar mensaje en el área del video
function showVideoMessage(message, type) {
    // Crear o actualizar mensaje en el result container
    if (resultContainer && resultContainer.classList.contains('show')) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        resultContainer.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Event listeners
processBtn.addEventListener('click', processVideo);

// Permitir Enter en el input
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        processVideo();
    }
});

// Verificar autenticación al cargar la página
window.addEventListener('load', async () => {
    // Verificar si está autenticado
    try {
        const response = await fetch(`${API_URL}/api/check-auth`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/login.html';
            return;
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        window.location.href = '/login.html';
        return;
    }
    
    // Si está autenticado, continuar con la carga normal
    const urlParams = new URLSearchParams(window.location.search);
    const shortCode = urlParams.get('short');
    
    if (shortCode) {
        // Mostrar loading
        resultContainer.className = 'result-container show loading';
        resultContainer.innerHTML = '<p>Cargando video desde URL acortada...</p>';
        
        // Expandir y cargar el video automáticamente
        try {
            await expandAndPlay(shortCode);
        } catch (error) {
            console.error('Error al cargar desde URL acortada:', error);
        }
    }
});

// ==================== FUNCIONALIDAD DE ESTADÍSTICAS ====================

// Elementos del DOM para estadísticas
const statsLink = document.getElementById('statsLink');
const statsSection = document.getElementById('statsSection');
const closeStatsBtn = document.getElementById('closeStatsBtn');
const statsTableBody = document.getElementById('statsTableBody');
const totalUrlsEl = document.getElementById('totalUrls');
const totalClicksEl = document.getElementById('totalClicks');

// Función para cargar y mostrar estadísticas
async function loadStats() {
    try {
        // Mostrar sección de estadísticas
        statsSection.style.display = 'block';
        
        // Mostrar loading
        statsTableBody.innerHTML = '<tr><td colspan="6" class="loading-row">Cargando estadísticas...</td></tr>';
        
        // Hacer petición a la API
        const response = await fetch(`${API_URL}/api/stats`);
        
        if (!response.ok) {
            throw new Error('Error al cargar estadísticas');
        }
        
        const data = await response.json();
        
        // Procesar y guardar todas las estadísticas para filtrado
        allStatsData = (data.stats || []).map((stat, index) => {
            // Procesar fecha (manejar URLs antiguas que tienen IP en lugar de fecha)
            let dateObj = null;
            try {
                if (stat.created_at && stat.created_at !== 'N/A') {
                    // Si created_at parece una IP (contiene puntos y números), usar fecha actual
                    if (/^\d+\.\d+\.\d+\.\d+$/.test(stat.created_at)) {
                        // Es una IP, usar fecha actual (hoy) para que aparezca en los filtros
                        dateObj = new Date();
                    } else {
                        // Intentar parsear como fecha ISO
                        dateObj = new Date(stat.created_at);
                        if (isNaN(dateObj.getTime())) {
                            // Si no se puede parsear, usar fecha antigua
                            dateObj = new Date();
                            dateObj.setDate(dateObj.getDate() - 30 - index);
                        }
                    }
                } else {
                    // Si no hay fecha, usar fecha actual (hoy)
                    dateObj = new Date();
                }
            } catch (e) {
                // En caso de error, usar fecha actual (hoy)
                dateObj = new Date();
            }
            
            // Guardar el objeto fecha en el stat para filtrado
            stat._dateObj = dateObj || new Date();
            return stat;
        });
        
        // Aplicar filtro actual (por defecto 'all')
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        filterStatsByDate(activeFilter);
        
        return; // Salir aquí, filterStatsByDate ya renderiza la tabla
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        statsTableBody.innerHTML = '<tr><td colspan="6" class="loading-row" style="color: var(--error-red);">Error al cargar estadísticas. Intenta recargar la página.</td></tr>';
    }
}

// Función para filtrar estadísticas por fecha
function filterStatsByDate(filter) {
    if (!allStatsData || allStatsData.length === 0) {
        if (statsTableBody) {
            statsTableBody.innerHTML = '<tr><td colspan="6" class="loading-row">No hay datos para filtrar</td></tr>';
        }
        return;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    let filteredStats = [];
    
    switch(filter) {
        case 'today':
            filteredStats = allStatsData.filter(stat => {
                const statDate = stat._dateObj || new Date(stat.created_at);
                // Comparar solo la fecha (sin hora) para "hoy"
                const statDateOnly = new Date(statDate.getFullYear(), statDate.getMonth(), statDate.getDate());
                return statDateOnly.getTime() === today.getTime();
            });
            break;
        case 'week':
            filteredStats = allStatsData.filter(stat => {
                const statDate = stat._dateObj || new Date(stat.created_at);
                return statDate >= weekAgo;
            });
            break;
        case 'month':
            filteredStats = allStatsData.filter(stat => {
                const statDate = stat._dateObj || new Date(stat.created_at);
                return statDate >= monthAgo;
            });
            break;
        case 'all':
        default:
            filteredStats = allStatsData;
            break;
    }
    
    // Actualizar resumen con datos filtrados
    if (totalUrlsEl) totalUrlsEl.textContent = filteredStats.length;
    if (totalClicksEl) totalClicksEl.textContent = filteredStats.reduce((sum, stat) => sum + (stat.clicks || 0), 0);
    
    // Limpiar tabla
    if (!statsTableBody) return;
    statsTableBody.innerHTML = '';
    
    if (filteredStats.length === 0) {
        statsTableBody.innerHTML = '<tr><td colspan="6" class="loading-row">No hay URLs en este período</td></tr>';
        return;
    }
    
    // Renderizar estadísticas filtradas
    filteredStats.forEach((stat) => {
        const row = document.createElement('tr');
        
        // Formatear fecha
        let formattedDate = 'N/A';
        try {
            const dateObj = stat._dateObj || new Date();
            if (dateObj && !isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (e) {
            formattedDate = 'N/A';
        }
        
        // Truncar URL original si es muy larga
        let originalUrlDisplay = stat.original_url;
        if (originalUrlDisplay && originalUrlDisplay.length > 50) {
            originalUrlDisplay = originalUrlDisplay.substring(0, 50) + '...';
        }
        
        // Mostrar nombre o "Sin nombre" si está vacío
        const displayName = stat.name && stat.name.trim() ? stat.name.trim() : '<span style="color: #888; font-style: italic;">Sin nombre</span>';
        
        row.innerHTML = `
            <td class="url-name">${displayName}</td>
            <td>
                <a href="${stat.short_url}" target="_blank" class="url-short">
                    ${stat.short_url}
                </a>
            </td>
            <td class="url-original" title="${stat.original_url || ''}">${originalUrlDisplay || ''}</td>
            <td class="clicks-count">${stat.clicks || 0}</td>
            <td class="date-created" data-date="${stat.created_at || ''}">${formattedDate}</td>
            <td class="actions-cell">
                <button class="action-btn copy-btn" onclick="copyShortUrl('${stat.short_url}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                    </svg>
                    Copiar
                </button>
                <button class="action-btn delete-btn" onclick="deleteUrl('${stat.short_code}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Eliminar
                </button>
            </td>
        `;
        
        statsTableBody.appendChild(row);
    });
}

// Función para eliminar una URL individual
async function deleteUrl(shortCode) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta URL? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/delete/${shortCode}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar la URL');
        }
        
        const data = await response.json();
        
        // Mostrar mensaje de éxito
        showVideoMessage('✅ URL eliminada correctamente', 'success');
        
        // Recargar estadísticas
        await loadStats();
        
    } catch (error) {
        console.error('Error al eliminar URL:', error);
        showVideoMessage('❌ Error al eliminar la URL. Intenta de nuevo.', 'error');
    }
}

// Función para copiar URL corta
function copyShortUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        // Mostrar feedback visual
        const button = event.target.closest('.action-btn');
        const originalText = button.innerHTML;
        button.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
            </svg>
            ¡Copiado!
        `;
        button.style.background = 'var(--success-green)';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert('Error al copiar la URL');
    });
}

// Event listeners para estadísticas
if (statsLink) {
    statsLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadStats();
        
        // Actualizar estado activo del menú
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        statsLink.classList.add('active');
    });
}

if (closeStatsBtn) {
    closeStatsBtn.addEventListener('click', () => {
        statsSection.style.display = 'none';
        
        // Remover estado activo del menú
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector('.nav-link[href="#"]:first-of-type').classList.add('active');
    });
}

// ==================== FUNCIONALIDAD DE LIMPIAR TODO ====================

// Elementos del DOM para el modal
const clearAllBtn = document.getElementById('clearAllBtn');
const clearModal = document.getElementById('clearModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelClearBtn = document.getElementById('cancelClearBtn');
const confirmClearBtn = document.getElementById('confirmClearBtn');

// Función para mostrar el modal
function showClearModal() {
    if (clearModal) {
        clearModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    }
}

// Función para ocultar el modal
function hideClearModal() {
    if (clearModal) {
        clearModal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll del body
    }
}

// Función para limpiar todas las URLs
async function clearAllUrls() {
    try {
        // Mostrar loading en el botón
        if (confirmClearBtn) {
            const originalText = confirmClearBtn.innerHTML;
            confirmClearBtn.innerHTML = 'Eliminando...';
            confirmClearBtn.disabled = true;
        }
        
        // Hacer petición DELETE a la API
        const response = await fetch(`${API_URL}/api/clear-all`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar las URLs');
        }
        
        const data = await response.json();
        
        // Ocultar modal
        hideClearModal();
        
        // Mostrar mensaje de éxito
        showVideoMessage('✅ Todas las URLs han sido eliminadas correctamente', 'success');
        
        // Recargar estadísticas (ahora debería estar vacío)
        await loadStats();
        
    } catch (error) {
        console.error('Error al limpiar URLs:', error);
        showVideoMessage('❌ Error al eliminar las URLs. Intenta de nuevo.', 'error');
        
        // Restaurar botón
        if (confirmClearBtn) {
            confirmClearBtn.innerHTML = 'Sí, Eliminar Todo';
            confirmClearBtn.disabled = false;
        }
    }
}

// Event listeners para el modal
if (clearAllBtn) {
    clearAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showClearModal();
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideClearModal);
}

if (cancelClearBtn) {
    cancelClearBtn.addEventListener('click', hideClearModal);
}

if (confirmClearBtn) {
    confirmClearBtn.addEventListener('click', clearAllUrls);
}

// Cerrar modal al hacer clic fuera de él
if (clearModal) {
    clearModal.addEventListener('click', (e) => {
        if (e.target === clearModal) {
            hideClearModal();
        }
    });
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && clearModal && clearModal.style.display === 'flex') {
        hideClearModal();
    }
});

// ==================== FUNCIONALIDAD DE LOGOUT ====================

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                window.location.href = '/login.html';
            } else {
                alert('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Redirigir de todas formas
            window.location.href = '/login.html';
        }
    });
}

// ==================== FUNCIONALIDAD DE FILTROS ====================

// Event listeners para los filtros de fecha
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remover clase active de todos los botones
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            btn.classList.add('active');
            
            // Aplicar filtro
            const filter = btn.dataset.filter;
            filterStatsByDate(filter);
        });
    });
});
