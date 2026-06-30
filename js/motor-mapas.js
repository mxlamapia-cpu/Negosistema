/**
 * ==========================================================================
 * NEGOSISTEMA (2026) - Motor de Mapas e Inteligencia Geográfica Hiperlocal
 * ARCHIVO: js/motor-mapas.js (PARTE 1 DE 3)
 * ==========================================================================
 */

// --- 1. CONFIGURACIÓN MAESTRA Y ABSORCIÓN DE CANALES CSV (GOOGLE SHEETS) ---
const CONFIG_NEGOSISTEMA = {
  // CSV 1: Límites por Alcaldía y Estatus de Colonias (Fase Piloto)
  urlCsvLimites: "https://google.com",
  
  // CSV 2: Directorio Oficial de Comercios Físicos Verificados
  urlCsvDirectorio: "https://google.com",
  
  // CSV 4: Buzón de Ofertas Activas Temporales (Premium Niveles 4 y 5)
  urlCsvOfertas: "https://google.com",

  // Repositorios de Capas Vectoriales Estables GeoJSON
  urlGeoJsonCdmxBase: "https://githubusercontent.com", 
  urlGeoJsonColoniasIztapalapa: "https://githubusercontent.com",

  // Parámetros de Enfoque de Cámara Cartográfica
  coordenadasIztapalapa: [19.3455, -99.0130],
  zoomIndexPrincipal: 12,
  zoomSeccionInterna: 16
};

// Variables globales de control del Lienzo
let mapaNegosistema = null;
let capaMarcadoresGroup = null;
let capaPoligonosGroup = null;
let datosComerciosGlobales = [];

// Inicialización controlada al cargar el árbol DOM
document.addEventListener("DOMContentLoaded", () => {
  inicializarArquitecturaEcosistema();
});

/**
 * 2. ENRUTADOR DE ENTORNO: Identifica la vista y configura Leaflet nativo
 */
function inicializarArquitecturaEcosistema() {
  const contenedorIndex = document.getElementById("mapa_general");
  const contenedorSeccion = document.getElementById("mapa_seccion");
  const urlActual = window.location.pathname.toLowerCase();

  let idContenedor = "";
  let zoomInicial = CONFIG_NEGOSISTEMA.zoomIndexPrincipal;
  let modoEjecucion = "";

  if (contenedorIndex) {
    idContenedor = "mapa_general";
    modoEjecucion = urlActual.includes("anunciate") ? "SIMULACION" : "INDEX_GENERAL";
  } else if (contenedorSeccion) {
    idContenedor = "mapa_seccion";
    modoEjecucion = "INTERNO_CAMALEON";
    zoomInicial = CONFIG_NEGOSISTEMA.zoomSeccionInterna;
  } else {
    console.error("Negosistema: No se localizó un contenedor cartográfico válido.");
    return;
  }

  // Instanciar Leaflet con optimizaciones táctiles para smartphones
  mapaNegosistema = L.map(idContenedor, {
    zoomControl: false,
    dragging: true,
    tap: true
  }).setView(CONFIG_NEGOSISTEMA.coordenadasIztapalapa, zoomInicial);

  // Servidor oficial de OpenStreetMap (Elimina fallas de renderizado en subcarpetas)
  L.tileLayer('https://openstreetmap.org{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; Negosistema 2026'
  }).addTo(mapaNegosistema);

  L.control.zoom({ position: 'topright' }).addTo(mapaNegosistema);

  // Declarar los grupos de capas independientes en memoria
  capaPoligonosGroup = L.layerGroup().addTo(mapaNegosistema);
  capaMarcadoresGroup = L.layerGroup().addTo(mapaNegosistema);

  ejecutarCargaPorCanal(modoEjecucion);
}
/**
 * ==========================================================================
 * NEGOSISTEMA (2026) - Motor de Mapas e Inteligencia Geográfica Hiperlocal
 * ARCHIVO: js/motor-mapas.js (PARTE 2 DE 3)
 * ==========================================================================
 */

