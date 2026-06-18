// 1. Inicializar el mapa centrado en Iztapalapa
// Agregamos un condicional para asegurarnos de que el contenedor 'map' exista en el HTML antes de renderizar
const mapContainer = document.getElementById('map');

if (mapContainer) {
    const map = L.map('map').setView([19.345, -99.015], 14);

    // 2. Capa base oscura (CartoDB) - Ideal para el diseño azul de Negosistema
    L.tileLayer('https://{s}://{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19
    }).addTo(map);

    // 3. Cargar el GeoJSON de forma segura para GitHub Pages
    // Usamos './' al inicio para garantizar que busque en la raíz relativa del repositorio
    fetch('./datos-geo/iztapalapa-colonias.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - No se pudo encontrar el archivo GeoJSON`);
            }
            return response.json();
        })
        .then(geojsonData => {
            // 4. Dibujar los polígonos con interactividad
            L.geoJSON(geojsonData, {
                style: function(feature) {
                    return {
                        fillColor: feature.properties.fill || '#ffd600',
                        weight: 2,
                        opacity: 0.8,
                        color: '#1a1f29', // Línea divisoria que combina con el fondo del panel
                        fillOpacity: 0.35
                    };
                },
                onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.name) {
                        // Diseñamos un popup integrado al estilo del sistema
                        let popupContent = `
                            <div style="font-family: 'Segoe UI', sans-serif; text-align: center; padding: 5px;">
                                <h6 style="margin: 0 0 5px 0; color: #56ccf2; font-weight: bold; font-size: 14px;">
                                    ${feature.properties.name}
                                </h6>
                                <p style="font-size: 11px; color: #bbb; margin-bottom: 10px;">
                                    Alcaldía Iztapalapa
                                </p>
                                <a href="${feature.properties.Enlace}" target="_blank" 
                                   style="display: inline-block; font-size: 11px; font-weight: 600; padding: 5px 12px; background: #0056b3; color: white; border: none; text-decoration: none; border-radius: 4px; transition: background 0.2s;">
                                    Ver Catálogo de Productos 🔍
                                </a>
                            </div>
                        `;
                        layer.bindPopup(popupContent);
                        
                        // Efectos visuales interactivos al pasar el cursor
                        layer.on({
                            mouseover: function(e) {
                                e.target.setStyle({ fillOpacity: 0.65, weight: 3 });
                            },
                            mouseout: function(e) {
                                e.target.setStyle({ fillOpacity: 0.35, weight: 2 });
                            }
                        });
                    }
                }
            }).addTo(map);

            // Ajustar automáticamente el zoom para que encuadre perfectamente tus colonias al cargar
            // Esto previene que el mapa aparezca desfasado si las coordenadas iniciales varían
            const bounds = L.geoJSON(geojsonData).getBounds();
            map.fitBounds(bounds);
        })
        .catch(error => {
            console.error('Fallo crítico en la carga del mapa:', error);
            // Mensaje visual de contingencia dentro del recuadro blanco si falla la lectura del archivo
            mapContainer.innerHTML = `
                <div class="d-flex flex-column align-items-center justify-content-center h-100 text-danger p-3">
                    <h5>⚠️ Error al cargar mapa</h5>
                    <p class="small text-muted text-center">Verifica que el archivo exista en datos-geo/iztapalapa-colonias.geojson</p>
                </div>`;
        });
}
