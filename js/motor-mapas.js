/**
 * NEGOSISTEMA (2026) - Motor de Mapas e Inteligencia Geográfica Hiperlocal
 * PARTE 1 DE 3: Configuración Blindada y Arranque Automático de Contenedores
 */

// --- CONFIGURACIÓN MAESTRA DEL PROYECTO ---
const CONFIG_NEGOSISTEMA = {
    // ⚠️ REEMPLAZA ESTA URL POR TU ENLACE CSV REAL DE LA PESTAÑA "SALIDA MAPA" CUANDO ESTÉ LISTO
    urlCsvPublico: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3RF8wgXtMbBld_N_VP0IFi0NwvE7p3cKcmqlMtSJyE0bQDC6jSSnjtotVvXYGPYxUwIRpApFiQJPv/pub?gid=70807169&single=true&output=csv", 
    rutaGeoJson: "https://github.io",
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

    // Cargar capa base limpia (CartoDB Positron)
    L.tileLayer('https://{s}://{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
    }).addTo(mapaNegosistema);

    L.control.zoom({ position: 'topright' }).addTo(mapaNegosistema);
    capaMarcadoresGroup = L.layerGroup().addTo(mapaNegosistema);

    // Arrancar la carga encadenada de archivos de datos
    cargarDatosGeograficosYComerciales(tipoMapa);
}
/**
 * NEGOSISTEMA (2026) - Motor de Mapas e Inteligencia Geográfica Hiperlocal
 * PARTE 2 DE 3: Compuerta de Simulación para Anúnciate y Procesador CSV Estándar
 */

/**
 * 2. Carga el GeoJSON de polígonos y gestiona la llamada al CSV con Failsafe integrado
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
        .then(response => {
            if (!response.ok) throw new Error("Base de datos en Sheets no disponible momentáneamente.");
            return response.text();
        })
        .then(csvTexto => {
            procesarBaseDatosCsv(csvTexto, tipoMapa);
        })
        .catch(error => {
            console.warn("Negosistema Failsafe: Activando modo de contingencia por ausencia de datos en Sheets.", error);
            // Si el Google Sheets está vacío o en mantenimiento, el index no se quedará en blanco
            const csvSincronizacionFailsafe = "ID,Marca,Colonia,Mapa,CapaProd,CapaServ,Nivel,Nombre,Slogan,Ofrece,Horario,Redes,Video,WhatsApp,Coordenadas\n000-FAIL,2026,XALPA II,productos,canasta,,1,Negosistema Inicializado,Modo de espera activo,,,Sugerido,7am-10pm,,,19.3455-99.0130";
            procesarBaseDatosCsv(csvSincronizacionFailsafe, tipoMapa);
        });
}

/**
 * 3. Parsea el CSV, controla la Doble Presencia e inyecta la simulación de tus 26 negocios en 'Anúnciate'
 */