/**
 * 3. ORQUESTADOR DE FLUJOS: Segmentación de descargas asíncronas
 */
function ejecutarCargaPorCanal(modo) {
  if (modo === "INDEX_GENERAL") {
    Promise.all([
      fetch(CONFIG_NEGOSISTEMA.urlGeoJsonCdmxBase).then(res => res.json()),
      fetch(CONFIG_NEGOSISTEMA.urlCsvLimites).then(res => res.text())
    ])
    .then(([geoJsonData, csvTexto]) => {
      renderizarPoligonosPiloto(geoJsonData, csvTexto);
    })
    .catch(err => console.error("Falla en canal de inicialización Index:", err));

  } else if (modo === "SIMULACION") {
    console.log("Negosistema: Desplegando simulación estratégica de 26 negocios.");
    activarCompuertaSimulacionVentas();

  } else if (modo === "INTERNO_CAMALEON") {
    Promise.all([
      fetch(CONFIG_NEGOSISTEMA.urlGeoJsonColoniasIztapalapa).then(res => res.json()),
      fetch(CONFIG_NEGOSISTEMA.urlCsvDirectorio).then(res => res.text())
    ])
    .then(([geoJsonData, csvTexto]) => {
      L.geoJSON(geoJsonData, {
        style: { color: "#34495e", weight: 2, opacity: 0.3, fillColor: "#34495e", fillOpacity: 0.02 }
      }).addTo(capaPoligonosGroup);

      procesarBaseDatosCsvNegocios(csvTexto);
    })
    .catch(err => console.error("Falla en canal interno comercial:", err));
  }
}

/**
 * 4. RENDERIZADO PILOTO (INDEX): Reglas de color por estatus y nombres al centro
 */
function renderizarPoligonosPiloto(geoJson, csvTexto) {
  // Diccionario de control derivado del CSV 1 (Estatus de validación piloto)
  const estatusColoniasPiloto = {
    "santiago acahualtepec i": "EXPLORANDO",
    "santiago acahualtepec ii": "EXPLORANDO",
    "xalpa ii": "ACTIVO"
  };

  L.geoJSON(geoJson, {
    style: function(feature) {
      const nombreColonia = (feature.properties.Nombre || feature.properties.name || "").toLowerCase().trim();
      const estatus = estatusColoniasPiloto[nombreColonia] || "INACTIVO";

      if (estatus === "ACTIVO") {
        return { color: "#27ae60", weight: 2, opacity: 0.8, fillColor: "#2ecc71", fillOpacity: 0.35 }; // Verde
      } else if (estatus === "EXPLORANDO") {
        return { color: "#f1c40f", weight: 2, opacity: 0.8, fillColor: "#fef9e7", fillOpacity: 0.5 }; // Blanco-Amarillento Claro
      } else {
        return { color: "transparent", weight: 0, opacity: 0, fillColor: "transparent", fillOpacity: 0 }; // Inactivas no se pintan
      }
    },
    onEachFeature: function(feature, layer) {
      const nombreColonia = (feature.properties.Nombre || feature.properties.name || "");
      const nombreClean = nombreColonia.toLowerCase().trim();
      const estatus = estatusColoniasPiloto[nombreClean] || "INACTIVO";

      if (estatus !== "INACTIVO") {
        // Calcular el centro geométrico del polígono
        const centroide = layer.getBounds().getCenter();
        
        // Inyectar el label con el nombre estático flotante en el centro
        L.marker(centroide, {
          icon: L.divIcon({
            className: 'label-colonia-flotante',
            html: `<div style="font-family:-apple-system,sans-serif; font-weight:700; font-size:11px; color:#2c3e50; text-shadow:1px 1px 2px white; text-align:center; transform:translateX(-50%); white-space:nowrap;">${nombreColonia}</div>`,
            iconSize: [0, 0]
          })
        }).addTo(capaPoligonosGroup);

        // Enlace dinámico con transición directa al Tablero Geo-Comercial Camaleónico
        layer.on('click', () => {
          let urlDestino = "./Iztapalapa/mapas-prod/xalpa2-Productos.html";
          if (nombreClean.includes("santiago") && nombreClean.includes("ii")) {
            urlDestino = "./Iztapalapa/mapas-prod/2ampli2-productos.html";
          } else if (nombreClean.includes("santiago")) {
            urlDestino = "./Iztapalapa/mapas-prod/2ampli1-productos.html";
          }
          
          // Almacenar en LocalStorage para el bloque de historial del index.html
          localStorage.setItem('negosistema_ultima_visita', JSON.stringify({ nombre: nombreColonia, url: urlDestino }));
          window.location.href = urlDestino;
        });

        layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.55 }));
        layer.on('mouseout', () => layer.setStyle({ fillOpacity: estatus === "ACTIVO" ? 0.35 : 0.5 }));
      }
    }
  }).addTo(capaPoligonosGroup);

  mapaNegosistema.setView(CONFIG_NEGOSISTEMA.coordenadasIztapalapa, 13);
}
/**
 * ==========================================================================
 * NEGOSISTEMA (2026) - Motor de Mapas e Inteligencia Geográfica Hiperlocal
 * ARCHIVO: js/motor-mapas.js (PARTE 3 DE 3)
 * ==========================================================================
 */

