// ==========================================================================
// NEGOSISTEMA (2026) - Motor de Mapas Centralizado (motor-mapas.js)
// PARTE 1 DE 4: Configuración Global, Variables y Enrutador de Interfaz
// ==========================================================================

// --- 1. CONFIGURACIÓN MAESTRA CON SEGMENTACIÓN DE PESTAÑAS (GID) ---
const CONFIG_NEGOSISTEMA = {
  catalogoAlcaldias: {
    "cdmx": {
      nombre: "Ciudad de México (Macro)",
      coordenadas: [19.4326, -99.1332],
      zoom: 11,
      geojson: "https://raw.githubusercontent.com/mxlamapia-cpu/Negosistema/refs/heads/main/geo/alcaldias.geojson",
      urlCsvEstatus: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtpbVZGhb318tEVKgcGJUHQ34E84mc5bSsViofcXcGMLyTmPp39k4wwxcjwT08Zl4QjM2A9xtCDPaO/pub?gid=1670206752&single=true&output=csv"
    },                
    "iztapalapa": {
      nombre: "Iztapalapa (Piloto)",
      coordenadas: [19.3455, -99.0130],
      zoom: 13,
      geojson: "https://raw.githubusercontent.com/mxlamapia-cpu/Negosistema/refs/heads/main/geo/iztapal/iztapalapa.geojson",
      // pestaña 5: "Estatus"
      urlCsvEstatus: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtpbVZGhb318tEVKgcGJUHQ34E84mc5bSsViofcXcGMLyTmPp39k4wwxcjwT08Zl4QjM2A9xtCDPaO/pub?gid=383048417&single=true&output=csv",
      // pestaña 4: "Salida Mapa"
      urlCsvSalidaMapa: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtpbVZGhb318tEVKgcGJUHQ34E84mc5bSsViofcXcGMLyTmPp39k4wwxcjwT08Zl4QjM2A9xtCDPaO/pub?gid=1369751544&single=true&output=csv",
      // pestaña 3: "Entrada" (Negocios Ficticios / Muestra Anúnciate)
    urlCsvAnunciateSimulacion:"https://docs.google.com/spreadsheets/d/e/2PACX-1vSGcorxjHpvr9WkNUQd2cRuAf1wRFlI5Jr67WeT9aZnz74Y677ZZ9u3iAFpwCl5RcuVM8npRYOrJbJ_/pub?gid=956712165&single=true&output=csv"
    }
  }
};


// Variables globales para el control del lienzo cartográfico
let mapaNegosistema = null;
let capaMarcadoresGroup = null;
let capaPoligonosGroup = null;
let datosComerciosGlobales = [];

// Inicialización controlada al cargar por completo el árbol DOM
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
  let zoomInicial = CONFIG_NEGOSISTEMA.catalogoAlcaldias.cdmx.zoom;
  let modoEjecucion = "";

  if (contenedorIndex) {
    idContenedor = "mapa_general";
    modoEjecucion = urlActual.includes("anunciate") ? "SIMULACION" : "INDEX_GENERAL";
  } else if (contenedorSeccion) {
    idContenedor = "mapa_seccion";
    modoEjecucion = "INTERNO_CAMALEON";
    zoomInicial = CONFIG_NEGOSISTEMA.catalogoAlcaldias.iztapalapa.zoom;
  } else {
    console.error("Negosistema: No se localizó un contenedor cartográfico válido.");
    return;
  }

  // Instanciar Leaflet con optimizaciones táctiles y controles móviles
  mapaNegosistema = L.map(idContenedor, {
    zoomControl: false,
    dragging: true,
    tap: true
  }).setView(CONFIG_NEGOSISTEMA.catalogoAlcaldias.cdmx.coordenadas, zoomInicial);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; Negosistema 2026'
  }).addTo(mapaNegosistema);

  L.control.zoom({ position: 'topright' }).addTo(mapaNegosistema);

  // Declarar y vincular los grupos de capas independientes en memoria
  capaPoligonosGroup = L.layerGroup().addTo(mapaNegosistema);
  capaMarcadoresGroup = L.layerGroup().addTo(mapaNegosistema);

  // Disparar la carga de datos correspondiente al canal detectado
  ejecutarCargaPorCanal(modoEjecucion);
}
// ==========================================================================
// NEGOSISTEMA (2026) - Motor de Mapas Centralizado (motor-mapas.js)
// PARTE 2 DE 4: Orquestador de Canales de Carga y Descargas Asíncronas
// ==========================================================================

