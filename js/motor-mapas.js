/**
 * NEGOSISTEMA (2026) - Motor de Mapas e Inteligencia Geográfica Hiperlocal
 * PARTE 1 DE 3: Inicialización de Entorno, Variables Globales y Capa Base
 */

// --- CONFIGURACIÓN MAESTRA DEL PROYECTO ---
const CONFIG_NEGOSISTEMA = {
    // Reemplaza esta URL por tu enlace CSV público de la pestaña "salida mapa"
    urlCsvPublico: "https://google.com",
    rutaGeoJson: "./data/iztapalapa-colonias.geojson",
    coordenadasIztapalapa: [19.3455, -99.0130],
    zoomInicialIndex: 14,
    zoomInicialSeccion: 16
};

// Variables globales del sistema de mapeo
let mapaNegosistema = null;
let capaMarcadoresGroup = null;
let datosComerciosGlobales = [];
let poligonosColoniasGeoJson = null;

// Ejecución inicial cuando el documento HTML está completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    inicializarArquitecturaMapa();
});

/**
 * 1. Inicializa Leaflet detectando el tipo de contenedor de la página actual
 */
function inicializarArquitecturaMapa() {
    const contenedorIndex = document.getElementById("mapa_general");
    const contenedorSeccion = document.getElementById("mapa_seccion");
    
    let tipoMapa = "";
    let idContenedor = "";
    let zoom = CONFIG_NEGOSISTEMA.zoomInicialIndex;

    if (contenedorIndex) {
        idContenedor = "mapa_general";
        tipoMapa = "GENERAL";
    } else if (contenedorSeccion) {
        idContenedor = "mapa_seccion";
        tipoMapa = "SECCION";
        zoom = CONFIG_NEGOSISTEMA.zoomInicialSeccion;
    } else {
        console.error("Negosistema: No se detectó ningún contenedor de mapa válido en el HTML.");
        return;
    }

    // Inicializar mapa nativo sin controles estorbosos para móviles
    mapaNegosistema = L.map(idContenedor, {
        zoomControl: false,
        dragging: true,
        tap: true
    }).setView(CONFIG_NEGOSISTEMA.coordenadasIztapalapa, zoom);

    // Cargar capa base limpia (CartoDB Positron - Excelente contraste para pines metalizados)
    L.tileLayer('https://{s}://{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
    }).addTo(mapaNegosistema);

    // Inyectar control de zoom en esquina superior derecha de forma discreta
    L.control.zoom({ position: 'topright' }).addTo(mapaNegosistema);

    // Inicializar grupo de marcadores para permitir filtrados rápidos en tiempo real
    capaMarcadoresGroup = L.layerGroup().addTo(mapaNegosistema);

    // Arrancar la carga encadenada de archivos de datos
    cargarDatosGeograficosYComerciales(tipoMapa);
}

/**
 * 2. Carga el GeoJSON de polígonos y posteriormente el CSV de los comercios
 */
function cargarDatosGeograficosYComerciales(tipoMapa) {
    fetch(CONFIG_NEGOSISTEMA.rutaGeoJson)
        .then(response => response.json())
        .then(geoJsonData => {
            poligonosColoniasGeoJson = L.geoJSON(geoJsonData, {
                style: {
                    color: "#34495e",
                    weight: 2,
                    opacity: 0.6,
                    fillColor: "#34495e",
                    fillOpacity: 0.05
                },
                onEachFeature: (feature, layer) => {
                    if (tipoMapa === "GENERAL" && feature.properties && feature.properties.Enlace) {
                        layer.on('click', () => {
                            window.location.href = feature.properties.Enlace;
                        });
                        layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.2, weight: 3 }));
                        layer.on('mouseout', () => layer.setStyle({ fillOpacity: 0.05, weight: 2 }));
                    }
                }
            }).addTo(mapaNegosistema);

            return fetch(CONFIG_NEGOSISTEMA.urlCsvPublico);
        })
        .then(response => response.text())
        .then(csvTexto => {
            procesarBaseDatosCsv(csvTexto, tipoMapa);
        })
        .catch(error => console.error("Error en el flujo de datos del Negosistema:", error));
}
/**
 * NEGOSISTEMA (2026) - Motor de Mapas e Inteligencia Geográfica Hiperlocal
 * PARTE 2 DE 3: Procesamiento Extensivo del CSV y Lógica de Doble Presencia
 */

/**
 * 3. Parsea el CSV e implementa la Doble Presencia y Geofencing en memoria
 */