/**
 * 5. COMPUERTA DE SIMULACIÓN (ANÚNCIATE): Carga estática de 26 muestras
 */
function activarCompuertaSimulacionVentas() {
  datosComerciosGlobales = [];
  
  const simulacion26NegociosDemo = [
    { id: "306-PREMIUM", coloniaOriginal: "XALPA II", mapaObjetivo: "productos", capaActivaMapeo: "tecnologia", nivelServicio: 5, nombre: "🔥 NEGOCIO MAESTRO PREMIUM", slogan: "Máxima conversión digital vecinal", productosServicios: "Páginas Web, Video Embebido de YouTube, Animación Parpadeante en Oro y Contacto Directo.", horarios: "Lunes a Domingo - 24 Horas Activo", clickPersonalizado: "https://wa.me", redes: "https://facebook.com", enlaceVideo: "https://youtube.com", linksWebPropia: "https://github.io", coordenadasRaw: "19.3455-99.0130" },
    { id: "306-N4-01", coloniaOriginal: "XALPA II", mapaObjetivo: "productos", capaActivaMapeo: "comida", nivelServicio: 4, nombre: "Taquería El Pastor Demo", slogan: "Pines de Color con Brillo Pulsante de Plata", productosServicios: "Tacos al pastor, alambre y gringas", horarios: "Mar a Dom 6pm - 1am", clickGenerico: "https://wa.me", coordenadasRaw: "19.3465-99.0115" },
    { id: "308-N4-02", coloniaOriginal: "SANTIAGO I", mapaObjetivo: "servicios", capaActivaMapeo: "taller", nivelServicio: 4, nombre: "Mecánica Automotriz Santiago", slogan: "Expertos certificados en tu zona", productosServicios: "Afinación, frenos y suspensión", horarios: "Lun a Sáb 9am - 7pm", clickPersonalizado: "https://wa.me", coordenadasRaw: "19.3490-99.0060" },
    { id: "306-N4-03", coloniaOriginal: "XALPA II", mapaObjetivo: "productos", capaActivaMapeo: "salud", nivelServicio: 4, nombre: "Farmacia de Descuento Prueba", slogan: "Salud y ahorro directo para el barrio", productosServicios: "Medicamentos de patente y genéricos", horarios: "8am - 10pm", clickGenerico: "https://wa.me", coordenadasRaw: "19.3445-99.0155" },
    { id: "306-N3-01", coloniaOriginal: "XALPA II", mapaObjetivo: "productos", capaActivaMapeo: "canasta", nivelServicio: 3, nombre: "Abarrotes La Esquina Ficticio", slogan: "Surtido completo para el hogar", productosServicios: "Lácteos, embutidos y refrescos", horarios: "Lun a Dom 7am - 10pm", coordenadasRaw: "19.3430-99.0145" }
  ];

  for (let j = 1; j <= 21; j++) {
    let nivelAsignado = (j % 3) + 1; 
    let capaMuestra = j % 2 === 0 ? "canasta" : "comida";
    let latOffset = (Math.sin(j) * 0.0045);
    let lonOffset = (Math.cos(j) * 0.0045);

    simulacion26NegociosDemo.push({
      id: `306-DEMO-N${nivelAsignado}-0${j}`,
      coloniaOriginal: "XALPA II",
      mapaObjetivo: "productos",
      capaActivaMapeo: capaMuestra,
      nivelServicio: nivelAsignado,
      nombre: `Comercio Demo Nivel ${nivelAsignado} (#${j})`,
      slogan: `Posicionamiento geo-comercial en la capa de ${capaMuestra}`,
      productosServicios: "Artículos de consumo y servicios de prueba hiperlocal.",
      horarios: "Abierto en horario comercial regular",
      coordenadasRaw: `${19.3455 + latOffset}-${99.0130 + lonOffset}`
    });
  }

  simulacion26NegociosDemo.forEach(comercio => {
    const partes = comercio.coordenadasRaw.split("-");
    comercio.latitud = parseFloat(partes[0]);
    comercio.longitud = parseFloat(partes[1]);
    datosComerciosGlobales.push(comercio);
  });

  renderizarPinesEnPantalla("todos", "todos", "todos");
}