/**
 * 3. ORQUESTADOR DE FLUJOS DINÁMICOS: Segmentación de descargas asíncronas
 */
function ejecutarCargaPorCanal(modo) {
  if (modo === "INDEX_GENERAL") {
    const parametrosUrl = new URLSearchParams(window.location.search);
    let alcaldiaClave = parametrosUrl.get("alcaldia");
    
    if (alcaldiaClave) {
      alcaldiaClave = alcaldiaClave.trim().toLowerCase();
    }
    
    if (!alcaldiaClave || !CONFIG_NEGOSISTEMA.catalogoAlcaldias[alcaldiaClave]) {
      alcaldiaClave = "cdmx";
    }
    
    const recursosZona = CONFIG_NEGOSISTEMA.catalogoAlcaldias[alcaldiaClave];
    mapaNegosistema.setView(recursosZona.coordenadas, recursosZona.zoom);
    
    Promise.all([
      fetch(recursosZona.geojson).then(res => res.json()),
      fetch(recursosZona.urlCsvEstatus).then(res => res.text())
    ])
    .then(([geoJsonData, csvTexto]) => {
      renderizarPoligonosPiloto(geoJsonData, csvTexto);
    })
    .catch(err => console.error("Error en index:", err));

  } else if (modo === "SIMULACION") {
    // ENLACE DIRECTO AL CSV 3: Descarga el GeoJSON y los datos de Anúnciate
    const recursoIztapalapa = CONFIG_NEGOSISTEMA.catalogoAlcaldias["iztapalapa"];
    
    Promise.all([
      fetch(recursoIztapalapa.geojson).then(res => res.json()),
      fetch(recursoIztapalapa.urlCsvAnunciateSimulacion).then(res => res.text())
    ])
    .then(([geoJsonData, csvTexto]) => {
      // Pintamos el polígono base de la zona piloto
      L.geoJSON(geoJsonData, {
        coordsToLatLng: function (coords) { 
          return new L.LatLng(coords[1], coords[0]); 
        },
        style: { 
          color: "#e67e22", 
          weight: 2, 
          opacity: 0.4, 
          fillColor: "#f1c40f", 
          fillOpacity: 0.1 
        }
      }).addTo(capaPoligonosGroup);
      
      // Enviamos el texto de la pestaña 3 al procesador comercial
      procesarBaseDatosCsvNegocios(csvTexto);
    })
    .catch(err => console.error("Error al conectar con la pestaña 3:", err));

  } else if (modo === "INTERNO_CAMALEON") {
    const recursoIztapalapa = CONFIG_NEGOSISTEMA.catalogoAlcaldias["iztapalapa"];
    
    Promise.all([
      fetch(recursoIztapalapa.geojson).then(res => res.json()),
      fetch(recursoIztapalapa.urlCsvSalidaMapa).then(res => res.text())
    ])
    .then(([geoJsonData, csvTexto]) => {
      L.geoJSON(geoJsonData, {
        coordsToLatLng: function (coords) { 
          return new L.LatLng(coords[1], coords[0]); 
        },
        style: { 
          color: "#34495e", 
          weight: 2, 
          opacity: 0.3, 
          fillColor: "#34495e", 
          fillOpacity: 0.02 
        }
      }).addTo(capaPoligonosGroup);
      
      procesarBaseDatosCsvNegocios(csvTexto);
    })
    .catch(err => console.error("Error en pestaña Salida Mapa:", err));
  }
}
// ==========================================================================
// NEGOSISTEMA (2026) - Motor de Mapas Centralizado (motor-mapas.js)
// PARTE 3 DE 4: Parser del Semáforo de Alcaldías y Algoritmo de Simulación
// ==========================================================================