function procesarBaseDatosCsv(csvTexto, tipoMapa) {
    const urlActual = window.location.pathname.toLowerCase();
    datosComerciosGlobales = [];

    // --- 🚀 COMPUERTA AUTOMÁTICA MODO ANÚNCIATE (CATÁLOGO VIVO) ---
    if (urlActual.includes("anunciate")) {
        console.log("Negosistema: Desplegando simulación estratégica de 26 negocios de muestra.");
        
        // Base de datos integrada de simulación comercial
        const simulacion26NegociosDemo = [
            // NEGOCIO PRINCIPAL - MÁXIMO NIVEL DE SERVICIO (ORO/DIAMANTE PREMIUM)
            { id: "306-PREMIUM", coloniaOriginal: "XALPA II", mapaObjetivo: "productos", capaActivaMapeo: "tecnologia", nivelServicio: 5, nombre: "🔥 NEGOCIO MAESTRO PREMIUM", slogan: "El ejemplo perfecto del Nivel de Servicio Máximo contratado", productosServicios: "Páginas Web, Video Embebido de YouTube/TikTok, Animación Parpadeante en Oro y Contacto Directo Personalizado sin Muros", horarios: "Lunes a Domingo - 24 Horas Activo", clickPersonalizado: "https://wa.me", redes: "https://facebook.com", enlaceVideo: "https://youtube.com", linksWebPropia: "https://github.io", coordenadasRaw: "19.3455-99.0130" },
            
            // MUESTRAS NIVEL 4 (PLATA CON PULSACIÓN & CONTACTO DE WHATSAPP GENÉRICO O PERSONALIZADO)
            { id: "306-N4-01", coloniaOriginal: "XALPA II", mapaObjetivo: "productos", capaActivaMapeo: "comida", nivelServicio: 4, nombre: "Taquería El Pastor Demo", slogan: "Pines de Color con Brillo Pulsante de Plata", productosServicios: "Tacos al pastor, alambre y gringas", horarios: "Mar a Dom 6pm - 1am", clickGenerico: "https://wa.me", coordenadasRaw: "19.3465-99.0115" },
            { id: "308-N4-02", coloniaOriginal: "SANTIAGO I", mapaObjetivo: "servicios", capaActivaMapeo: "taller", nivelServicio: 4, nombre: "Mecánica Automotriz Santiago", slogan: "Tu auto en manos de expertos certificados", productosServicios: "Afinación, frenos y suspensión", horarios: "Lun a Sáb 9am - 7pm", clickPersonalizado: "https://wa.me", coordenadasRaw: "19.3490-99.0060" },
            { id: "306-N4-03", coloniaOriginal: "XALPA II", mapaObjetivo: "productos", capaActivaMapeo: "salud", nivelServicio: 4, nombre: "Farmacia de Descuento Prueba", slogan: "Salud y ahorro directo para tu bolsillo", productosServicios: "Medicamentos de patente y genéricos", horarios: "8am - 10pm", clickGenerico: "https://wa.me", coordenadasRaw: "19.3445-99.0155" },
            
            // MUESTRAS NIVEL 3 (BRONCE CON BRILLO METÁLICO FIJO, SLOGAN, PRODUCTOS Y HORARIOS - CONTACTO BLOQUEADO)
            { id: "306-N3-01", coloniaOriginal: "XALPA II", mapaObjetivo: "productos", capaActivaMapeo: "canasta", nivelServicio: 3, nombre: "Abarrotes La Esquina Ficticio", slogan: "Surtido completo para el hogar", productosServicios: "Lácteos, embutidos, refrescos y pan", horarios: "Lun a Dom 7am - 10pm", coordenadasRaw: "19.3430-99.0145" },
            { id: "309-N3-02", coloniaOriginal: "SANTIAGO II", mapaObjetivo: "servicios", capaActivaMapeo: "bienestar", nivelServicio: 3, nombre: "Estética y Barbería Deluxe", slogan: "Cortes modernos con estilo premium", productosServicios: "Corte de cabello, barba y diseño", horarios: "Mar a Sáb 10am - 8pm", coordenadasRaw: "19.3415-99.0080" },
            { id: "306-N3-03", coloniaOriginal: "XALPA II", mapaObjetivo: "productos", capaActivaMapeo: "ferreteria", nivelServicio: 3, nombre: "Tlapalería El Clavo Demo", slogan: "Todo para tus reparaciones domésticas", productosServicios: "Material eléctrico, plomería y pinturas", horarios: "Lun a Sáb 8am - 6pm", coordenadasRaw: "19.3475-99.0125" }
        ];

        // Rellenar de forma automática los 20 negocios restantes para completar el volumen de 26 muestras distribuidas
        for (let j = 1; j <= 20; j++) {
            let nivelAsignado = (j % 3) + 1; // Distribución controlada entre Nivel 1, Nivel 2 y Nivel 3
            let capaMuestra = j % 2 === 0 ? "canasta" : "comida";
            let latOffset = (Math.sin(j) * 0.004);
            let lonOffset = (Math.cos(j) * 0.004);
            
            simulacion26NegociosDemo.push({
                id: `306-DEMO-N${nivelAsignado}-0${j}`,
                coloniaOriginal: "XALPA II",
                mapaObjetivo: "productos",
                capaActivaMapeo: capaMuestra,
                nivelServicio: nivelAsignado,
                nombre: `Comercio Demo Nivel ${nivelAsignado} (#${j})`,
                slogan: `Demostración visual de posicionamiento en la capa de ${capaMuestra}`,
                productosServicios: "Artículos de muestra y consumos de prueba para el barrio",
                horarios: "Abierto en horario comercial de prueba",
                coordenadasRaw: `${19.3455 + latOffset}-${99.0130 + lonOffset}`
            });
        }

        // Convertir strings de ubicación en coordenadas numéricas para Leaflet
        simulacion26NegociosDemo.forEach(comercio => {
            const partes = comercio.coordenadasRaw.split("-");
            comercio.latitud = parseFloat(partes[0]);
            comercio.longitud = parseFloat(partes[1]);
            datosComerciosGlobales.push(comercio);
        });

        renderizarPinesEnPantalla("todos", "todos");
        return;
    }

    // --- PROCESAMIENTO ESTÁNDAR OPERATIVO DE TU HOJA GENERAL ---
    const lineas = csvTexto.split("\n");
    if (lineas.length < 2) return;

    for (let i = 1; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        if (!linea) continue;

        const columnas = linea.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || linea.split(",");
        const cleanCols = columnas.map(c => c.replace(/^"|"$/g, '').trim());

        if (cleanCols.length < 15) continue;

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
            coordenadasRaw: cleanCols[14],
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

        const categoriasProductos = comercio.capaProductos ? comercio.capaProductos.split(",") : [];
        const categoriasServicios = comercio.capaServicios ? comercio.capaServicios.split(",") : [];
        const todasLasCapasAsignadas = [...categoriasProductos, ...categoriasServicios];

        if (todasLasCapasAsignadas.length > 1 && (comercio.nivelServicio === 4 || comercio.nivelServicio === 5)) {
            todasLasCapasAsignadas.forEach(capa => {
                const copiaComercio = { ...comercio, capaActivaMapeo: capa.trim().toLowerCase() };
        datosComerciosGlobales.push(copiaComercio);
            });
        } else {
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
 * 4. Dibuja los marcadores aplicando el Muro de Privacidad en Popups
 */
function renderizarPinesEnPantalla(filtroColonia, filtroMapa, filtroCapa = "todos") {
    capaMarcadoresGroup.clearLayers();
    const boundsParaAjuste = [];

    datosComerciosGlobales.forEach(comercio => {
        if (filtroColonia !== "todos" && !comercio.coloniaOriginal.toLowerCase().includes(filtroColonia.toLowerCase())) return;
        if (filtroMapa !== "todos" && comercio.mapaObjetivo !== filtroMapa.toLowerCase()) return;
        if (filtroCapa !== "todos" && comercio.capaActivaMapeo !== filtroCapa.toLowerCase()) return;

        let claseNivelCss = `pin-nivel${comercio.nivelServicio}`;
        let colorFondoGiro = obtenerColorHexagonalPorCapa(comercio.capaActivaMapeo);
        let estiloInline = (comercio.nivelServicio === 1) ? '' : `background-color: ${colorFondoGiro};`;

        const iconoPersonalizadoHtml = L.divIcon({
            className: `pin-negosistema ${claseNivelCss}`,
            html: `<div style="${estiloInline} width:14px; height:14px; border-radius:50%;"></div>`,
            iconSize:14,
            iconAnchor: [7, 7]
        });


        let popupContenidoHtml = `<div class="tarjeta-popup">`;
        popupContenidoHtml += `<h3>${comercio.nivelServicio >= 2 ? comercio.nombre : 'Comercio Registrado'}</h3>`;
        popupContenidoHtml += `<p style="font-size:11px; margin: 0 0 6px 0; color:#95a5a6;">ID Ref: ${comercio.id}</p>`;

        if (comercio.nivelServicio >= 3) {
            if (comercio.slogan) popupContenidoHtml += `<div class="slogan">"${comercio.slogan}"</div>`;
            if (comercio.productosServicios) popupContenidoHtml += `<div class="productos"><strong>Ofrece:</strong> ${comercio.productosServicios}</div>`;
            if (comercio.horarios) popupContenidoHtml += `<div class="semaforo-horario horario-abierto">Abierto Ahora: ${comercio.horarios}</div>`;
        }

        if (comercio.nivelServicio >= 4) {
            const urlWhatsAppActiva = comercio.clickPersonalizado || comercio.clickGenerico;
            if (urlWhatsAppActiva) {
                popupContenidoHtml += `<a href="${urlWhatsAppActiva}" target="_blank" class="btn-whatsapp-comercial">💬 Contactar por WhatsApp</a>`;
            }
            if (comercio.redes) {
                popupContenidoHtml += `<p style="margin: 8px 0 4px 0; font-size:12px; text-align:center;">🔗 <a href="${comercio.redes}" target="_blank" style="color:#1a73e8; font-weight:600;">Ver Redes Sociales</a></p>`;
            }
        }

        if (comercio.nivelServicio === 5) {
            if (comercio.enlaceVideo) {
                const idVideoLimpio = extraerIdVideoPlataformas(comercio.enlaceVideo);
                if (idVideoLimpio) {
                    popupContenidoHtml += `<div class="contenedor-video" style="margin-top:8px;"><iframe src="https://youtube.com{idVideoLimpio}" allowfullscreen></iframe></div>`;
                }
            }
            if (comercio.linksWebPropia) {
                popupContenidoHtml += `<a href="${comercio.linksWebPropia}" target="_blank" class="btn-web-comercial">🌐 Visitar Página Web Oficial</a>`;
            }
        }

        if (comercio.nivelServicio <= 3) {
            popupContenidoHtml += `<div class="bloque-bloqueado-upsell" style="margin-top:6px;">🔒 Canales de contacto directo exclusivos para cuentas Premium</div>`;
        }

        popupContenidoHtml += `</div>`;

        const marcadorFinal = L.marker([comercio.latitud, comercio.longitud], { icon: iconoPersonalizadoHtml })
            .bindPopup(popupContenidoHtml, { maxWidth: 290 });

        capaMarcadoresGroup.addLayer(marcadorFinal);
        boundsParaAjuste.push([comercio.latitud, comercio.longitud]);
    });
           // CORRECCIÓN MANUAL INMUNE A ERRORES EN TU ARCHIVO JS
    if (boundsParaAjuste.length > 0 && filtroColonia !== "todos") {
        mapaNegosistema.fitBounds(boundsParaAjuste, { padding: 40, maxZoom: 16 });
    }

}
/**
 * 5. Taxonomía de las 16 Capas Unificadas del Negosistema (Productos y Servicios)
 */
function obtenerColorHexagonalPorCapa(nombreCapa) {
    if (!nombreCapa) return "#7f8c8d";
    const capaClean = nombreCapa.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (capaClean.includes("basica") || capaClean.includes("abarrotes") || capaClean.includes("carnic") || capaClean.includes("recaud") || capaClean.includes("tortill") || capaClean.includes("cremer") || capaClean.includes("poller") || capaClean.includes("purificadora")) return "#27ae60"; 
    if (capaClean.includes("preparada") || capaClean.includes("taco") || capaClean.includes("pizz") || capaClean.includes("rostic") || capaClean.includes("panader") || capaClean.includes("hamburguesa") || capaClean.includes("alitas") || capaClean.includes("pastel") || capaClean.includes("helado") || capaClean.includes("cafe")) return "#e67e22"; 
    if (capaClean.includes("ferreter") || capaClean.includes("tlapaler") || capaClean.includes("construc") || capaClean.includes("electrico") || capaClean.includes("pintura") || capaClean.includes("jarcer") || capaClean.includes("muebl") || capaClean.includes("gas") || capaClean.includes("carbon")) return "#f1c40f"; 
    if (capaClean.includes("farmacia") || capaClean.includes("extraer") || capaClean.includes("dentista") || capaClean.includes("laboratorio")) return "#e74c3c"; 
    if (capaClean.includes("variedades") || capaClean.includes("moda") || capaClean.includes("papeler") || capaClean.includes("zapater") || capaClean.includes("boutique") || capaClean.includes("mercer") || capaClean.includes("juguet") || capaClean.includes("joyer") || capaClean.includes("regalo") || capaClean.includes("cosmetic") || capaClean.includes("ropa")) return "#e84393"; 
    if (capaClean.includes("mascota") || capaClean.includes("perro") || capaClean.includes("gato") || capaClean.includes("acuario") || capaClean.includes("canina")) return "#6f3e1a"; 
    if (capaClean.includes("tecnolog") || capaClean.includes("celular") || capaClean.includes("computa") || capaClean.includes("videojuego") || capaClean.includes("camara") || capaClean.includes("electron") || capaClean.includes("alarma")) return "#0984e3"; 
    if (capaClean.includes("consulta") || capaClean.includes("medico") || capaClean.includes("psicolog") || capaClean.includes("veterinar") || capaClean.includes("terapia") || capaClean.includes("nutriolog") || capaClean.includes("enfermer")) return "#22a6b3"; 
    if (capaClean.includes("taller") || capaClean.includes("oficio") || capaClean.includes("mecanic") || capaClean.includes("llantera") || capaClean.includes("plomero") || capaClean.includes("herrero") || capaClean.includes("carpinter") || capaClean.includes("albañil") || capaClean.includes("tapicer") || capaClean.includes("electrodomesticos")) return "#2c3e50"; 
    if (capaClean.includes("bienestar") || capaClean.includes("estilo") || capaClean.includes("barber") || capaClean.includes("estetica") || capaClean.includes("uñas") || capaClean.includes("gimnasio") || capaClean.includes("yoga") || capaClean.includes("spa") || capaClean.includes("tatuaje") || capaClean.includes("podolog")) return "#9b59b6"; 
    if (capaClean.includes("asesoria") || capaClean.includes("oficina") || capaClean.includes("seguro") || capaClean.includes("financier") || capaClean.includes("contador") || capaClean.includes("abogado") || capaClean.includes("ciber") || capaClean.includes("mensajeria") || capaClean.includes("inmobiliari") || capaClean.includes("arquitecto")) return "#34495e"; 
    if (capaClean.includes("evento") || capaClean.includes("fiesta") || `l${capaClean}`.includes("lavander") || capaClean.includes("tintorer") || capaClean.includes("cerrajer") || capaClean.includes("sastreria") || capaClean.includes("flete") || capaClean.includes("cisterna") || capaClean.includes("banquete") || capaClean.includes("plagas")) return "#74001a"; 
    if (capaClean.includes("educacion") || capaClean.includes("apoyo") || capaClean.includes("tarea") || capaClean.includes("clase") || capaClean.includes("escuela") || capaClean.includes("colegio") || capaClean.includes("guarderia") || capaClean.includes("idioma") || capaClean.includes("manejo") || capaClean.includes("adulto")) return "#f5f6fa"; 
    if (capaClean.includes("urgencia") || capaClean.includes("nocturna") || capaClean.includes("grua") || capaClean.includes("fuga") || capaClean.includes("ambulancia") || capaClean.includes("emergencia")) return "#111111"; 
    if (capaClean.includes("directorio") || capaClean.includes("base") || capaClean.includes("verificacion") || capaClean.includes("limbo") || capaClean.includes("semifijo") || capaClean.includes("gris")) return "#7f8c8d"; 

    return "#57606f"; 
}

/**
 * 6. Analiza la URL para aplicar filtros automáticos en secciones finales
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
 * 7. Extrae el identificador de 11 caracteres de enlaces de YouTube (Validado)
 */
function extraerIdVideoPlataformas(urlVideo) {
    if (!urlVideo) return null;
    let match = urlVideo.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * INTERFAZ PÚBLICA: Escucha los clics de las botoneras flotantes de tu HTML
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