/**
 * 6. PARSER CSV COMERCIAL REAL: Regla de Doble Presencia (Nivel 4 y 5 se duplican)
 */
function procesarBaseDatosCsvNegocios(csvTexto) {
  datosComerciosGlobales = [];
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
      coordenadasRaw: cleanCols[14],
      clickGenerico: cleanCols[15],
      clickPersonalizado: cleanCols[17],
      linksWebPropia: cleanCols[18]
    };

    if (!comercio.coordenadasRaw || !comercio.coordenadasRaw.includes(",")) continue;
    const partesCoords = comercio.coordenadasRaw.split(",");
    comercio.latitud = parseFloat(partesCoords[0]);
    comercio.longitud = parseFloat(partesCoords[1]);

    if (isNaN(comercio.latitud) || isNaN(comercio.longitud)) continue;

    const catProd = comercio.capaProductos ? comercio.capaProductos.split(",") : [];
    const catServ = comercio.capaServicios ? comercio.capaServicios.split(",") : [];
    const totalCapas = [...catProd, ...catServ];

    if (totalCapas.length > 1 && (comercio.nivelServicio === 4 || comercio.nivelServicio === 5)) {
      totalCapas.forEach(capa => {
        const copiaComercio = { ...comercio, capaActivaMapeo: capa.trim().toLowerCase() };
        datosComerciosGlobales.push(copiaComercio);
      });
    } else {
      let capaDefecto = (comercio.mapaObjetivo === "productos" ? comercio.capaProductos : comercio.capaServicios);
      comercio.capaActivaMapeo = capaDefecto ? capaDefecto.toString().trim().toLowerCase() : "";
      datosComerciosGlobales.push(comercio);
    }
  }

  ejecutarFiltroAutomaticoPaginaInterna();
}

/**
 * 7. PINTOR DE MARCADORES: Aplica Muro de Privacidad y Semáforo de Horarios
 */