/**
 * 4. RENDERIZADO CON SIMBIOSIS TRICOLOR INDEPENDIENTE: Cruza el GeoJSON de la CDMX
 * con tu tabla real de 10 columnas para aplicar Verde, Blanco o Rojo según la fase.
 */
function renderizarPoligonosPiloto(geoJson, csvTexto) {
  const estatusAlcaldiasCdmx = {};
  
  // Romper las filas respetando comas y comillas de Google Sheets con PapaParse
  const filasParseadas = Papa.parse(csvTexto, { skipEmptyLines: true }).data;
  
  // Empezamos en i = 1 para saltarnos la fila de encabezados de la tabla
  for (let i = 1; i < filasParseadas.length; i++) {
    const columnas = filasParseadas[i];
    
    // Validación de seguridad elemental para asegurar que la fila tenga contenido
    if (!columnas || columnas.length < 5) continue;
    
    // Limpieza quirúrgica de comillas en las celdas clave para evitar desfases
    const nombreAlcaldiaCsv = (columnas[columnas.length - 4] || "").replace(/^"|"$/g, '').trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
    const estatusCsv = (columnas[columnas.length - 1] || "").replace(/^"|"$/g, '').trim().toUpperCase();
    
    // Guardar coincidencia limpia en la memoria caché del navegador
    if (nombreAlcaldiaCsv) {
      estatusAlcaldiasCdmx[nombreAlcaldiaCsv] = estatusCsv;
    }
  }

  // Dibujar las alcaldías sobre el lienzo
  L.geoJSON(geoJson, {
    style: function(feature) {
      var nombreVector = (feature.properties.NOMGEO || feature.properties.Nombre || feature.properties.name || "");
      var nombreLimpio = nombreVector.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      var estatus = estatusAlcaldiasCdmx[nombreLimpio] || "INACTIVO";
      
      if (estatus === "COMPLETADA") {
        return { color: "#27ae60", weight: 2, opacity: 0.8, fillColor: "#2ecc71", fillOpacity: 0.4 };
      } else if (estatus === "EXPLORANDO") {
        return { color: "#f1c40f", weight: 2, opacity: 0.8, fillColor: "#fef9e7", fillOpacity: 0.55 };
      } else if (estatus === "PROXIMAMENTE") {
        return { color: "#c0392b", weight: 2, opacity: 0.7, fillColor: "#e74c3c", fillOpacity: 0.35 };
      } else {
        return { color: "transparent", weight: 0, opacity: 0, fillColor: "transparent", fillOpacity: 0 };
      }
    },
    onEachFeature: function(feature, layer) {
      var nombreVector = (feature.properties.NOMGEO || feature.properties.Nombre || feature.properties.name || "");
      var nombreLimpio = nombreVector.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      var estatus = estatusAlcaldiasCdmx[nombreLimpio] || "INACTIVO";
      
      if (estatus !== "INACTIVO") {
        var centroide = layer.getBounds().getCenter();
        
        L.marker(centroide, {
          icon: L.divIcon({
            className: 'label-colonia-flotante',
            html: '<div>' + nombreVector + '</div>'
          })
        }).addTo(capaPoligonosGroup);
        
                layer.on('click', function() {
          if (nombreLimpio === "iztapalapa") {
            window.location.href = "./comercial.html";
          } else {
            window.location.href = "./index.html?alcaldia=" + nombreLimpio;
          }
        });
        
        layer.on('mouseover', function() { 
          layer.setStyle({ fillOpacity: 0.65 }); 
        });
        
        layer.on('mouseout', function() { 
          var opacidadBase = (estatus === "EXPLORANDO") ? 0.55 : 0.4;
          if (estatus === "PROXIMAMENTE") opacidadBase = 0.35;
          layer.setStyle({ fillOpacity: opacidadBase }); 
        });
      }
    }
  }).addTo(capaPoligonosGroup);
}

/**
 * 5. COMPUERTA DE SIMULACIÓN (ANÚNCIATE): Carga estática de 26 muestras
 * Distribuye uniformemente comercios demo aplicando la escalera de valor.
 */