function procesarBaseDatosCsv(csvTexto, tipoMapa) {
    const lineas = csvTexto.split("\n");
    if (lineas.length < 2) return;

    datosComerciosGlobales = [];

    for (let i = 1; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        if (!linea) continue;

        // Expresión regular robusta para dividir por comas respetando comillas
        const columnas = linea.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || linea.split(",");
        const cleanCols = columnas.map(c => c.replace(/^"|"$/g, '').trim());

        // Asegurar que la fila contiene al menos los datos mínimos de mapeo
        if (cleanCols.length < 15) continue;

        // Mapeo milimétrico de las 19 columnas públicas del Google Sheet
        const comercio = {
            id: cleanCols[0],
            marcaTemporal: cleanCols[1],
            coloniaOriginal: cleanCols[2],
            mapaObjetivo: cleanCols[3] ? cleanCols[3].toLowerCase() : "",
            capaProductos: cleanCols[4],
            capaServicios: cleanCols[5],
            nivelServicio: parseInt(cleanCols[6]) || 1,
            nombre: cleanCols[7],
            slogan: cleanCols[8],
            productosServicios: cleanCols[9],
            horarios: cleanCols[10],
            redes: cleanCols[11],
            enlaceVideo: cleanCols[12],
            whatsappNumero: cleanCols[13],
            coordenadasRaw: cleanCols[14], // Columna O: Latitud-Longitud
            clickGenerico: cleanCols[15],
            personalizadoFrase: cleanCols[16],
            clickPersonalizado: cleanCols[17],
            linksWebPropia: cleanCols[18]
        };

        if (!comercio.coordenadasRaw || !comercio.coordenadasRaw.includes("-")) continue;

        const partesCoords = comercio.coordenadasRaw.split("-");
        comercio.latitud = parseFloat(partesCoords[0]);
        comercio.longitud = parseFloat(partesCoords[1]);

        if (isNaN(comercio.latitud) || isNaN(comercio.longitud)) continue;

        // --- SISTEMA DE DOBLE PRESENCIA (EXCLUSIVO NIVEL 4 Y 5) ---
        const categoriasProductos = comercio.capaProductos ? comercio.capaProductos.split(",") : [];
        const categoriasServicios = comercio.capaServicios ? comercio.capaServicios.split(",") : [];
        const todasLasCapasAsignadas = [...categoriasProductos, ...categoriasServicios];

        if (todasLasCapasAsignadas.length > 1 && (comercio.nivelServicio === 4 || comercio.nivelServicio === 5)) {
            todasLasCapasAsignadas.forEach(capa => {
                const copiaComercio = { ...comercio, capaActivaMapeo: capa.trim().toLowerCase() };
                datosComerciosGlobales.push(copiaComercio);
            });
        } else {
            // Asignación de categoría única por defecto si no es multi-capa o es nivel bajo
            let capaDefecto = (comercio.mapaObjetivo === "productos" ? comercio.capaProductos : comercio.capaServicios);
            comercio.capaActivaMapeo = capaDefecto ? capaDefecto.toString().trim().toLowerCase() : "";
            datosComerciosGlobales.push(comercio);
        }
    }

    if (tipoMapa === "GENERAL") {
        renderizarPinesEnPantalla("todos", "todos");
    } else {
        ejecutarFiltroAutomaticoPaginaInterna();
    }
}
/**
 * NEGOSISTEMA (2026) - Motor de Mapas e Inteligencia Geográfica Hiperlocal
 * PARTE 3 DE 3: Renderizado de Marcadores, Muro de Privacidad y Filtros Interactivos
 */

/**
 * 4. Filtra y dibuja los marcadores en tiempo real aplicando las reglas de visualización por nivel
 */