function renderizarPinesEnPantalla(filtroColonia, filtroMapa, filtroCapa = "todos") {
  capaMarcadoresGroup.clearLayers();
  let boundsAjuste = [];

  datosComerciosGlobales.forEach(function(comercio) {
    if (filtroColonia !== "todos" && !comercio.coloniaOriginal.toLowerCase().includes(filtroColonia.toLowerCase())) return;
    if (filtroMapa !== "todos" && comercio.mapaObjetivo !== filtroMapa.toLowerCase()) return;
    if (filtroCapa !== "todos" && comercio.capaActivaMapeo !== filtroCapa.toLowerCase()) return;

    var claseNivelCss = "pin-nivel" + comercio.nivelServicio;
    var colorHexGiro = obtenerColorHexagonalPorCapa(comercio.capaActivaMapeo);
    var estiloInline = (comercio.nivelServicio === 1) ? '' : "background-color:" + colorHexGiro + ";";

    var iconoPersonalizadoHtml = L.divIcon({
      className: "pin-negosistema " + claseNivelCss,
      html: '<div style="' + estiloInline + ' width:14px; height:14px; border-radius:50%;"></div>',
      iconSize:[14, 14],
      iconAnchor: [7, 7]
    });

    var popupContenidoHtml = '<div class="tarjeta-popup">';
    popupContenidoHtml += '<h3>' + (comercio.nivelServicio >= 2 ? comercio.nombre : 'Comercio Registrado') + '</h3>';
    popupContenidoHtml += '<p style="font-size:11px; margin: 0 0 6px 0; color:#95a5a6;">ID Ref: ' + comercio.id + '</p>';

    if (comercio.nivelServicio >= 3) {
      if (comercio.slogan) popupContenidoHtml += '<div class="slogan">"' + comercio.slogan + '"</div>';
      if (comercio.productosServicios) popupContenidoHtml += '<div class="productos"><strong>Ofrece:</strong> ' + comercio.productosServicios + '</div>';
      if (comercio.horarios) popupContenidoHtml += '<div class="semaforo-horario horario-abierto">Abierto: ' + comercio.horarios + '</div>';
    }

    if (comercio.nivelServicio >= 4) {
      var urlWhatsAppActiva = comercio.clickPersonalizado || comercio.clickGenerico;
      if (urlWhatsAppActiva) {
        popupContenidoHtml += '<a href="' + urlWhatsAppActiva + '" target="_blank" class="btn-whatsapp-comercial">Contactar por WhatsApp</a>';
      }
      if (comercio.redes) {
        popupContenidoHtml += '<p style="margin: 8px 0 4px 0; font-size:12px; text-align:center;"><a href="' + comercio.redes + '" target="_blank" style="color:#1a73e8; font-weight:600;">Ver Redes Sociales</a></p>';
      }
    }

    if (comercio.nivelServicio === 5) {
      if (comercio.enlaceVideo) {
        var idVideoLimpio = extraerIdVideoPlataformas(comercio.enlaceVideo);
        if (idVideoLimpio) {
          popupContenidoHtml += '<div class="contenedor-video" style="margin-top:8px; position:relative; padding-bottom:56.25%; height:0; overflow:hidden;"><iframe src="https://youtube.com' + idVideoLimpio + '" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:8px;"></iframe></div>';
        }
      }
      if (comercio.linksWebPropia) {
        popupContenidoHtml += '<a href="' + comercio.linksWebPropia + '" target="_blank" class="btn-web-comercial">Visitar Página Web Oficial</a>';
      }
    }

    if (comercio.nivelServicio <= 3) {
      popupContenidoHtml += '<div class="bloque-bloqueado-upsell" style="margin-top:6px;">Canales de contacto exclusivos para cuentas Premium 🔒</div>';
    }
    popupContenidoHtml += '</div>';

    var marcadorFinal = L.marker([comercio.latitud, comercio.longitud], { icon: iconoPersonalizadoHtml })
      .bindPopup(popupContenidoHtml, { maxWidth: 290 });
    
    capaMarcadoresGroup.addLayer(marcadorFinal);
    boundsAjuste.push([comercio.latitud, comercio.longitud]);
  });

  if (boundsAjuste.length > 0 && filtroColonia !== "todos") {
    mapaNegosistema.fitBounds(boundsAjuste, { padding: 40, maxZoom: 16 });
  }
}

/**
 * 8. TAXONOMÍA CAMALEÓNICA: Paleta cromática oficial de 16 Capas
 */
