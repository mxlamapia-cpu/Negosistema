/**
 * NEGOSISTEMA - MOTOR DE MAPAS CENTRALIZADO V1.0
 * Lógica universal para el control de mapas hiperlocales en Iztapalapa.
 */

document.addEventListener("DOMContentLoaded", function() {
    // 1. Verificación automática del historial de navegación local
    const ultimaColonia = JSON.parse(localStorage.getItem('negosistema_ultima_visita'));
    if (ultimaColonia && ultimaColonia.nombre && ultimaColonia.url) {
        const bloque = document.getElementById('bloque-historial');
        const enlace = document.getElementById('enlace-historial');
        if (bloque && enlace) {
            bloque.style.display = 'block';
            enlace.href = ultimaColonia.url;
            enlace.textContent = `Entrar directo a: ${ultimaColonia.nombre}`;
        }
    }
});

/**
 * Registra de forma segura la navegación del usuario en el navegador
 * @param {string} nombre - Nombre comercial de la colonia o sector
 * @param {string} url - Enlace relativo o absoluto de la pantalla destino
 */
function guardarProgreso(nombre, url) {
    const datos = { nombre: nombre, url: url };
    localStorage.setItem('negosistema_ultima_visita', JSON.stringify(datos));
}

/**
 * Configura la base estándar de Leaflet compartida por todos los mapas
 * @param {string} idContenedor - El ID del elemento DIV en el archivo HTML
 * @param {Array} coordenadasCentro - Arreglo [lat, lon] de inicio
 * @param {number} zoomInicial - Nivel de acercamiento de la cámara
 * @returns {L.Map} Instancia viva del mapa de Leaflet
 */
function crearMapaBase(idContenedor, coordenadasCentro, zoomInicial) {
    const mapaInstancia = L.map(idContenedor, {
        center: coordenadasCentro,
        zoom: zoomInicial,
        scrollWheelZoom: false
    });

    // Carga de la capa base en gris claro (CartoDB Positron) para resaltar los negocios
    L.tileLayer('https://{s}://{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(mapaInstancia);

    return mapaInstancia;
}
/**
 * Carga y dibuja las áreas vectoriales de las colonias en la página principal
 * @param {string} idContenedor - ID del DIV (ej. 'mapa-local')
 * @param {string} rutaGeoJSON - Ubicación del archivo de polígonos
 */
function inicializarMapaZonasGlobales(idContenedor, rutaGeoJSON) {
    // Centro geográfico aproximado de la zona piloto en Iztapalapa
    const mapaGlobal = crearMapaBase(idContenedor, [19.3450, -99.0150], 14);

    fetch(rutaGeoJSON)
    .then(response => {
        if (!response.ok) throw new Error('Archivo GeoJSON global no disponible');
        return response.json();
    })
    .then(data => {
        const capaZonas = L.geoJSON(data, {
            style: function (feature) {
                let colorPoligono = feature.properties.fill || '#1a73e8';
                let opacidad = feature.properties['fill-opacity'] || 0.3;
                return {
                    color: colorPoligono,
                    weight: 1.5,
                    fillColor: colorPoligono,
                    fillOpacity: opacidad
                };
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.name) {
                    let p = feature.properties;
                    let urlDestino = p.Enlace || '#';
                    
                    let popupContenido = `<div style="padding: 5px; min-width: 200px; font-family: sans-serif; text-align: left; line-height: 1.4;">`;
                    popupContenido += `<strong style="font-size: 14px; color: #1a73e8; display: block; margin-bottom: 4px;">${p.name}</strong>`;
                    popupContenido += `<span style="font-size: 12px; color: #666; display: block; margin-bottom: 10px;">Directorio verificado 24/7.</span>`;
                    popupContenido += `<a href="${urlDestino}" style="display: block; text-align: center; background: #34a853; color: white !important; padding: 8px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onclick="guardarProgreso('${p.name}', '${urlDestino}')">Ver Marketplace Local →</a>`;
                    popupContenido += `</div>`;
                    
                    layer.bindPopup(popupContenido);

                    layer.on({
                        mouseover: function (e) { e.target.setStyle({ fillOpacity: 0.5, weight: 2.5 }); },
                        mouseout: function (e) { capaZonas.resetStyle(e.target); }
                    });
                }
            }
        }).addTo(mapaGlobal);
        
        mapaGlobal.fitBounds(capaZonas.getBounds());
    })
    .catch(error => console.error('Error al mapear las colonias vectoriales:', error));
}

/**
 * Carga y dibuja los puntos comerciales (tiendas/servicios) en los mapas internos
 * @param {string} idContenedor - ID del DIV (ej. 'mapa-productos')
 * @param {string} rutaGeoJSON - Ubicación del archivo de tiendas de la colonia
 * @param {Array} coordenadasCentro - Coordenadas específicas de la colonia [lat, lon]
 */
function inicializarMapaMercadoLocal(idContenedor, rutaGeoJSON, coordenadasCentro) {
    const mapaInterno = crearMapaBase(idContenedor, coordenadasCentro, 16);

    fetch(rutaGeoJSON)
    .then(response => {
        if (!response.ok) throw new Error('Catálogo de comercios local ausente');
        return response.json();
    })
    .then(data => {
        const capaPuntos = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                // Segmentación automática por los colores de la guía del marketplace
                let colorGiro = feature.properties['marker-color'] || '#2e7d32';
                
                let marcadorEstilizado = L.divIcon({
                    className: 'marcador-comercio-giro',
                    html: `<div style="background-color: ${colorGiro}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
                    iconSize:,
                    iconAnchor:
                });
                return L.marker(latlng, { icon: marcadorEstilizado });
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    let props = feature.properties;
                    let popupHtml = `<div style="font-family: sans-serif; min-width: 190px; line-height: 1.4;">`;
                    popupHtml += `<strong style="font-size: 14px; color: #0a2540; display: block; margin-bottom: 2px;">${props.name || 'Negocio Local'}</strong>`;
                    popupHtml += `<span style="font-size: 11px; color: #795548; font-weight: bold; display: block; margin-bottom: 8px;">🛍️ ${props.giro || 'Giro Comercial'}</span>`;
                    
                    if(props.description) {
                        popupHtml += `<p style="font-size: 12px; color: #555; margin: 0 0 10px 0;">${props.description}</p>`;
                    }
                    
                    // Canal de monetización directo por visibilidad premium
                    if(props.telefono) {
                        popupHtml += `<a href="https://wa.me{props.telefono}?text=Hola,%20vi%20tu%20negocio%20en%20Negosistema" target="_blank" style="display: block; text-align: center; background: #25d366; color: white !important; padding: 6px 10px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px;">💬 Pedir por WhatsApp</a>`;
                    }
                    
                    popupHtml += `</div>`;
                    layer.bindPopup(popupHtml);
                }
            }
        }).addTo(mapaInterno);

        mapaInterno.fitBounds(capaPuntos.getBounds());
    })
    .catch(error => console.warn('Mapa a la espera de archivo de comercios GeoJSON:', error));
}