function renderizarPinesEnPantalla(filtroColonia, filtroMapa, filtroCapa = "todos") {
    capaMarcadoresGroup.clearLayers();
    const boundsParaAjuste = [];

    datosComerciosGlobales.forEach(comercio => {
        if (filtroColonia !== "todos" && !comercio.coloniaOriginal.toLowerCase().includes(filtroColonia.toLowerCase())) return;
        if (filtroMapa !== "todos" && comercio.mapaObjetivo !== filtroMapa.toLowerCase()) return;
        if (filtroCapa !== "todos" && comercio.capaActivaMapeo !== filtroCapa.toLowerCase()) return;

        // --- INYECCIÓN VISUAL DE PIN METALIZADO (CSS MATCHING) ---
        let claseNivelCss = `pin-nivel${comercio.nivelServicio}`;
        let colorFondoGiro = obtenerColorHexagonalPorCapa(comercio.capaActivaMapeo);
        
        // El Nivel 1 anula visualmente el color de giro para volverse Gris de Presencia
        let estiloInline = (comercio.nivelServicio === 1) ? '' : `background-color: ${colorFondoGiro};`;

        const iconoPersonalizadoHtml = L.divIcon({
            className: `pin-negosistema ${claseNivelCss}`,
            html: `<div style="${estiloInline} width:14px; height:14px; border-radius:50%;"></div>`,
            iconSize:,
            iconAnchor: [12, 12]
        });

        // --- CONSTRUCCIÓN DEL MURO DE PRIVACIDAD EN POPUPS ---
        let popupContenidoHtml = `<div class="tarjeta-popup">`;

        // Nivel 1 muestra título genérico, Nivel 2 en adelante muestra su nombre real
        popupContenidoHtml += `<h3>${comercio.nivelServicio >= 2 ? comercio.nombre : 'Comercio Registrado'}</h3>`;
        popupContenidoHtml += `<p style="font-size:11px; margin: 0 0 6px 0; color:#95a5a6;">ID Ref: ${comercio.id}</p>`;

        // Sumar Slogan, Lista de productos y Horarios a partir del Nivel 3
        if (comercio.nivelServicio >= 3) {
            if (comercio.slogan) popupContenidoHtml += `<div class="slogan">"${comercio.slogan}"</div>`;
            if (comercio.productosServicios) popupContenidoHtml += `<div class="productos"><strong>Ofrece:</strong> ${comercio.productosServicios}</div>`;
            
            if (comercio.horarios) {
                // Estado en verde fijo "Abierto Ahora" por estrategia hiperlocal para incentivar clics
                popupContenidoHtml += `<div class="semaforo-horario horario-abierto">Abierto Ahora: ${comercio.horarios}</div>`;
            }
        }

        // Sumar Canales de Contacto Directo de WhatsApp y Redes en Nivel 4 y 5
        if (comercio.nivelServicio >= 4) {
            const urlWhatsAppActiva = comercio.clickPersonalizado || comercio.clickGenerico;
            
            if (urlWhatsAppActiva) {
                popupContenidoHtml += `<a href="${urlWhatsAppActiva}" target="_blank" class="btn-whatsapp-comercial">
                    💬 Contactar por WhatsApp
                </a>`;
            }

            if (comercio.redes) {
                popupContenidoHtml += `<p style="margin: 8px 0 4px 0; font-size:12px; text-align:center;">
                    🔗 <a href="${comercio.redes}" target="_blank" style="color:#2980b9; font-weight:600;">Ver Redes Sociales</a>
                </p>`;
            }
        }

        // Sumar Contenedor Multimedia de Video (YouTube/TikTok) y Web Propia para Nivel 5
        if (comercio.nivelServicio === 5) {
            if (comercio.enlaceVideo) {
                const idVideoLimpio = extraerIdVideoPlataformas(comercio.enlaceVideo);
                if (idVideoLimpio) {
                    popupContenidoHtml += `
                    <div class="contenedor-video" style="margin-top:8px;">
                        <iframe src="https://youtube.com{idVideoLimpio}" allowfullscreen></iframe>
                    </div>`;
                }
            }
            
            if (comercio.linksWebPropia) {
                popupContenidoHtml += `<a href="${comercio.linksWebPropia}" target="_blank" class="btn-web-comercial">
                    🌐 Visitar Página Web Oficial
                </a>`;
            }
        }

        // Bloque informativo de Up-sell para motivar contratación en niveles bajos (1, 2 y 3)
        if (comercio.nivelServicio <= 3) {
            popupContenidoHtml += `
            <div class="bloque-bloqueado-upsell" style="margin-top:6px;">
                🔒 Canales de contacto directo exclusivos para cuentas Premium
            </div>`;
        }

        popupContenidoHtml += `</div>`;

        const marcadorFinal = L.marker([comercio.latitud, comercio.longitud], { icon: iconoPersonalizadoHtml })
            .bindPopup(popupContenidoHtml, { maxWidth: 290 });

        capaMarcadoresGroup.addLayer(marcadorFinal);
        boundsParaAjuste.push([comercio.latitud, comercio.longitud]);
    });

    if (boundsParaAjuste.length > 0 && filtroColonia !== "todos") {
        mapaNegosistema.fitBounds(boundsParaAjuste, { padding:, maxZoom: 16 });
    }
}

/**
 * 5. Taxonomía de colores comerciales oficiales por tipo de Capa
 */
/**
 * 5. TAXONOMÍA INTEGRAL DE COLORES (MAPA A: PRODUCTOS & MAPA B: SERVICIOS)
 * Procesa las 16 capas unificadas del Negosistema (2026) para Iztapalapa.
 */
