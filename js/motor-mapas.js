// ==========================================================================
// NEGOSISTEMA (2026) - MOTOR DE MAPAS CAMALEÓNICO CENTRALIZADO
// PARTE 1 DE 4: Configuración Maestra, GIDs de Google Sheets y Taxonomías
// ==========================================================================
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

const DICCIONARIO_CAMALEON = {
  colonias: {
    "xalpa2": { nombre: "Xalpa II", emoji: "🍎" },
    "santiago1": { nombre: "2da Ampliación Santiago I", emoji: "🍓" },
    "santiago2": { nombre: "2da Ampliación Santiago II", emoji: "🍒" }
  },
  entornos: {
    "productos": {
      titulo: "Directorio de Productos y Canasta Básica",
      desc: "Localice los puntos de venta, comida y mercancías tangibles de proximidad.",
      emoji: "🛒",
      capas: [
        { id: "todos", name: "Todos los Ramos", emoji: "🌐", color: "#7f8c8d", clase: "color-directorio" },
        { id: "canasta", name: "Canasta Básica", emoji: "🍏", color: "#2e7d32", clase: "color-canasta" },
        { id: "comida", name: "Comida Preparada", emoji: "🍲", color: "#ef6c00", clase: "color-comida" },
        { id: "hogar", name: "Ferretería y Hogar", emoji: "🏠", color: "#fbc02d", clase: "color-hogar" },
        { id: "salud", name: "Salud y Farmacia", emoji: "🚨", color: "#c62828", clase: "color-salud" },
        { id: "moda", name: "Variedades y Moda", emoji: "👗", color: "#e4007c", clase: "color-moda" },
        { id: "mascotas", name: "Mascotas", emoji: "🐶", color: "#795548", clase: "color-mascotas" },
        { id: "tecnologia", name: "Tecnología", emoji: "⚡", color: "#1565c0", clase: "color-tecnologia" }
      ]
    },
    "servicios": {
      titulo: "Directorio de Servicios, Expertos y Oficios",
      desc: "Encuentre especialistas, profesionales técnicos y soluciones para el hogar.",
      emoji: "🛠️",
      capas: [
        { id: "todos", name: "Todos los Servicios", emoji: "🌐", color: "#7f8c8d", clase: "color-directorio" },
        { id: "consultas", name: "Salud y Consultas", emoji: "🩺", color: "#1565c0", clase: "color-salud" },
        { id: "oficios", name: "Talleres y Oficios", emoji: "🔧", color: "#1565c0", clase: "color-talleres" },
        { id: "bienestar", name: "Bienestar y Estilo", emoji: "💇", color: "#9b59b6", clase: "color-bienestar" },
        { id: "asesoria", name: "Asesoría y Oficina", emoji: "📁", color: "#9e9e9e", clase: "color-asesoria" },
        { id: "eventos", name: "Hogar y Eventos", emoji: "🧺", color: "#74001a", clase: "color-eventos" },
        { id: "educacion", name: "Educación y Apoyo", emoji: "✏️", color: "#b2bec3", clase: "color-educacion" },
        { id: "urgencias", name: "Urgencias 24/7", emoji: "⚠️", color: "#111111", clase: "color-urgencias" }
      ]
    }
  }
};

// Variables globales del control de mapas
let mapaNegosistema = null;
let capaMarcadoresGroup = null;
let capaPoligonosGroup = null;
let datosComerciosGlobales = [];

