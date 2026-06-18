// 1. Inicializar el mapa de Leaflet centrado en Iztapalapa
const map = L.map('map').setView([19.345, -99.015], 14);

// 2. Capa base de mapa (Estilo oscuro de CartoDB)
L.tileLayer('https://{s}://{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO'
}).addTo(map);

// 3. CARGAR EL ARCHIVO EXTERNO GEOJSON DESDE SU RUTA
fetch('datos-geo/iztapalapa-colonias.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        // 4. Dibujar polígonos interactivos con estilos dinámicos
        L.geoJSON(geojsonData, {
            style: function(feature) {
                return {
                    fillColor: feature.properties.fill || '#007bff',
                    weight: 2,
                    opacity: 0.8,
                    color: '#11141a', // Borde oscuro
                    fillOpacity: 0.4
                };
            },
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.name) {
                    let popupContent = `
                        <div style="font-family: sans-serif; text-align: center;">
                            <h6 style="margin: 0 0 8px 0; color: #56ccf2; font-weight: bold;">
                                ${feature.properties.name}
                            </h6>
                            <p style="font-size: 11px; color: #bbb; margin-bottom: 12px;">
                                Alcaldía Iztapalapa
                            </p>
                            <a href="${feature.properties.Enlace}" target="_blank" class="btn btn-sm" style="font-size: 12px; font-weight: 600; padding: 4px 10px; background: #0056b3; color: white; border: none; text-decoration: none; border-radius: 4px; display: inline-block;">
                                Ver Productos 🔍
                            </a>
                        </div>
                    `;
                    layer.bindPopup(popupContent);
                    
                    // Efecto Hover
                    layer.on({
                        mouseover: function(e) {
                            e.target.setStyle({ fillOpacity: 0.7, weight: 3 });
                        },
                        mouseout: function(e) {
                            e.target.setStyle({ fillOpacity: 0.4, weight: 2 });
                        }
                    });
                }
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error al cargar el archivo GeoJSON:', error));


// 4. Dibujar polígonos interactivos con estilos dinámicos del JSON
L.geoJSON(geojsonData, {
    style: function(feature) {
        return {
            fillColor: feature.properties.fill || '#007bff',
            weight: 2,
            opacity: 0.8,
            color: '#11141a', // Borde oscuro divisorio
            fillOpacity: 0.4
        };
    },
    onEachFeature: function(feature, layer) {
        if (feature.properties && feature.properties.name) {
            // Estructura visual interna del cuadro de información (Popup)
            let popupContent = `
                <div style="font-family: sans-serif; text-align: center;">
                    <h6 style="margin: 0 0 8px 0; color: #56ccf2; font-weight: bold;">
                        ${feature.properties.name}
                    </h6>
                    <p style="font-size: 11px; color: #bbb; margin-bottom: 12px;">
                        Alcaldía Iztapalapa
                    </p>
                    <a href="${feature.properties.Enlace}" target="_blank" class="btn btn-sm btn-primary" style="font-size: 12px; font-weight: 600; padding: 4px 10px; background: #0056b3; border: none;">
                        Ver Productos 🔍
                    </a>
                </div>
            `;
            layer.bindPopup(popupContent);
            
            // Efecto Hover: Resaltar zona al pasar el mouse por encima
            layer.on({
                mouseover: function(e) {
                    let layer = e.target;
                    layer.setStyle({ fillOpacity: 0.7, weight: 3 });
                },
                mouseout: function(e) {
                    let layer = e.target;
                    layer.setStyle({ fillOpacity: 0.4, weight: 2 });
                }
            });
        }
    }
}).addTo(map);