function obtenerColorHexagonalPorCapa(nombreCapa) {
    if (!nombreCapa) return "#7f8c8d"; // Gris por defecto si la celda está vacía
    
    // Limpiar el texto para evitar errores por espacios, mayúsculas o acentos
    const capaClean = nombreCapa.trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // ==========================================
    // 🍎 MAPA A: XALPA COMPRA (PRODUCTOS)
    // ==========================================

    // 1. Canasta Básica -> Verde (#27ae60)
    if (capaClean.includes("basica") || capaClean.includes("abarrotes") || 
        capaClean.includes("carnic") || capaClean.includes("recaud") || 
        capaClean.includes("tortill") || capaClean.includes("cremer") || 
        capaClean.includes("poller") || capaClean.includes("purificadora")) {
        return "#27ae60"; 
    }
    
    // 2. Comida Preparada -> Naranja (#e67e22)
    if (capaClean.includes("preparada") || capaClean.includes("taco") || 
        capaClean.includes("pizz") || capaClean.includes("rostic") || 
        capaClean.includes("panader") || capaClean.includes("hamburguesa") || 
        capaClean.includes("alitas") || capaClean.includes("pastel") || 
        capaClean.includes("helado") || capaClean.includes("cafe")) {
        return "#e67e22"; 
    }
    
    // 3. Ferretería y Hogar -> Amarillo (#f1c40f)
    if (capaClean.includes("ferreter") || capaClean.includes("tlapaler") || 
        capaClean.includes("construc") || capaClean.includes("electrico") || 
        capaClean.includes("pintura") || capaClean.includes("jarcer") || 
        capaClean.includes("muebl") || capaClean.includes("gas") || 
        capaClean.includes("carbon")) {
        return "#f1c40f"; 
    }
    
    // 4. Salud y Farmacia (Venta de Productos) -> Rojo (#e74c3c)
    if (capaClean.includes("farmacia") || capaClean.includes("optic") || 
        capaClean.includes("dentista") || capaClean.includes("laboratorio")) {
        return "#e74c3c"; 
    }
    
    // 5. Variedades y Moda -> Rosa (#e84393)
    if (capaClean.includes("variedades") || capaClean.includes("moda") || 
        capaClean.includes("papeler") || capaClean.includes("zapater") || 
        capaClean.includes("boutique") || capaClean.includes("mercer") || 
        capaClean.includes("juguet") || capaClean.includes("joyer") || 
        capaClean.includes("regalo") || capaClean.includes("cosmetic") || 
        capaClean.includes("ropa")) {
        return "#e84393"; 
    }
    
    // 6. Mascotas -> Café (#6f3e1a)
    if (capaClean.includes("mascota") || capaClean.includes("perro") || 
        capaClean.includes("gato") || capaClean.includes("acuario") || 
        capaClean.includes("canina")) {
        return "#6f3e1a"; 
    }
    
    // 7. Tecnología -> Azul Eléctrico (#0984e3)
    if (capaClean.includes("tecnolog") || capaClean.includes("celular") || 
        capaClean.includes("computa") || capaClean.includes("videojuego") || 
        capaClean.includes("camara") || capaClean.includes("electron") || 
        capaClean.includes("alarma")) {
        return "#0984e3"; 
    }

    // ==========================================
    // 🛠️ MAPA B: XALPA RESUELVE (SERVICIOS)
    // ==========================================

    // 1. Salud y Consultas -> Azul Claro / Celeste (#22a6b3)
    if (capaClean.includes("consulta") || capaClean.includes("medico") || 
        capaClean.includes("psicolog") || capaClean.includes("veterinar") || 
        capaClean.includes("terapia") || capaClean.includes("nutriolog") || 
        capaClean.includes("enfermer")) {
        return "#22a6b3"; 
    }

    // 2. Talleres y Oficios -> Azul Marino / Oscuro (#2c3e50)
    if (capaClean.includes("taller") || capaClean.includes("oficio") || 
        capaClean.includes("mecanic") || capaClean.includes("llantera") || 
        capaClean.includes("plomero") || capaClean.includes("herrero") || 
        capaClean.includes("carpinter") || capaClean.includes("albañil") || 
        capaClean.includes("tapicer") || capaClean.includes("electrodomesticos")) {
        return "#2c3e50"; 
    }

    // 3. Bienestar y Estilo -> Morado (#9b59b6)
    if (capaClean.includes("bienestar") || capaClean.includes("estilo") || 
        capaClean.includes("barber") || capaClean.includes("estetica") || 
        capaClean.includes("uñas") || capaClean.includes("gimnasio") || 
        capaClean.includes("yoga") || capaClean.includes("spa") || 
        capaClean.includes("tatuaje") || capaClean.includes("podolog")) {
        return "#9b59b6"; 
    }

    // 4. Asesoría y Oficina -> Gris Oscuro / Oxford (#34495e)
    if (capaClean.includes("asesoria") || capaClean.includes("oficina") || 
        capaClean.includes("seguro") || capaClean.includes("financier") || 
        capaClean.includes("contador") || capaClean.includes("abogado") || 
        capaClean.includes("ciber") || capaClean.includes("mensajeria") || 
        capaClean.includes("inmobiliari") || capaClean.includes("arquitecto")) {
        return "#34495e"; 
    }

    // 5. Hogar y Eventos -> Vino / Guinda (#74001a)
    if (capaClean.includes("evento") || capaClean.includes("fiesta") || 
        `l${capaClean}`.includes("lavander") || capaClean.includes("tintorer") || 
        capaClean.includes("cerrajer") || capaClean.includes("sastreria") || 
        capaClean.includes("flete") || capaClean.includes("cisterna") || 
        capaClean.includes("banquete") || capaClean.includes("plagas")) {
        return "#74001a"; 
    }

    // 6. Educación y Apoyo -> Blanco / Hueso (#f5f6fa)
    if (capaClean.includes("educacion") || capaClean.includes("apoyo") || 
        capaClean.includes("tarea") || capaClean.includes("clase") || 
        capaClean.includes("escuela") || capaClean.includes("colegio") || 
        capaClean.includes("guarderia") || capaClean.includes("idioma") || 
        capaClean.includes("manejo") || capaClean.includes("adulto")) {
        return "#f5f6fa"; 
    }

    // 7. Urgencias 24/7 -> Negro Absoluto (#111111) [1]
    if (capaClean.includes("urgencia") || capaClean.includes("nocturna") || 
        capaClean.includes("grua") || capaClean.includes("fuga") || 
        capaClean.includes("ambulancia") || capaClean.includes("emergencia")) {
        return "#111111"; 
    }

    // ==========================================
    // 🌐 CATEGORÍA DE CONTROL GENERAL
    // ==========================================

    // 8. Directorio Base / Limbo (Negocios en verificación o Nivel 1) -> Gris Control (#7f8c8d)
    if (capaClean.includes("directorio") || capaClean.includes("base") || 
        capaClean.includes("verificacion") || capaClean.includes("limbo") || 
        capaClean.includes("semifijo") || capaClean.includes("gris")) {
        return "#7f8c8d"; 
    }

    // Color de respaldo por si el nombre de la capa no encaja en ninguna regla
    return "#57606f"; 
}