function activarCompuertaSimulacionVentas() {
  datosComerciosGlobales = [];
  
  const simulacion26NegociosDemo = [
    { id: "306-PREMIUM", coloniaOriginal: "XALPA II", mapaObjetivo: "productos", capaActivaMapeo: "tecnologia", nivelServicio: 5, nombre: "NEGOCIO MAESTRO 🔥 PREMIUM", slogan: "Máxima conversión digital vecinal", productosServicios: "Páginas Web, Video Embebido de YouTube, Animación Parpadeante en Oro y Contacto Directo.", horarios: "Lunes a Domingo - 24 Horas Activo", clickPersonalizado: "https://wa.me", redes: "https://facebook.com", enlaceVideo: "https://youtube.com", linksWebPropia: "https://github.io", coordenadasRaw: "19.3455-99.0130" },
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
// ==========================================================================
// NEGOSISTEMA (2026) - Motor de Mapas Centralizado (motor-mapas.js)
// PARTE 4 DE 4: Base Comercial, Muro de Privacidad, Taxonomía e Interfaz
// ==========================================================================

/**
 * 6. PARSER CSV COMERCIAL REAL: Regla de Doble Presencia por Capa Comercial
 * Multiplica y clona físicamente en memoria JSON a los comercios Premium
 */
function procesarBaseDatosCsvNegocios(csvTexto) {
  datosComerciosGlobales = [];
  const lineas = csvTexto.split("\n");
  if (lineas.length < 2) return;

  for (let i = 1; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    if (!linea) continue;

    // Parser seguro para celdas con comillas y comas internas de Google Sheets
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

    if (!comercio.coorRaw || !comercio.coorRaw.includes(",")) continue;
    const partesCoords = comercio.coorRaw.split(",");
    comercio.latitud = parseFloat(partesCoords[0]);
    comercio.longitud = parseFloat(partesCoords[1]);

    if (isNaN(comercio.latitud) || isNaN(comercio.longitud)) continue;

    const catProd = comercio.capaProductos ? comercio.capaProductos.split(",") : [];
    const catServ = comercio.capaServicios ? comercio.capaServicios.split(",") : [];
    const totalCapas = [...catProd, ...catServ];

    // Regla de duplicación física en memoria para cobro del 30% extra en multi-ramos
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

    // CORRECCIÓN: Arreglos limpios sin paréntesis invasivos
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
      if (urlWhatsAppActiva) popupContenidoHtml += '<a href="' + urlWhatsAppActiva + '" target="_blank" class="btn-whatsapp-comercial">Contactar por WhatsApp</a>';
      if (comercio.redes) popupContenidoHtml += '<p style="margin: 8px 0 4px 0; font-size:12px; text-align:center;"><a href="' + comercio.redes + '" target="_blank" style="color:#1a73e8; font-weight:600;">Ver Redes Sociales</a></p>';
    }

    if (comercio.nivelServicio === 5) {
      if (comercio.enlaceVideo) {
        var idVideoLimpio = extraerIdVideoPlataformas(comercio.enlaceVideo);
        if (idVideoLimpio) {
          popupContenidoHtml += '<div class="contenedor-video" style="margin-top:8px; position:relative; padding-bottom:56.25%; height:0; overflow:hidden;"><iframe src="https://youtube.com' + idVideoLimpio + '" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:8px;"></iframe></div>';
        }
      }
      if (comercio.linksWebPropia) popupContenidoHtml += '<a href="' + comercio.linksWebPropia + '" target="_blank" class="btn-web-comercial">Visitar Página Web Oficial</a>';
    }

    if (comercio.nivelServicio <= 3) {
      popupContenidoHtml += '<div class="bloque-bloqueado-upsell" style="margin-top:6px;">Canales de contacto exclusivos para cuentas Premium 🔒</div>';
    }
    popupContenidoHtml += '</div>';

    var marcadorFinal = L.marker([comercio.latitud, comercio.longitud], { icon: iconoPersonalizadoHtml }).bindPopup(popupContenidoHtml, { maxWidth: 290 });

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
  if (!nombreCapa) return "#7f8c8d";
  var c = nombreCapa.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (c.includes("basica") || c.includes("abarrotes") || c.includes("carnic") || c.includes("recaud")) return "#27ae60";
  if (c.includes("preparada") || c.includes("taco") || c.includes("pizz") || c.includes("panader")) return "#e67e22";
  if (c.includes("ferreter") || c.includes("tlapaler") || c.includes("construc")) return "#f1c40f";
  if (c.includes("farmacia") || c.includes("dentista") || c.includes("laboratorio")) return "#e74c3c";
  if (c.includes("variedades") || c.includes("moda") || c.includes("papeler")) return "#e84393";
  if (c.includes("mascota") || c.includes("acuario") || c.includes("canina")) return "#6f3e1a";
  if (c.includes("tecnolog") || c.includes("celular") || c.includes("computa")) return "#0984e3";
  if (c.includes("consulta") || c.includes("medico") || c.includes("psicolog")) return "#22a6b3";
  if (c.includes("taller") || c.includes("oficio") || c.includes("mecanic")) return "#2c3e50";
  if (c.includes("bienestar") || c.includes("estilo") || c.includes("barber")) return "#9b59b6";
  if (c.includes("asesoria") || c.includes("oficina") || c.includes("contador")) return "#34495e";
  if (c.includes("evento") || c.includes("lavander") || c.includes("cerrajer")) return "#74001a";
  if (c.includes("educacion") || c.includes("apoyo") || c.includes("tarea")) return "#f5f6fa";
  if (c.includes("urgencia") || c.includes("nocturna") || c.includes("grua")) return "#111111";
  return "#7f8c8d";
}

/**
 * 9. DETECTOR AUTOMÁTICO DE URL INTERNAS
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
 * 10. INTERFAZ PÚBLICA DE BOTONERAS FLOTANTES
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
 * 11. REGEX EXTRACTOR SEGURO DE IDENTIFICADORES YOUTUBE
 */
function extraerIdVideoPlataformas(urlVideo) {
  if (!urlVideo) return null;
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = urlVideo.match(regExp);
  // CORRECCIÓN QUIRÚRGICA: Extraer la posición 2 correspondiente al grupo limpio del ID
    // Cierre correcto de la validación del ID de YouTube
    return (match && match[2] && match[2].length === 11) ? match[2] : null;
}

/**
 * 12. CONMUTADOR DE VISTAS PILOTO (Pestañas del Index)
 * Alterna entre el semáforo del piloto o la CDMX completa en gris
 */
function conmutarVistaIndex(tipoVista) {
  const botones = document.querySelectorAll('.btn-pestana');
  botones.forEach(btn => btn.classList.remove('activa'));
  
  const botonPresionado = event.currentTarget;
  if (botonPresionado) {
    botonPresionado.classList.add('activa');
  }
  
  if (!mapaNegosistema || !capaPoligonosGroup) return;

  capaPoligonosGroup.clearLayers();
  const recursosCDMX = CONFIG_NEGOSISTEMA.catalogoAlcaldias["cdmx"];

  fetch(recursosCDMX.geojson)
    .then(res => res.json())
    .then(geoJsonData => {
      if (tipoVista === 'explorando') {
        fetch(recursosCDMX.urlCsvEstatus)
          .then(res => res.text())
          .then(csvTexto => { 
            renderizarPoligonosPiloto(geoJsonData, csvTexto); 
          });
      } else {
        // Vista muda global para toda la CDMX (Próximamente)
        L.geoJSON(geoJsonData, {
          coordsToLatLng: function (coords) { 
            return new L.LatLng(coords[1], coords[0]); 
          },
          style: { 
            color: "#bdc3c7", 
            weight: 1.5, 
            opacity: 0.6, 
            fillColor: "#ecf0f1", 
            fillOpacity: 0.2 
          },
          onEachFeature: function(feature, layer) {
            var nombre = feature.properties.NOMGEO || feature.properties.Nombre || "Alcaldía";
            layer.bindPopup("<b>" + nombre + "</b><br><span>Próxima apertura (Fase 2)</span>");
          }
        }).addTo(capaPoligonosGroup);
      }
    })
    .catch(err => console.error("Error al conmutar la vista del mapa:", err));
}