function obtenerColorHexagonalPorCapa(nombreCapa) {
  // --- CIERRE DE LA FUNCIÓN DE CAPAS ---
  if (!nombreCapa) return "#7f8c8d";
  
  var c = nombreCapa.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (c.includes("basica") || c.includes("abarrotes") || c.includes("carnic") || c.includes("recaud")) {
    return "#27ae60";
  }
  if (c.includes("preparada") || c.includes("taco") || c.includes("pizz") || c.includes("panader")) {
    return "#e67e22";
  }
  if (c.includes("ferreter") || c.includes("tlapaler") || c.includes("construc")) {
    return "#f1c40f";
  }
  if (c.includes("farmacia") || c.includes("dentista") || c.includes("laboratorio")) {
    return "#e74c3c";
  }
  if (c.includes("variedades") || c.includes("moda") || c.includes("papeler")) {
    return "#e84393";
  }
  if (c.includes("mascota") || c.includes("acuario") || c.includes("canina")) {
    return "#6f3e1a";
  }
  if (c.includes("tecnolog") || c.includes("celular") || c.includes("computa")) {
    return "#0984e3";
  }
  if (c.includes("consulta") || c.includes("medico") || c.includes("psicolog")) {
    return "#22a6b3";
  }
  if (c.includes("taller") || c.includes("oficio") || c.includes("mecanic")) {
    return "#2c3e50";
  }
  if (c.includes("bienestar") || c.includes("estilo") || c.includes("barber")) {
    return "#9b59b6";
  }
  if (c.includes("asesoria") || c.includes("oficina") || c.includes("contador")) {
    return "#34495e";
  }
  if (c.includes("evento") || c.includes("lavander") || c.includes("cerrajer")) {
    return "#74001a";
  }
  if (c.includes("educacion") || c.includes("apoyo") || c.includes("tarea")) {
    return "#f5f6fa";
  }
  if (c.includes("urgencia") || c.includes("nocturna") || c.includes("grua")) {
    return "#111111";
  }
  
  return "#7f8c8d";
}

/**
 * DETECTOR AUTOMÁTICO DE URL INTERNAS
 */
function ejecutarFiltroAutomaticoPaginaInterna() {
  var urlActual = window.location.pathname.toLowerCase();
  var zonaMapeo = "todos";
  var segmentoMapa = "todos";
  
  if (urlActual.includes("xalpa")) zonaMapeo = "xalpa";
  if (urlActual.includes("ampli1") || urlActual.includes("santiago")) zonaMapeo = "santiago";
  if (urlActual.includes("productos")) segmentoMapa = "productos";
  if (urlActual.includes("servicios")) segmentoMapa = "servicios";
  
  renderizarPinesEnPantalla(zonaMapeo, segmentoMapa, "todos");
}

/**
 * INTERFAZ PÚBLICA DE BOTONERAS FLOTANTES
 */
function aplicarFiltroCapaBotonera(nombreCapa) {
  var contenedorIndex = document.getElementById("mapa_general");
  var zonaMapeo = "todos";
  var segmentoMapa = "todos";
  
  if (!contenedorIndex) {
    var urlActual = window.location.pathname.toLowerCase();
    if (urlActual.includes("xalpa")) zonaMapeo = "xalpa";
    if (urlActual.includes("ampli1") || urlActual.includes("santiago")) zonaMapeo = "santiago";
    if (urlActual.includes("productos")) segmentoMapa = "productos";
    if (urlActual.includes("servicios")) segmentoMapa = "servicios";
  }
  
  renderizarPinesEnPantalla(zonaMapeo, segmentoMapa, nombreCapa);
}

/**
 * REGEX EXTRACTOR SEGURO DE IDENTIFICADORES YOUTUBE
 */
function extraerIdVideoPlataformas(urlVideo) {
  if (!urlVideo) return null;
  
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = urlVideo.match(regExp);
  
  return (match && match[2] && match[2].length === 11) ? match[2] : null;
}