/**
 * 6. Analiza la URL y el entorno de las páginas de las colonias para filtrar dinámicamente
 */
function ejecutarFiltroAutomaticoPaginaInterna() {
    const urlActual = window.location.pathname.toLowerCase();
    let zonaMapeo = "todos";
    let segmentoMapa = "todos";

    if (urlActual.includes("xalpa")) zonaMapeo = "xalpa";
    if (urlActual.includes("ampli1") || urlActual.includes("santiago")) zonaMapeo = "santiago";

    if (urlActual.includes("productos")) segmentoMapa = "productos";
    if (urlActual.includes("servicios")) segmentoMapa = "servicios";

    renderizarPinesEnPantalla(zonaMapeo, segmentoMapa, "todos");
}

/**
 * 7. Extrae el identificador puro de un enlace de video de YouTube (Corregido y Validado)
 */
function extraerIdVideoPlataformas(urlVideo) {
    if (!urlVideo) return null;
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = urlVideo.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * INTERFAZ PÚBLICA: Función disparada por los botones de filtros flotantes de tu HTML
 */
function aplicarFiltroCapaBotonera(nombreCapa) {
    const contenedorIndex = document.getElementById("mapa_general");
    let zonaMapeo = "todos";
    let segmentoMapa = "todos";

    if (!contenedorIndex) {
        const urlActual = window.location.pathname.toLowerCase();
        if (urlActual.includes("xalpa")) zonaMapeo = "xalpa";
        if (urlActual.includes("ampli1") || urlActual.includes("santiago")) zonaMapeo = "santiago";
        if (urlActual.includes("productos")) segmentoMapa = "productos";
        if (urlActual.includes("servicios")) segmentoMapa = "servicios";
    }

    renderizarPinesEnPantalla(zonaMapeo, segmentoMapa, nombreCapa);
}