// Variables globales del estado mutante
let coloniaActivaUrl = "xalpa2";
let entornoActivoUrl = "productos";
let mapaCamaleonCapasActivas = {};
// ==========================================================================
// NEGOSISTEMA (2026) - MOTOR DE MAPAS CAMALEÓNICO CENTRALIZADO
// PARTE 2 DE 4: Inicialización del DOM, Instancia Leaflet y Flujos Fetch
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const urlActual = window.location.pathname.toLowerCase();
  
  if (urlActual.includes("comercial.html")) {
    procesarParametrosUrlCamaleon();
  }
  
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
    
    // Si la URL está limpia, dibuja el mapa macro de las 16 alcaldías de la CDMX
    if (!alcaldiaClave || alcaldiaClave === "cdmx") {
      const recursosCDMX = CONFIG_NEGOSISTEMA.catalogoAlcaldias["cdmx"];
      mapaNegosistema.setView(recursosCDMX.coordenadas, recursosCDMX.zoom);
      
      Promise.all([
        fetch(recursosCDMX.geojson).then(res => res.json()),
        fetch(recursosCDMX.urlCsvEstatus).then(res => res.text())
      ])
      .then(([geoJsonData, csvTexto]) => {
        renderizarPoligonosPiloto(geoJsonData, csvTexto);
      })
      .catch(err => console.error("Error en mapa macro CDMX:", err));
      
    } else if (alcaldiaClave === "iztapalapa") {
      // PASO 2: Si es Iztapalapa, hace zoom local y descarga su GeoJSON de colonias
      const recursoIztapalapa = CONFIG_NEGOSISTEMA.catalogoAlcaldias["iztapalapa"];
      mapaNegosistema.setView(recursoIztapalapa.coordenadas, 13);
      
      Promise.all([
        fetch(recursoIztapalapa.geojson).then(res => res.json()),
        fetch(recursoIztapalapa.urlCsvEstatus).then(res => res.text())
      ])
      .then(([geoJsonData, csvTexto]) => {
        // Llama a la función encargada de pintar y enlazar las colonias piloto
        renderizarPoligonosColoniasPiloto(geoJsonData, csvTexto);
      })
      .catch(err => console.error("Error en mapa de colonias piloto:", err));
    }

  }

  
  else if (modo === "SIMULACION") {
    // ENLACE DIRECTO AL CSV 3: Descarga los datos de Anúnciate
    const recursoIztapalapa = CONFIG_NEGOSISTEMA.catalogoAlcaldias["iztapalapa"];
    
    Promise.all([
      fetch(recursoIztapalapa.geojson).then(res => res.json()),
      fetch(recursoIztapalapa.urlCsvAnunciateSimulacion).then(res => res.text())
    ])
    .then(([geoJsonData, csvTexto]) => {
      L.geoJSON(geoJsonData, {
        coordsToLatLng: function (coords) { 
          return new L.LatLng(coords, coords); 
        },
        style: { 
          color: "#e67e22", 
          weight: 2, 
          opacity: 0.4, 
          fillColor: "#f1c40f", 
          fillOpacity: 0.1 
        }
      }).addTo(capaPoligonosGroup);
      
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
          return new L.LatLng(coords, coords); 
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
// NEGOSISTEMA (2026) - MOTOR DE MAPAS CAMALEÓNICO CENTRALIZADO
// PARTE 3 DE 4: Lector Quirúrgico de URL, Mutador de Textos e Inyector Táctil
// ==========================================================================

/**
 * 4. LECTOR DE URL Y MUTADOR DE INTERFAZ: Extrae los parámetros 
 * de la dirección web para transformar la cabecera y botonera.
 */
function procesarParametrosUrlCamaleon() {
  const parametros = new URLSearchParams(window.location.search);
  
  // Extraemos la colonia (si no existe, usa "xalpa2" por defecto)
  let col = parametros.get("colonia");
  if (col) coloniaActivaUrl = col.trim().toLowerCase();
  if (!DICCIONARIO_CAMALEON.colonias[coloniaActivaUrl]) {
    coloniaActivaUrl = "xalpa2";
  }

  // Extraemos el sub-entorno (si no existe, usa "productos" por defecto)
  let ent = parametros.get("entorno");
  if (ent) entornoActivoUrl = ent.trim().toLowerCase();
  if (!DICCIONARIO_CAMALEON.entornos[entornoActivoUrl]) {
    entornoActivoUrl = "productos";
  }

  // Ejecutamos la mutación visual de los textos en la pantalla
  inyectarTextosCabeceraCamaleon();
  generarBotoneraInterruptoresTactiles();
}

/**
 * 5. INYECTOR DE TEXTOS: Altera las etiquetas de los títulos HTML
 */
function inyectarTextosCabeceraCamaleon() {
  const infoColonia = DICCIONARIO_CAMALEON.colonias[coloniaActivaUrl];
  const infoEntorno = DICCIONARIO_CAMALEON.entornos[entornoActivoUrl];

  const tColonia = document.getElementById("titulo_colonia_dinamico");
  const dColonia = document.getElementById("descripcion_colonia_dinamica");
  const bSwitch = document.getElementById("btn_switch_entorno");
  const tGuia = document.getElementById("titulo_guia_capas");

  // Mutación del título principal: Nombre + Emojis oficiales combinados
  if (tColonia) {
    tColonia.innerHTML = `${infoColonia.nombre} ${infoColonia.emoji} : ${infoEntorno.titulo} ${infoEntorno.emoji}`;
  }
  if (dColonia) {
    dColonia.innerText = infoEntorno.desc;
  }
  if (tGuia) {
    tGuia.innerText = `Guía de Colores e Interruptores: Mapa de ${entornoActivoUrl === 'productos' ? 'Productos' : 'Servicios'}`;
  }

  // Modificación del botón Switch que alterna los sub-entornos
  if (bSwitch) {
    if (entornoActivoUrl === "productos") {
      bSwitch.innerText = "🛠️ Cambiar a Mapa de Servicios (Oficios y Expertos)";
    } else {
      bSwitch.innerText = "🍎 Cambiar a Mapa de Productos (Comercio y Abasto)";
    }
  }
}

/**
 * 6. PINTOR DE BOTONERA INFERIOR: Crea los interruptores de los círculos.
 * Inicializa todas las capas en estado "Encendido" (true) por defecto.
 */
function generarBotoneraInterruptoresTactiles() {
  const contenedorBotonera = document.getElementById("botonera_capas_camaleon");
  if (!contenedorBotonera) return;

  contenedorBotonera.innerHTML = "";
  const listaCapas = DICCIONARIO_CAMALEON.entornos[entornoActivoUrl].capas;

  listaCapas.forEach(capa => {
    // Registramos en memoria la capa como ACTIVA (true) la primera vez
    if (mapaCamaleonCapasActivas[capa.id] === undefined) {
      mapaCamaleonCapasActivas[capa.id] = true;
    }

    const estaActiva = mapaCamaleonCapasActivas[capa.id];

    // Construimos el botón estructurado con clases CSS
    const botonElemento = document.createElement("button");
    botonElemento.className = `guia-item-btn ${estaActiva ? '' : 'capa-apagada'}`;
    botonElemento.id = `btn_capa_${capa.id}`;
    
    // Vinculamos el evento táctil de encendido y apagado
    botonElemento.onclick = () => alternarEstadoInterruptorCapa(capa.id);

    // Inyectamos el círculo cromático representativo y el texto con emoji
    botonElemento.innerHTML = `
      <span class="punto-color-toggle ${capa.clase}" style="background-color: ${capa.color};"></span>
      <div class="guia-item-texto">
        <strong>${capa.emoji} ${capa.name}</strong>
      </div>
    `;

    contenedorBotonera.appendChild(botonElemento);
  });
}

// ==========================================================================
// NEGOSISTEMA (2026) - MOTOR DE MAPAS CAMALEÓNICO CENTRALIZADO
// PARTE 4 DE 4: Control de Interruptores, Pintor de Marcadores y Parsers
// ==========================================================================
// ==========================================================================
// NEGOSISTEMA (2026) - MOTOR DE MAPAS CAMALEÓNICO CENTRALIZADO
// PARTE 4 DE 5: Control de Interruptores Táctiles y Pintor de Marcadores
// ==========================================================================

/**
 * 7. INTERRUPTOR TÁCTIL DE CAPAS (TOGGLE): Enciende o apaga las capas del mapa.
 * Al tocar un ramo, vacía o rellena el círculo e invoca la limpieza de pines.
 */
function alternarEstadoInterruptorCapa(idCapa) {
  const botonHtml = document.getElementById(`btn_capa_${idCapa}`);
  if (!botonHtml) return;

  if (idCapa === "todos") {
    const estadoActualTodos = !mapaCamaleonCapasActivas["todos"];
    const listaCapas = DICCIONARIO_CAMALEON.entornos[entornoActivoUrl].capas;
    
    listaCapas.forEach(capa => {
      mapaCamaleonCapasActivas[capa.id] = estadoActualTodos;
      const btnElemento = document.getElementById(`btn_capa_${capa.id}`);
      if (btnElemento) {
        if (estadoActualTodos) {
          btnElemento.classList.remove("capa-apagada");
        } else {
          btnElemento.classList.add("capa-apagada");
        }
      }
    });
  } else {
    mapaCamaleonCapasActivas[idCapa] = !mapaCamaleonCapasActivas[idCapa];
    
    if (mapaCamaleonCapasActivas[idCapa]) {
      botonHtml.classList.remove("capa-apagada");
    } else {
      botonHtml.classList.add("capa-apagada");
    }

    const btnTodos = document.getElementById("btn_capa_todos");
    if (!mapaCamaleonCapasActivas[idCapa] && btnTodos) {
      mapaCamaleonCapasActivas["todos"] = false;
      btnTodos.classList.add("capa-apagada");
    }
  }

  ejecutarFiltroAutomaticoPaginaInterna();
}

/**
 * 8. DETECTOR DE INTERFAZ CAMALEÓNICA: Cruza el estado de la memoria
 * de los interruptores táctiles para limpiar o dibujar en pantalla.
 */
function ejecutarFiltroAutomaticoPaginaInterna() {
  const urlActual = window.location.pathname.toLowerCase();
  let segmentoMapa = "todos";

  if (urlActual.includes("productos") || entornoActivoUrl === "productos") {
    segmentoMapa = "productos";
  } else if (urlActual.includes("servicios") || entornoActivoUrl === "servicios") {
    segmentoMapa = "servicios";
  }

  renderizarPinesEnPantallaCamaleon(coloniaActivaUrl, segmentoMapa);
}

/**
 * 9. PINTOR DE MARCADORES CAMALEÓN: Versión adaptada que lee los estados
 * individuales rellenos o vacíos del Menú de Capas Mutante.
 */
function renderizarPinesEnPantallaCamaleon(filtroColonia, filtroMapa) {
  capaMarcadoresGroup.clearLayers();
  let boundsAjuste = [];

  datosComerciosGlobales.forEach(function(comercio) {
    if (filtroColonia !== "todos" && !comercio.coloniaOriginal.toLowerCase().includes(filtroColonia.toLowerCase())) return;
    if (filtroMapa !== "todos" && comercio.mapaObjetivo !== filtroMapa.toLowerCase()) return;
    
    const capaMapeada = comercio.capaActivaMapeo ? comercio.capaActivaMapeo.toLowerCase() : "";
    if (mapaCamaleonCapasActivas[capaMapeada] === false) return;

    var claseNivelCss = "pin-nivel" + comercio.nivelServicio;
    var colorHexGiro = obtenerColorHexagonalPorCapa(capaMapeada);
    var estiloInline = (comercio.nivelServicio === 1) ? '' : "background-color:" + colorHexGiro + ";";

    // DESGLOSE COMPLETO CORREGIDO CON COMAS Y CORCHETES IMPECABLES
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
          popupContenidoHtml += '<div class="contenedor-video"><iframe src="https://youtube.com' + idVideoLimpio + '" allowfullscreen style="border:0;"></iframe></div>';
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

  setTimeout(() => { if (mapaNegosistema) mapaNegosistema.invalidateSize(); }, 100);
}

/// ==========================================================================
// NEGOSISTEMA (2026) - MOTOR DE MAPAS CAMALEÓNICO CENTRALIZADO
// PARTE 5 DE 5: Conmutador por URL, Semáforo de CDMX y Parsers Comerciales
// ==========================================================================

/**
 * 10. CONMUTADOR DE SUB-ENTORNOS: Altera dinámicamente los parámetros de la URL
 * para alternar entre el mapa de Productos y Servicios en la misma pantalla.
 */
function conmutarSubEntornoCamaleon() {
  const nuevoEntorno = (entornoActivoUrl === "productos") ? "servicios" : "productos";
  const nuevaUrl = `${window.location.pathname}?colonia=${coloniaActivaUrl}&entorno=${nuevoEntorno}`;
  window.history.pushState({ path: nuevaUrl }, '', nuevaUrl);
  
  entornoActivoUrl = nuevoEntorno;
  mapaCamaleonCapasActivas = {};
  
  inyectarTextosCabeceraCamaleon();
  generarBotoneraInterruptoresTactiles();
  ejecutarFiltroAutomaticoPaginaInterna();
}


function renderizarPoligonosColoniasPiloto(geoJson, csvTexto) {
  const estatusColoniasIztapalapa = {};
  
  // Parseamos el CSV de estatus mediante la librería PapaParse
  const filasParseadas = Papa.parse(csvTexto, { skipEmptyLines: true }).data;
  
  for (let i = 1; i < filasParseadas.length; i++) {
    const columnas = filasParseadas[i];
    if (!columnas || columnas.length < 5) continue;
    
    // Limpieza de cadenas para asociar los nombres de tu tabla Sheets
    const nombreColoniaCsv = (columnas[columnas.length - 4] || "")
      .replace(/^"|"$/g, '').trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
    const estatusCsv = (columnas[columnas.length - 1] || "")
      .replace(/^"|"$/g, '').trim().toUpperCase();
      
    if (nombreColoniaCsv) {
      estatusColoniasIztapalapa[nombreColoniaCsv] = estatusCsv;
    }
  }

  // Pintamos los vectores de las colonias sobre el mapa
  L.geoJSON(geoJson, {
    style: function(feature) {
      // Extraemos la propiedad nativa del nombre desde tu GeoJSON de GitHub
      var nombreVector = (feature.properties.NOMGEO || feature.properties.Nombre || feature.properties.name || "");
      var nombreLimpio = nombreVector.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      var estatus = estatusColoniasIztapalapa[nombreLimpio] || "INACTIVO";
      
      // Si la colonia está en fase activa o de exploración, la viste de amarillo claro
      if (estatus === "EXPLORANDO" || estatus === "COMPLETADA") {
        return { color: "#f1c40f", weight: 2, opacity: 0.8, fillColor: "#fef9e7", fillOpacity: 0.55 };
      } else if (estatus === "PROXIMAMENTE") {
        return { color: "#c0392b", weight: 2, opacity: 0.7, fillColor: "#e74c3c", fillOpacity: 0.35 };
      } else {
        // Oculta las zonas que no pertenecen a la exploración del piloto actual
        return { color: "#bdc3c7", weight: 1, opacity: 0.3, fillColor: "#ecf0f1", fillOpacity: 0.1 };
      }
    },
    onEachFeature: function(feature, layer) {
      var nombreVector = (feature.properties.NOMGEO || feature.properties.Nombre || feature.properties.name || "");
      var nombreLimpio = nombreVector.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      var estatus = estatusColoniasIztapalapa[nombreLimpio] || "INACTIVO";
      
      // Solo activa etiquetas e interacción si la colonia pertenece al piloto activo
      if (estatus === "EXPLORANDO" || estatus === "COMPLETADA") {
        var centroide = layer.getBounds().getCenter();
        
        // Inyectamos el letrero flotante con el nombre de la colonia (Xalpa II, etc.)
        L.marker(centroide, {
          icon: L.divIcon({ 
            className: 'label-colonia-flotante', 
            html: '<div>' + nombreVector + '</div>' 
          })
        }).addTo(capaPoligonosGroup);
        
        // EVENTO DE CLIC DEFINITIVO: Salta al dashboard comercial con herencia de URL
        layer.on('click', function() {
          window.location.href = `./comercial.html?colonia=${nombreLimpio}&entorno=productos`;
        });
        
        layer.on('mouseover', function() { 
          layer.setStyle({ fillOpacity: 0.75, weight: 3, color: "#e67e22" }); 
        });
        
        layer.on('mouseout', function() { 
          layer.setStyle({ fillOpacity: 0.55, weight: 2, color: "#f1c40f" }); 
        });
      } else {
        // Comportamiento mudo de popup para colonias bloqueadas en Fase 1
        layer.bindPopup(`<b>${nombreVector}</b><br><span style="font-size:11px;color:#7f8c8d;">Apertura en la siguiente fase</span>`);
      }
    }
  }).addTo(capaPoligonosGroup);
}

/* ==========================================================================

 * 11. RENDERIZADO MACRO CDMX (Semáforo Tricolor): Cruza el mapa con la pestaña 5
 */
function renderizarPoligonosPiloto(geoJson, csvTexto) {
  const estatusAlcaldiasCdmx = {};
  const filasParseadas = Papa.parse(csvTexto, { skipEmptyLines: true }).data;
  
  for (let i = 1; i < filasParseadas.length; i++) {
    const columnas = filasParseadas[i];
    if (!columnas || columnas.length < 5) continue;
    const nombreAlcaldiaCsv = (columnas[columnas.length - 4] || "").replace(/^"|"$/g, '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const estatusCsv = (columnas[columnas.length - 1] || "").replace(/^"|"$/g, '').trim().toUpperCase();
    if (nombreAlcaldiaCsv) estatusAlcaldiasCdmx[nombreAlcaldiaCsv] = estatusCsv;
  }

  L.geoJSON(geoJson, {
    style: function(feature) {
      var nombreVector = (feature.properties.NOMGEO || feature.properties.Nombre || feature.properties.name || "");
      var nombreLimpio = nombreVector.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      var estatus = estatusAlcaldiasCdmx[nombreLimpio] || "INACTIVO";
      if (estatus === "COMPLETADA") return { color: "#27ae60", weight: 2, opacity: 0.8, fillColor: "#2ecc71", fillOpacity: 0.4 };
      if (estatus === "EXPLORANDO") return { color: "#f1c40f", weight: 2, opacity: 0.8, fillColor: "#fef9e7", fillOpacity: 0.55 };
      if (estatus === "PROXIMAMENTE") return { color: "#c0392b", weight: 2, opacity: 0.7, fillColor: "#e74c3c", fillOpacity: 0.35 };
      return { color: "transparent", weight: 0, opacity: 0, fillColor: "transparent", fillOpacity: 0 };
    },
    onEachFeature: function(feature, layer) {
      var nombreVector = (feature.properties.NOMGEO || feature.properties.Nombre || feature.properties.name || "");
      var nombreLimpio = nombreVector.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      var estatus = estatusAlcaldiasCdmx[nombreLimpio] || "INACTIVO";
      
      if (estatus !== "INACTIVO") {
        var centroide = layer.getBounds().getCenter();
        L.marker(centroide, {
          icon: L.divIcon({ className: 'label-colonia-flotante', html: '<div>' + nombreVector + '</div>' })
        }).addTo(capaPoligonosGroup);
        
        layer.on('click', function() {
          if (nombreLimpio === "iztapalapa") { window.location.href = "./comercial.html?colonia=xalpa2&entorno=productos"; }
          else { window.location.href = "./index.html?alcaldia=" + nombreLimpio; }
        });
        layer.on('mouseover', function() { layer.setStyle({ fillOpacity: 0.65 }); });
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
 * 12. PARSER CSV COMERCIAL REAL (Google Sheets de 19 columnas)
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
      id: cleanCols,
      coloniaOriginal: cleanCols,
      mapaObjetivo: cleanCols ? cleanCols.toLowerCase() : "",
      capaProductos: cleanCols,
      capaServicios: cleanCols,
      nivelServicio: parseInt(cleanCols) || 1,
      nombre: cleanCols,
      slogan: cleanCols,
      productosServicios: cleanCols,
      horarios: cleanCols,
      redes: cleanCols,
      enlaceVideo: cleanCols,
      coorRaw: cleanCols,
      clickGenerico: cleanCols,
      clickPersonalizado: cleanCols,
      linksWebPropia: cleanCols
    };

    if (!comercio.coorRaw || !comercio.coorRaw.includes(",")) continue;
    const partesCoords = comercio.coorRaw.split(",");
    comercio.latitud = parseFloat(partesCoords);
    comercio.longitud = parseFloat(partesCoords);

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
  inyectarAnunciosCarruselPremium();
}

/**
 * 13. TAXONOMÍA CROMÁTICA OFICIAL (16 Capas de Negocios y Servicios)
 */
function obtenerColorHexagonalPorCapa(nombreCapa) {
  if (!nombreCapa) return "#7f8c8d";
  var c = nombreCapa.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (c.includes("basica") || c.includes("abarrotes") || c.includes("carnic") || c.includes("recaud")) return "#2e7d32";
  if (c.includes("preparada") || c.includes("taco") || c.includes("pizz") || c.includes("panader")) return "#ef6c00";
  if (c.includes("ferreter") || c.includes("tlapaler") || c.includes("construc")) return "#fbc02d";
  if (c.includes("farmacia") || c.includes("dentista") || c.includes("laboratorio") || c.includes("consultas")) return "#c62828";
  if (c.includes("variedades") || c.includes("moda") || c.includes("papeler")) return "#e4007c";
  if (c.includes("mascota") || c.includes("acuario") || c.includes("canina")) return "#795548";
  if (c.includes("tecnolog") || c.includes("celular") || c.includes("computa")) return "#1565c0";
  if (c.includes("taller") || c.includes("oficio") || c.includes("mecanic")) return "#1565c0";
  if (c.includes("bienestar") || c.includes("estilo") || c.includes("barber")) return "#9b59b6";
  if (c.includes("asesoria") || c.includes("oficina") || c.includes("contador")) return "#9e9e9e";
  if (c.includes("evento") || c.includes("lavander") || c.includes("cerrajer")) return "#74001a";
  if (c.includes("educacion") || c.includes("apoyo") || c.includes("tarea")) return "#b2bec3";
  if (c.includes("urgencia") || c.includes("nocturna") || c.includes("grua") || c.includes("urgencias")) return "#111111";
  return "#7f8c8d";
}

/**
 * 14. REGEX EXTRACTOR DE YOUTUBE
 */
function extraerIdVideoPlataformas(urlVideo) {
  if (!urlVideo) return null;
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = urlVideo.match(regExp);
  return (match && match && match.length === 11) ? match : null;
}
/**
 * 15. RENDERIZADOR DEL CARRUSEL: Consume directamente las filas del CSV
 * e inyecta las imágenes, títulos y botones de WhatsApp en la cabecera.
 */
function inyectarAnunciosCarruselPremium() {
  const track = document.getElementById("contenedor_slider_track");
  if (!track) return;

  // Si la tabla de Google Sheets viene vacía, dejamos la tarjeta de respaldo
  if (datosComerciosGlobales.length === 0) {
    track.innerHTML = `
      <div class="slide-group">
        <div class="feature-card-link">
          <div class="feature-card">
            <div class="card-image">
              <img src="./Imagenes/caballete.png" alt="Muestra">
            </div>
            <div class="card-content">
              <h3>Buscando Ofertas...</h3>
              <p>Espere las promociones de esta colonia.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Limpiamos el carrusel estático para meter los datos de tu Sheets
  track.innerHTML = "";

  // Agrupamos tus comercios de 2 en 2 para mantener la maquetación CSS
  for (let i = 0; i < datosComerciosGlobales.length; i += 2) {
    const grupoDiv = document.createElement("div");
    grupoDiv.className = "slide-group";

    // Insertamos el primer negocio disponible en la fila
    const c1 = datosComerciosGlobales[i];
    const urlWa1 = c1.clickPersonalizado || c1.clickGenerico || "https://wa.me";
    const img1 = c1.slogan ? "./Imagenes/caballete.png" : "./Imagenes/caballete.png";
    
    grupoDiv.innerHTML += `
      <div class="feature-card-link">
        <div class="feature-card">
          <div class="card-image">
            <img src="${img1}" alt="${c1.nombre}">
          </div>
          <div class="card-content">
            <h3>${c1.nombre}</h3>
            <p>${c1.slogan || 'Promoción disponible en sucursal'}</p>
          </div>
        </div>
        <a href="${urlWa1}" class="btn-wa-float" target="_blank">¡PEDIR!</a>
      </div>
    `;

    // Si la tabla tiene un segundo negocio consecutivo, lo mete al mismo bloque
    if (datosComerciosGlobales[i + 1]) {
      const c2 = datosComerciosGlobales[i + 1];
      const urlWa2 = c2.clickPersonalizado || c2.clickGenerico || "https://wa.me";
      const img2 = c2.slogan ? "./Imagenes/caballete.png" : "./Imagenes/caballete.png";
      
      grupoDiv.innerHTML += `
        <div class="feature-card-link">
          <div class="feature-card">
            <div class="card-image">
              <img src="${img2}" alt="${c2.nombre}">
          </div>
            <div class="card-content">
              <h3>${c2.nombre}</h3>
              <p>${c2.slogan || 'Promoción disponible en sucursal'}</p>
            </div>
          </div>
          <a href="${urlWa2}" class="btn-wa-float" target="_blank">¡PEDIR!</a>
        </div>
      `;
    }

    track.appendChild(grupoDiv);
  }
}
/**
 * 15. RENDERIZADOR DEL CARRUSEL: Consume directamente las filas del CSV
 * e inyecta las imágenes, títulos y botones de WhatsApp en la cabecera.
 */
function inyectarAnunciosCarruselPremium() {
  const track = document.getElementById("contenedor_slider_track");
  if (!track) return;

  // Si la tabla de Google Sheets viene vacía, dejamos la tarjeta de respaldo
  if (datosComerciosGlobales.length === 0) {
    track.innerHTML = `
      <div class="slide-group">
        <div class="feature-card-link">
          <div class="feature-card">
            <div class="card-image">
              <img src="./Imagenes/caballete.png" alt="Muestra">
            </div>
            <div class="card-content">
              <h3>Buscando Ofertas...</h3>
              <p>Espere las promociones de esta colonia.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Limpiamos el carrusel estático para meter los datos de tu Sheets
  track.innerHTML = "";

  // Agrupamos tus comercios de 2 en 2 para mantener la maquetación CSS
  for (let i = 0; i < datosComerciosGlobales.length; i += 2) {
    const grupoDiv = document.createElement("div");
    grupoDiv.className = "slide-group";

    // Insertamos el primer negocio disponible en la fila
    const c1 = datosComerciosGlobales[i];
    const urlWa1 = c1.clickPersonalizado || c1.clickGenerico || "https://wa.me";
    const img1 = c1.slogan ? "./Imagenes/caballete.png" : "./Imagenes/caballete.png";
    
    grupoDiv.innerHTML += `
      <div class="feature-card-link">
        <div class="feature-card">
          <div class="card-image">
            <img src="${img1}" alt="${c1.nombre}">
          </div>
          <div class="card-content">
            <h3>${c1.nombre}</h3>
            <p>${c1.slogan || 'Promoción disponible en sucursal'}</p>
          </div>
        </div>
        <a href="${urlWa1}" class="btn-wa-float" target="_blank">¡PEDIR!</a>
      </div>
    `;

    // Si la tabla tiene un segundo negocio consecutivo, lo mete al mismo bloque
    if (datosComerciosGlobales[i + 1]) {
      const c2 = datosComerciosGlobales[i + 1];
      const urlWa2 = c2.clickPersonalizado || c2.clickGenerico || "https://wa.me";
      const img2 = c2.slogan ? "./Imagenes/caballete.png" : "./Imagenes/caballete.png";
      
      grupoDiv.innerHTML += `
        <div class="feature-card-link">
          <div class="feature-card">
            <div class="card-image">
              <img src="${img2}" alt="${c2.nombre}">
          </div>
            <div class="card-content">
              <h3>${c2.nombre}</h3>
              <p>${c2.slogan || 'Promoción disponible en sucursal'}</p>
            </div>
          </div>
          <a href="${urlWa2}" class="btn-wa-float" target="_blank">¡PEDIR!</a>
        </div>
      `;
    }

    track.appendChild(grupoDiv);
  }
}
