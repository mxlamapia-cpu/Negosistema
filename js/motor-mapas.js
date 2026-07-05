// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 1: DICCIONARIO GLOBAL DE EXPANSION
// ==========================================================================

const CONFIG_NEGOSISTEMA = {
  catalogoAlcaldias: {
    "cdmx": {
      nombre: "Ciudad de México (Macro)",
      coordenadas: [19.4326, -99.1332],
      zoom: 11,
      geojson: "https://raw.githubusercontent.com/mxlamapia-cpu/Negosistema/refs/heads/main/geo/alcaldias.geojson",
      urlCsvEstatus: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtpbVZGhb318tEVKgcGJUHQ34E84mc5bSsViofcXcGMLyTmPp39k4wwxcjwT08Zl4QjM2A9xtCDPaO/pub?gid=1369751544&single=true&output=csv"
    },                
    "iztapalapa": {
     nombre: "Iztapalapa (Piloto)",
     coordenadas: [19.3455, -99.0130],
     zoom: 13,
     geojson: "https://raw.githubusercontent.com/mxlamapia-cpu/Negosistema/refs/heads/main/geo/iztapal/iztapalapa.geojson",
     urlCsvEstatus: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtpbVZGhb318tEVKgcGJUHQ34E84mc5bSsViofcXcGMLyTmPp39k4wwxcjwT08Zl4QjM2A9xtCDPaO/pub?gid=383048417&single=true&output=csv",
     urlCsvSalidaMapa: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtpbVZGhb318tEVKgcGJUHQ34E84mc5bSsViofcXcGMLyTmPp39k4wwxcjwT08Zl4QjM2A9xtCDPaO/pub?gid=1369751544&single=true&output=csv"
},
    "coyoacan": {
      nombre: "Coyoacán (Expansión)",
      coordenadas: [19.3497, -99.1623],
      zoom: 13,
      geojson: "https://githubusercontent.com",
      urlCsvEstatus: "https://google.com",
      urlCsvSalidaMapa: "https://google.com"
    }
  }
};
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 2: VARIABLES GLOBALES Y PARÁMETROS URL
// ==========================================================================

let mapaNegosistema = null;
let capaBasePoligonos = null;
let grupoMarcadoresComerciales = null;

// Control de encendido/apagado de las 16 capas oficiales
const capasVisiblesEstado = {
  "canasta": true, "comercial": true, "hogar": true, "salud": true,
  "moda": true, "mascotas": true, "tecnologia": true, "talleres": true,
  "bienestar": true, "asesoria": true, "eventos": true, "educacion": true,
  "urgencias": true, "directorio": true
};

// Extracción de parámetros de la URL limpia sin importar el archivo HTML
const urlParametrosNegosistema = new URLSearchParams(window.location.search);
const alcaldiaActivaUrl = urlParametrosNegosistema.get("alcaldia") ? urlParametrosNegosistema.get("alcaldia").toLowerCase() : null;
const coloniaActivaUrl = urlParametrosNegosistema.get("colonia") ? urlParametrosNegosistema.get("colonia").toLowerCase() : null;
const entornoActivoUrl = urlParametrosNegosistema.get("entorno") ? urlParametrosNegosistema.get("entorno").toLowerCase() : "productos";

// Almacenamiento plano en memoria para el filtrado predictivo y doble presencia
let baseDatosNegociosMemoria = [];
let baseDatosOfertasMemoria = [];
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 3: ENRUTADOR DE ENTORNO (ROUTER)
// ==========================================================================

document.addEventListener("DOMContentLoaded", function() {
  const rutaActualPath = window.location.pathname.toLowerCase();
  
  if (rutaActualPath.includes("index.html") || rutaActualPath === "/" || rutaActualPath.endsWith("/")) {
    inicializarEntornoIndex();
  } 
  else if (rutaActualPath.includes("comercial.html")) {
    inicializarEntornoComercial();
  } 
  else if (rutaActualPath.includes("anunciate.html")) {
    inicializarEntornoAnunciate();
  }
});

function inicializarEntornoIndex() {
  const contenedorMapa = document.getElementById("mapa_general");
  if (!contenedorMapa) return;
  
  mapaNegosistema = L.map("mapa_general").setView([19.4326, -99.1332], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; Negosistema 2026"
  }).addTo(mapaNegosistema);
  
  grupoMarcadoresComerciales = L.featureGroup().addTo(mapaNegosistema);
  capaBasePoligonos = L.geoJSON().addTo(mapaNegosistema);
  
  ejecutarFlujoDatosIndex();
}

function inicializarEntornoComercial() {
  const contenedorMapa = document.getElementById("mapa_seccion");
  if (!contenedorMapa) return;
  
  if (!coloniaActivaUrl) {
    window.location.href = "./index.html";
    return;
  }
  
  mapaNegosistema = L.map("mapa_seccion");
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; Negosistema 2026"
  }).addTo(mapaNegosistema);
  
  grupoMarcadoresComerciales = L.featureGroup().addTo(mapaNegosistema);
  
  ejecutarFlujoDatosComercial();
}

function inicializarEntornoAnunciate() {
  const contenedorMapa = document.getElementById("mapa_general");
  if (!contenedorMapa) return;
  
  mapaNegosistema = L.map("mapa_general").setView([19.3415, -99.0110], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; Negosistema 2026"
  }).addTo(mapaNegosistema);
  
  grupoMarcadoresComerciales = L.featureGroup().addTo(mapaNegosistema);
  
  ejecutarFlujoDatosAnunciate();
}
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 4: MÓDULO DE CONEXIÓN Y DESCARGA PARALELA
// ==========================================================================

function descargarCsvPromesa(urlCsvDestino) {
  return new Promise((resolverPromesa) => {
    if (!urlCsvDestino || urlCsvDestino === "https://google.com") {
      resolverPromesa([]);
      return;
    }
    Papa.parse(urlCsvDestino, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (resultadosCsv) => resolverPromesa(resultadosCsv.data),
      error: () => resolverPromesa([])
    });
  });
}

function ejecutarFlujoDatosIndex() {
  const llaveAlcaldia = alcaldiaActivaUrl && CONFIG_NEGOSISTEMA.catalogoAlcaldias[alcaldiaActivaUrl] ? alcaldiaActivaUrl : "cdmx";
  const configuracionDestino = CONFIG_NEGOSISTEMA.catalogoAlcaldias[llaveAlcaldia];
  
  Promise.all([
    fetch(configuracionDestino.geojson).then(res => res.json()).catch(() => null),
    descargarCsvPromesa(configuracionDestino.urlCsvEstatus)
  ]).then(([datosGeoJson, matrizEstatus]) => {
    procesarDatosEntornoIndex(datosGeoJson, matrizEstatus);
  });
}

function ejecutarFlujoDatosComercial() {
  const configIztapalapa = CONFIG_NEGOSISTEMA.catalogoAlcaldias["iztapalapa"];
  // Conexión paralela a tus pestañas reales publicadas
  Promise.all([
    descargarCsvPromesa(configIztapalapa.urlCsvSalidaMapa),
    descargarCsvPromesa(configIztapalapa.urlCsvEstatus) // Usa el estatus interno como contingencia
  ]).then(([matrizComercios, matrizOfertas]) => {
    baseDatosNegociosMemoria = matrizComercios.slice(1);
    baseDatosOfertasMemoria = matrizOfertas.slice(1);
    procesarDatosEntornoComercial();
  });
}

function ejecutarFlujoDatosAnunciate() {
  const configIztapalapa = CONFIG_NEGOSISTEMA.catalogoAlcaldias["iztapalapa"];
  descargarCsvPromesa(configIztapalapa.urlCsvAnunciateSimulacion).then((matrizSandbox) => {
    baseDatosNegociosMemoria = matrizSandbox.slice(1);
    baseDatosOfertasMemoria = [];
    procesarDatosEntornoAnunciate();
  });
}

// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 5: FUNCIÓN DE LIMPIEZA DE CONTENEDORES
// ==========================================================================

function limpiarLienzoYContenedoresAvanzado(modoEntornoCompleto) {
  // 1. Limpieza absoluta de marcadores y vectores en Leaflet
  if (grupoMarcadoresComerciales) {
    grupoMarcadoresComerciales.clearLayers();
  }
  
  if (capaBasePoligonos) {
    capaBasePoligonos.clearLayers();
  }

  // 2. Limpieza de elementos del DOM según la pantalla activa
  if (modoEntornoCompleto === "index") {
    const contenedorGridColonias = document.querySelector(".grid-eleccion-principal");
    if (contenedorGridColonias) {
      contenedorGridColonias.innerHTML = "";
    }
  } 
  
  else if (modoEntornoCompleto === "comercial") {
    const contenedorBotoneraCapas = document.getElementById("botonera_capas_camaleon");
    if (contenedorBotoneraCapas) {
      contenedorBotoneraCapas.innerHTML = "";
    }
    
    const contenedorSliderTrack = document.getElementById("contenedor_slider_track");
    if (contenedorSliderTrack) {
      contenedorSliderTrack.innerHTML = "";
    }
  }
  
  else if (modoEntornoCompleto === "anunciate") {
    const contenedorBotoneraCapas = document.getElementById("botonera_capas_camaleon");
    if (contenedorBotoneraCapas) {
      contenedorBotoneraCapas.innerHTML = "";
    }
  }
}
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 6: LÓGICA EVALUADORA DEL SEMÁFORO TRICOLOR
// ==========================================================================

function evaluarEstatusSemaforoTricolor(textoEstatusRaw) {
  if (!textoEstatusRaw) {
    return {
      nombreClase: "capa-sin-color",
      codigoHex: "transparent",
      bordeHex: "transparent",
      visible: false
    };
  }

  const estatusLimpio = textoEstatusRaw.trim().toLowerCase();

  if (estatusLimpio === "activo") {
    return {
      nombreClase: "semaforo-activo",
      codigoHex: "#27ae60",
      bordeHex: "#1e7e34",
      visible: true
    };
  } 
  
  if (estatusLimpio === "explorando") {
    return {
      nombreClase: "semaforo-explorando",
      codigoHex: "#fbc02d",
      bordeHex: "#f57f17",
      visible: true
    };
  }

  // Cualquier otra cadena ("Mantenimiento", "Inactivo", etc.) cae en neutralidad
  return {
    nombreClase: "capa-sin-color",
    codigoHex: "#bdc3c7",
    bordeHex: "#7f8c8d",
    visible: false
  };
}
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 7: CONSTRUCTOR DINÁMICO DE BOTONES (INDEX)
// ==========================================================================

// ==========================================================================
// MOTOR-MAPAS.JS (2026) - REFACTORIZACIÓN COMPLETA DE INDEX CON ÍNDICES REALES
// ==========================================================================

function procesarDatosEntornoIndex(datosGeoJson, matrizEstatus) {
  limpiarLienzoYContenedoresAvanzado("index");
  
  const contenedorGridColonias = document.querySelector(".grid-eleccion-principal");
  const alcaldiaActualUrlParam = alcaldiaActivaUrl && CONFIG_NEGOSISTEMA.catalogoAlcaldias[alcaldiaActivaUrl] ? alcaldiaActivaUrl : "cdmx";

  // Diccionario llave-valor para indexar el estatus de forma uniforme
  const mapaEstatusGlobal = {};

  matrizEstatus.forEach(fila => {
    if (!fila || fila.length < 2) return;

    // --- MODO A: Nivel Macro (URL Limpia - Leyendo Estatus Alcaldías del PDF) ---
    if (alcaldiaActualUrlParam === "cdmx" && fila.length >= 10) {
      const nombreAlcaldiaSheet = (fila[7] || "").toString().trim().toLowerCase(); // Índice 7: NOMGEO
      const estatusAlcaldiaSheet = (fila[9] || "").toString().trim();              // Índice 9: Estatus alcaldia
      
      if (nombreAlcaldiaSheet) {
        // Sanitización para quitar acentos de alcaldías (ej: coyoacán -> coyoacan)
        const llaveAlcaldiaLimpia = nombreAlcaldiaSheet.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        mapaEstatusGlobal[llaveAlcaldiaLimpia] = estatusAlcaldiaSheet;
      }
    } 
    // --- MODO B: Nivel Intermedio (URL con ?alcaldia=iztapalapa - Leyendo Estatus Colonias) ---
    else if (alcaldiaActualUrlParam !== "cdmx") {
      const nombreColoniaSheet = (fila[0] || "").toString().trim(); // Índice 0: nombre de la colonia
      const estatusColoniaSheet = (fila[1] || "").toString().trim(); // Índice 1: Estatus de la colonia
      
      if (nombreColoniaSheet) {
        // Reducción estricta: "2A AMPLIACION SANTIAGO ACAHUALTEPEC I" -> "2aampliacionsantiagoacahualtepeci"
        const llaveColoniaLimpia = nombreColoniaSheet.toLowerCase().replace(/[^a-z0-9]/g, "");
        mapaEstatusGlobal[llaveColoniaLimpia] = estatusColoniaSheet;
      }
    }
  });

  // --- CONSTRUCCIÓN DINÁMICA DE BOTONERAS DE ACCESIBILIDAD ---
  if (alcaldiaActualUrlParam === "cdmx") {
    // Si estamos en el mapa de toda la CDMX, listamos las alcaldías configuradas
    Object.keys(CONFIG_NEGOSISTEMA.catalogoAlcaldias).forEach(idAlcaldiaKey => {
      if (idAlcaldiaKey === "cdmx") return; // Omitir la configuración raíz

      const datosConfig = CONFIG_NEGOSISTEMA.catalogoAlcaldias[idAlcaldiaKey];
      const estatusTexto = mapaEstatusGlobal[idAlcaldiaKey] || "";
      const semaforo = evaluarEstatusSemaforoTricolor(estatusTexto);

      if (!semaforo.visible && estatusTexto.toLowerCase() !== "explorando" && estatusTexto.toLowerCase() !== "activo") return;
      if (!contenedorGridColonias) return;

      const tarjetaAlcaldia = document.createElement("a");
      tarjetaAlcaldia.href = `./index.html?alcaldia=${idAlcaldiaKey}`;
      tarjetaAlcaldia.className = "tarjeta-eleccion tarjeta-productos";
      tarjetaAlcaldia.style.borderLeft = `5px solid ${semaforo.codigoHex}`;

      tarjetaAlcaldia.innerHTML = `
        <div class="icono-tarjeta">📍</div>
        <h2>${datosConfig.nombre}</h2>
        <p>Estatus operativo de la demarcación: <b>${estatusTexto}</b></p>
        <span class="btn-accion-tarjeta">Ver Colonias Piloto →</span>
      `;
      contenedorGridColonias.appendChild(tarjetaAlcaldia);
    });
  } 
  else {
    // Si ya estamos dentro de una alcaldía (ej: Iztapalapa), volcamos las colonias activas leídas
    matrizEstatus.forEach(fila => {
      if (!fila || fila.length < 2) return;
      
      const nombreColoniaSheet = (fila[0] || "").toString().trim();
      const estatusColoniaSheet = (fila[1] || "").toString().trim();
      
      const llaveColoniaLimpia = nombreColoniaSheet.toLowerCase().replace(/[^a-z0-9]/g, "");
      const semaforo = evaluarEstatusSemaforoTricolor(estatusColoniaSheet);

      // Bloqueo preventivo: Omitir cabecera, celdas vacías, inactivas o en mantenimiento
      if (nombreColoniaSheet.toLowerCase() === "nombre" || !semaforo.visible) return;
      if (!contenedorGridColonias) return;

      const tarjetaColonia = document.createElement("a");
      tarjetaColonia.href = `./comercial.html?alcaldia=${alcaldiaActualUrlParam}&colonia=${llaveColoniaLimpia}&entorno=productos`;
      tarjetaColonia.className = "tarjeta-eleccion tarjeta-productos";
      tarjetaColonia.style.borderLeft = `5px solid ${semaforo.codigoHex}`;

      tarjetaColonia.innerHTML = `
        <div class="icono-tarjeta">🏠</div>
        <h2>${nombreColoniaSheet}</h2>
        <p>Estatus de carga en comercios: <b>${estatusColoniaSheet}</b></p>
        <span class="btn-accion-tarjeta">Abrir Entorno Comercial →</span>
      `;
      contenedorGridColonias.appendChild(tarjetaColonia);
    });
  }

  // Despliegue de los polígonos vectoriales en el lienzo de Leaflet
  dibujarPoligonosSemaforoIndex(datosGeoJson, mapaEstatusGlobal, alcaldiaActualUrlParam);
}

function dibujarPoligonosSemaforoIndex(datosGeoJson, mapaEstatusGlobal, entornoActualUrl) {
  if (!datosGeoJson || !mapaNegosistema || !capaBasePoligonos) return;

  capaBasePoligonos.addData(datosGeoJson);

  capaBasePoligonos.eachLayer((capaPoligono) => {
    // Extracción del nombre nativo desde las propiedades vectoriales del GeoJSON
    const nombreGeoRaw = (capaPoligono.feature.properties.NOMGEO || capaPoligono.feature.properties.nombre || "").toString().trim();
    
    // Estandarización de llave para cruce de datos inmune a espacios o caracteres
    const llaveGeoLimpia = nombreGeoRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    
    const estatusTexto = mapaEstatusGlobal[llaveGeoLimpia] || "";
    const semaforo = evaluarEstatusSemaforoTricolor(estatusTexto);

    // Renderizado visual del polígono en Leaflet
    capaPoligono.setStyle({
      fillColor: semaforo.codigoHex,
      fillOpacity: estatusTexto ? 0.40 : 0.05,
      color: semaforo.bordeHex,
      weight: estatusTexto ? 2 : 1,
      dashArray: estatusTexto.toLowerCase() === "explorando" ? "5, 5" : null
    });

    // Inyección de etiquetas de texto flotantes (Labels) centraditas en el polígono
    if (capaPoligono.getBounds().isValid() && estatusTexto) {
      const centroide = capaPoligono.getBounds().getCenter();
      L.marker(centroide, {
        icon: L.divIcon({
          className: "label-colonia-flotante",
          html: `<div>${nombreGeoRaw.toUpperCase()}</div>`,
          iconSize:[100, 40],
          iconAnchor: [50, 20]
        }),
        interactive: false
      }).addTo(capaBasePoligonos);
    }

    // Eventos táctiles para brincar de nivel geográfico con un clic
    capaPoligono.on("click", function() {
      if (entornoActualUrl === "cdmx") {
        // Si damos clic a una alcaldía activa, saltamos a su vista intermedia
        if (estatusTexto.toLowerCase() === "activo" || estatusTexto.toLowerCase() === "explorando") {
          window.location.href = `./index.html?alcaldia=${llaveGeoLimpia}`;
        }
      } else {
        // Si damos clic a una colonia activa dentro de Iztapalapa, saltamos a comercial.html
        if (estatusTexto.toLowerCase() === "activo" || estatusTexto.toLowerCase() === "explorando") {
          window.location.href = `./comercial.html?alcaldia=${entornoActualUrl}&colonia=${llaveGeoLimpia}&entorno=productos`;
        }
      }
    });

  }); // Cierre correcto del ciclo eachLayer de Leaflet

  // Auto-ajuste de la cámara e inyección de márgenes de seguridad en píxeles
  if (capaBasePoligonos.getBounds().isValid()) {
    mapaNegosistema.fitBounds(capaBasePoligonos.getBounds(), {
      padding:[10, 10],
      maxZoom: entornoActualUrl === "cdmx" ? 11 : 14,
      animate: true,
      duration: 0.8
    });
  }
}
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 9: GENERADOR DE INTERRUPTORES TACTILES INFERIORES
// ==========================================================================

const RELACION_RAMOS_ESTILOS = {
  "canasta": { texto: "Canasta Básica", color: "color-canasta", hex: "#2e7d32" },
  "comercial": { texto: "Comida Preparada", color: "color-comida", hex: "#ef6c00" },
  "hogar": { texto: "Ferretería y Hogar", color: "color-hogar", hex: "#fbc02d" },
  "salud": { texto: "Salud y Farmacia", color: "color-salud", hex: "#c62828" },
  "moda": { texto: "Variedades y Moda", color: "color-moda", hex: "#e4007c" },
  "mascotas": { texto: "Mascotas", color: "color-mascotas", hex: "#795548" },
  "tecnologia": { texto: "Tecnología", color: "color-tecnologia", hex: "#1565c0" },
  "talleres": { texto: "Talleres y Oficios", color: "color-talleres", hex: "#1565c0" },
  "bienestar": { texto: "Bienestar y Estilo", color: "color-bienestar", hex: "#9b59b6" },
  "asesoria": { texto: "Asesoría y Oficina", color: "color-asesoria", hex: "#9e9e9e" },
  "eventos": { texto: "Hogar y Eventos", color: "color-eventos", hex: "#74001a" },
  "educacion": { texto: "Educación y Apoyo", color: "color-educacion", hex: "#b2bec3" },
  "urgencias": { texto: "Urgencias 24/7", color: "color-urgencias", hex: "#111111" },
  "directorio": { texto: "Directorio Base", color: "color-directorio", hex: "#9e9e9e" }
};

function inyectarBotoneraInterruptoresCamaleon() {
  const contenedorBotonera = document.getElementById("botonera_capas_camaleon");
  if (!contenedorBotonera) return;

  contenedorBotonera.innerHTML = "";

  Object.keys(RELACION_RAMOS_ESTILOS).forEach(idRamo => {
    const configuracionRamo = RELACION_RAMOS_ESTILOS[idRamo];
    const estaActivoActualmente = capasVisiblesEstado[idRamo];

    const botonInterruptor = document.createElement("button");
    botonInterruptor.type = "button";
    botonInterruptor.className = `guia-item-btn ${estaActivoActualmente ? "" : "capa-apagada"}`;
    botonInterruptor.setAttribute("data-ramo", idRamo);

    botonInterruptor.innerHTML = `
      <div class="punto-color-toggle ${configuracionRamo.color}" style="background-color: ${estaActivoActualmente ? configuracionRamo.hex : "transparent"};"></div>
      <div class="guia-item-texto">
        <strong>${configuracionRamo.texto}</strong>
      </div>
    `;

    botonInterruptor.addEventListener("click", () => {
      conmutarEstadoCapaEspecifica(idRamo, botonInterruptor);
    });

    contenedorBotonera.appendChild(botonInterruptor);
  });
}

function conmutarEstadoCapaEspecifica(idRamo, elementoBotonHtml) {
  // Invierte el estado booleano en memoria
  capasVisiblesEstado[idRamo] = !capasVisiblesEstado[idRamo];
  const nuevoEstadoActivo = capasVisiblesEstado[idRamo];
  const configuracionRamo = RELACION_RAMOS_ESTILOS[idRamo];
  const indicadorPuntoColor = elementoBotonHtml.querySelector(".punto-color-toggle");

  if (nuevoEstadoActivo) {
    elementoBotonHtml.classList.remove("capa-apagada");
    if (indicadorPuntoColor) indicadorPuntoColor.style.backgroundColor = configuracionRamo.hex;
  } else {
    elementoBotonHtml.classList.add("capa-apagada");
    if (indicadorPuntoColor) indicadorPuntoColor.style.backgroundColor = "transparent";
  }

  // Ejecuta el rediseño dinámico de pines comerciales sin recargar la estructura
  if (typeof actualizarPinesComercialesEnMapa === "function") {
    actualizarPinesComercialesEnMapa();
  }
}
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 10: AGRUPADOR Y PINTOR DE PINES COMERCIALES
// ==========================================================================

function procesarDatosEntornoComercial() {
  limpiarLienzoYContenedoresAvanzado("comercial");
  inyectarBotoneraInterruptoresCamaleon();
  actualizarEncabezadosYTextosCamaleon();
  actualizarPinesComercialesEnMapa();
  construirSliderOfertasCronologicas();
}

function actualizarPinesComercialesEnMapa() {
  if (!mapaNegosistema || !grupoMarcadoresComerciales) return;

  grupoMarcadoresComerciales.clearLayers();

  // El parser de índices fijos lee de izquierda a derecha la matriz de memoria
  baseDatosNegociosMemoria.forEach(filaNegocio => {
    if (!filaNegocio || filaNegocio.length < 19) return;

    // --- FILTRADO DE PRIMERA LÍNEA (Índices Fijos) ---
    // Columna C (Índice 2): Colonia del Negocio
    // Columna D (Índice 3): Entorno Principal (productos / servicios)
    // --- FILTRADO DE PRIMERA LÍNEA CORREGIDO (Índices Fijos) ---
    const coloniaNegocio = filaNegocio[2].trim().toLowerCase().replace(/_/g, "");
    const entornoNegocio = filaNegocio[3].trim().toLowerCase();

    // Comparación limpia eliminando guiones de la URL y del Sheet
    if (coloniaNegocio !== coloniaActivaUrl.replace(/_/g, "")) return;
    if (entornoNegocio !== entornoActivoUrl) return;


    // Columna E (Índice 4): Capa o Ramo Comercial Principal
    const ramoPrincipal = filaNegocio[4].trim().toLowerCase();

    // Verificación de interruptor de capa encendido/apagado
    if (capasVisiblesEstado[ramoPrincipal] === false) return;

    // Columna P (Índice 15): Coordenada Latitud GPS
    // Columna Q (Índice 16): Coordenada Longitud GPS
    const latitudGps = parseFloat(filaNegocio[15]);
    const longitudGps = parseFloat(filaNegocio[16]);

    if (isNaN(latitudGps) || isNaN(longitudGps)) return;

    // Columna A (Índice 0): ID Único de Suscripción
    // Columna B (Índice 1): Nombre Comercial
    const idSuscripcion = parseInt(filaNegocio[0]) || 1;
    const nombreNegocio = filaNegocio[1].trim();

    // Obtención del color hexadecimal asignado al ramo
    const configuracionEstilo = RELACION_RAMOS_ESTILOS[ramoPrincipal] || RELACION_RAMOS_ESTILOS["directorio"];
    const colorPinHex = configuracionEstilo.hex;

    // Construcción del elemento contenedor del marcador físico personalizado
    const claseAnimacionNivel = obtenerClaseAnimacionPorNivel(idSuscripcion);
    
    const marcadorPersonalizado = L.marker([latitudGps, longitudGps], {
      icon: L.divIcon({
        className: `pin-negosistema pin-nivel${idSuscripcion} ${claseAnimacionNivel}`,
        html: `<div style="background-color: ${colorPinHex}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #ffffff;"></div>`,
        iconSize:[24, 24],
        iconAnchor: [12, 12]
      })
    });

    // Vinculación del evento de apertura del popup camaleónico
    marcadorPersonalizado.bindPopup(() => {
      return generarPopupMuroPrivacidad(filaNegocio);
    }, {
      maxWidth: 280,
      className: "popup-negosistema-contenedor"
    });

    grupoMarcadoresComerciales.addLayer(marcadorPersonalizado);
  });

  // Reajuste automático del zoom del mapa para englobar solo los pines activos filtrados
  if (grupoMarcadoresComerciales.getLayers().length > 0) {
    const limitesPines = grupoMarcadoresComerciales.getBounds();
    mapaNegosistema.fitBounds(limitesPines, { padding:"20px", maxZoom: 16 });
  } else {
    // Si no hay pines, centra el mapa en las coordenadas base configuradas para la alcaldía
    mapaNegosistema.setView([19.3455, -99.0130], 13);
  }
}

function actualizarEncabezadosYTextosCamaleon() {
  const elementoTitulo = document.getElementById("titulo_colonia_dinamico");
  const elementoDescripcion = document.getElementById("descripcion_colonia_dinamica");
  const elementoBotonSwitch = document.getElementById("btn_switch_entorno");

  const nombreFormateado = coloniaActivaUrl.replace(/_/g, " ").toUpperCase();
  const emojiEntorno = entornoActivoUrl === "productos" ? "🛍️" : "🛠️";

  if (elementoTitulo) {
    elementoTitulo.textContent = `${emojiEntorno} ${nombreFormateado}`;
  }
  if (elementoDescripcion) {
    elementoDescripcion.innerHTML = `Explorando el entorno de <b>${entornoActivoUrl.toUpperCase()}</b> de tu comunidad. Usa los filtros inferiores para limpiar el mapa.`;
  }
  if (elementoBotonSwitch) {
    elementoBotonSwitch.textContent = entornoActivoUrl === "productos" ? "🔄 Cambiar a Servicios (Resuelve)" : "🔄 Cambiar a Productos (Compra)";
  }
}

function conmutarSubEntornoCamaleon() {
  const nuevoEntorno = entornoActivoUrl === "productos" ? "servicios" : "productos";
  const urlActual = new URL(window.location.href);
  urlActual.searchParams.set("entorno", nuevoEntorno);
  window.location.href = urlActual.toString();
}
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 11: VALIDADOR DE VACÍOS E INYECTOR DE PULSOS
// ==========================================================================

function validarCeldaVaciaNegosistema(cadenaTextoRaw) {
  if (!cadenaTextoRaw || cadenaTextoRaw.toString().trim() === "") {
    return "Dato no disponible";
  }
  return cadenaTextoRaw.toString().trim();
}

function obtenerClaseAnimacionPorNivel(idNivelSuscripcion) {
  const nivelNumerico = parseInt(idNivelSuscripcion);
  
  switch(nivelNumerico) {
    case 5:
      // Nivel Confianza Premium: Animación de parpadeo Oro Fusión en CSS
      return "animacion-parpadeo-oro";
      
    case 4:
      // Nivel Venta Premium: Animación de pulso Plata Fusión en CSS
      return "animacion-pulso-plata";
      
    case 3:
      // Nivel Información Destacado: Sombra estática bronce sin pulso activo
      return "borde-bronce-estatico";
      
    case 2:
      // Nivel Conocido: Pin básico limpio con color de ramo sin efectos extras
      return "pin-estilo-limpio";
      
    case 1:
    default:
      // Nivel Incógnito / Directorio Base: Gris neutro sin interactividad extra
      return "pin-incognito-gris";
  }
}
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 12: MOTOR DE POPUPS (MURO DE PRIVACIDAD)
// ==========================================================================

function generarPopupMuroPrivacidad(filaNegocio) {
  // --- EXTRACCIÓN DE ÍNDICES FIJOS (Columnas 0 a 18) ---
  const nivelSuscripcion = parseInt(filaNegocio[0]) || 1;
  const nombreComercial  = validarCeldaVaciaNegosistema(filaNegocio[1]);
  const idNegocio        = validarCeldaVaciaNegosistema(filaNegocio[6]); // Columna G
  const sloganComercial  = validarCeldaVaciaNegosistema(filaNegocio[7]); // Columna H
  const listaProductos   = validarCeldaVaciaNegosistema(filaNegocio[8]); // Columna I
  const horariosAtencion = validarCeldaVaciaNegosistema(filaNegocio[9]); // Columna J
  const telefonoWhatsApp = validarCeldaVaciaNegosistema(filaNegocio[10]); // Columna K
  const urlFacebook      = validarCeldaVaciaNegosistema(filaNegocio[11]); // Columna L
  const urlInstagram     = validarCeldaVaciaNegosistema(filaNegocio[12]); // Columna M
  const idVideoYouTube   = validarCeldaVaciaNegosistema(filaNegocio[13]); // Columna N
  const nombreFotoSlide  = validarCeldaVaciaNegosistema(filaNegocio[14]); // Columna O

  // Contenedor base del popup HTML
  let htmlPopup = `<div class="tarjeta-popup">`;

  // --- REGLA BLOQUE A: Nivel 1 en adelante (Básico Obligatorio) ---
  htmlPopup += `<h3>${nombreComercial}</h3>`;
  htmlPopup += `<p style="font-size: 11px; color:#7f8c8d; margin-bottom: 5px;">ID: ${idNegocio}</p>`;

  // --- PRIVACIDAD CAPA 1: Upsell directo si es Nivel 1 (Incógnito) ---
  if (nivelSuscripcion === 1) {
    htmlPopup += `
      <div class="bloque-bloqueado-upsell">
        🔒 Información protegida por el comercio. ¿Eres el dueño? Activa tu nivel Conocido.
      </div>
      <a href="./como-llegar.html?id=${idNegocio}" class="btn-web-comercial" style="background:#7f8c8d;">¿Cómo llegar?</a>
    </div>`;
    return htmlPopup;
  }

  // --- REGLA BLOQUE B: Nivel 2 en adelante ---
  // El nivel 2 solo ve Nombre, ID y enlace básico de navegación
  if (nivelSuscripcion === 2) {
    htmlPopup += `
      <a href="./como-llegar.html?id=${idNegocio}" class="btn-web-comercial">¿Cómo llegar?</a>
    </div>`;
    return htmlPopup;
  }

  // --- REGLA BLOQUE C: Nivel 3 en adelante (Destacado de Información) ---
  if (nivelSuscripcion >= 3) {
    if (sloganComercial !== "Dato no disponible") {
      htmlPopup += `<p class="slogan">"${sloganComercial}"</p>`;
    }
    if (listaProductos !== "Dato no disponible") {
      htmlPopup += `<div class="productos"><strong>Ofrece:</strong> ${listaProductos}</div>`;
    }
    if (horariosAtencion !== "Dato no disponible") {
      htmlPopup += `<p style="font-size: 12px; margin-bottom:8px;">🕒 ${horariosAtencion}</p>`;
    }
  }

  // --- PRIVACIDAD CAPA 2: Upsell si se queda en Nivel 3 y quiere interactividad ---
  if (nivelSuscripcion === 3) {
    htmlPopup += `
      <div class="bloque-bloqueado-upsell" style="margin-top:5px;">
        💡 Contacto directo, fotos y redes sociales disponibles en Nivel Venta.
      </div>
      <a href="./como-llegar.html?id=${idNegocio}" class="btn-web-comercial">¿Cómo llegar?</a>
    </div>`;
    return htmlPopup;
  }

  // --- REGLA BLOQUE D: Nivel 4 y 5 (Premium Interactivos) ---
  // Inyección multimedia de video de YouTube si está disponible
  if (idVideoYouTube !== "Dato no disponible") {
    htmlPopup += `
      <div class="contenedor-video" style="margin-top: 8px;">
        <iframe src="https://youtube.com{idVideoYouTube}" allowfullscreen></iframe>
      </div>`;
  }

  // Enlaces a Redes Sociales del comercio
  let linksRedes = "";
  if (urlFacebook !== "Dato no disponible") linksRedes += `<a href="${urlFacebook}" target="_blank" style="margin-right: 10px; text-decoration:none;">🔵 Facebook</a>`;
  if (urlInstagram !== "Dato no disponible") linksRedes += `<a href="${urlInstagram}" target="_blank" style="text-decoration:none;">🟣 Instagram</a>`;
  if (linksRedes !== "") {
    htmlPopup += `<p style="font-size: 12px; margin: 8px 0;">🌐 ${linksRedes}</p>`;
  }

  // Botón directo de Conversión de Ventas a WhatsApp
  if (telefonoWhatsApp !== "Dato no disponible") {
    const textoMensajeWa = encodeURIComponent(`Hola, vi tu negocio "${nombreComercial}" en el mapa del Negosistema y me interesa pedir informes.`);
    htmlPopup += `
      <a href="https://wa.me{telefonoWhatsApp}?text=${textoMensajeWa}" class="btn-whatsapp-comercial" target="_blank">
        💬 Pedir por WhatsApp
      </a>`;
  }

  // --- REGLA BLOQUE E: Nivel 5 Exclusivo (Landing Page de Confianza) ---
  if (nivelSuscripcion === 5) {
    htmlPopup += `
      <a href="./sitio.html?id=${idNegocio}" class="btn-web-comercial" style="background:#15803d; margin-top:8px;">
        ⭐ Visitar Web Oficial
      </a>`;
  }

  htmlPopup += `</div>`;
  return htmlPopup;
}
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 13: REGLA DE NEGOCIO EN MEMORIA (DOBLE PRESENCIA)
// ==========================================================================

function duplicarRegistrosDoblePresenciaEnMemoria(matrizNegociosOriginal) {
  const matrizProcesadaConDuplicados = [];

  matrizNegociosOriginal.forEach(filaNegocio => {
    if (!filaNegocio || filaNegocio.length < 19) return;

    // Se inyecta el registro original intacto de primera instancia
    matrizProcesadaConDuplicados.push(filaNegocio);

    // --- REGLA DE NEGOCIO DE MÁXIMA PRIORIDAD PARA PREMIUM (+30%) ---
    // Columna A (Índice 0): ID Único de Suscripción (Nivel de Servicio)
    const idSuscripcion = parseInt(filaNegocio[0]) || 1;

    // Solo los niveles 4 (Venta) y 5 (Confianza) tienen derecho a Doble Presencia en el mapa
    if (idSuscripcion >= 4) {
      // Columna F (Índice 5): Capa Extra o Sub-Ramo Comercial Separado por Coma
      const celdaCapaExtra = filaNegocio[5];

      if (celdaCapaExtra && celdaCapaExtra.toString().includes(",")) {
        const segmentosCapas = celdaCapaExtra.toString().split(",");
        const ramoSecundarioLimpio = segmentosCapas[1].trim().toLowerCase();

        // Validamos que el sub-ramo exista dentro de la paleta oficial de 16 colores
        if (RELACION_RAMOS_ESTILOS[ramoSecundarioLimpio]) {
          // Clonación profunda del arreglo de la fila para no alterar el puntero original
          const filaClonadaDuplicada = [...filaNegocio];

          // Sobrescribimos físicamente el Ramo Principal (Columna E / Índice 4) en la copia de memoria
          filaClonadaDuplicada[4] = ramoSecundarioLimpio;

          // Se inserta el duplicado físico en la base de datos temporal del navegador
          matrizProcesadaConDuplicados.push(filaClonadaDuplicada);
        }
      }
    }
  });

  return matrizProcesadaConDuplicados;
}

// Adaptación del punto de entrada del flujo comercial para procesar la regla de negocio
function procesarDatosEntornoComercial() {
  limpiarLienzoYContenedoresAvanzado("comercial");
  
  // Duplicamos los negocios Premium que operan en dos categorías simultáneamente antes de renderizar
  baseDatosNegociosMemoria = duplicarRegistrosDoblePresenciaEnMemoria(baseDatosNegociosMemoria);
  
  inyectarBotoneraInterruptoresCamaleon();
  actualizarEncabezadosYTextosCamaleon();
  actualizarPinesComercialesEnMapa();
  construirSliderOfertasCronologicas();
}
// ==========================================================================
// MOTOR-MAPAS.JS (2026) - PARTE 14: BÚSQUEDA PREDICTIVA Y SLIDER DE OFERTAS
// ==========================================================================

function configurarBuscadorPredictivoCamaleon() {
  const inputBuscador = document.getElementById("input_busqueda_negosistema");
  if (!inputBuscador) return;

  inputBuscador.addEventListener("input", function(eventoInput) {
    const terminoBusqueda = eventoInput.target.value.trim().toLowerCase();

    if (terminoBusqueda === "") {
      actualizarPinesComercialesEnMapa();
      return;
    }

    if (!mapaNegosistema || !grupoMarcadoresComerciales) return;
    grupoMarcadoresComerciales.clearLayers();

    baseDatosNegociosMemoria.forEach(filaNegocio => {
      if (!filaNegocio || filaNegocio.length < 19) return;

      const coloniaNegocio = filaNegocio[2].trim().toLowerCase();
      const entornoNegocio = filaNegocio[3].trim().toLowerCase();

      if (coloniaNegocio !== coloniaActivaUrl) return;
      if (entornoNegocio !== entornoActivoUrl) return;

      const ramoPrincipal = filaNegocio[4].trim().toLowerCase();
      if (capasVisiblesEstado[ramoPrincipal] === false) return;

      // --- CRITERIOS DE COINCIDENCIA PREDICTIVA (Índices Fijos) ---
      // Columna B (Índice 1): Nombre Comercial
      // Columna E (Índice 4): Ramo o Giro Comercial
      // Columna I (Índice 8): Lista de Productos / Palabras Clave
      const nombreComercial = filaNegocio[1].trim().toLowerCase();
      const palabrasProductos = filaNegocio[8].trim().toLowerCase();

      if (
        nombreComercial.includes(terminoBusqueda) || 
        ramoPrincipal.includes(terminoBusqueda) || 
        palabrasProductos.includes(terminoBusqueda)
      ) {
        const latitudGps = parseFloat(filaNegocio[15]);
        const longitudGps = parseFloat(filaNegocio[16]);

        if (isNaN(latitudGps) || isNaN(longitudGps)) return;

        const idSuscripcion = parseInt(filaNegocio[0]) || 1;
        const colorPinHex = RELACION_RAMOS_ESTILOS[ramoPrincipal]?.hex || "#9e9e9e";
        const claseAnimacionNivel = obtenerClaseAnimacionPorNivel(idSuscripcion);

        const marcadorFiltrado = L.marker([latitudGps, longitudGps], {
          icon: L.divIcon({
            className: `pin-negosistema pin-nivel${idSuscripcion} ${claseAnimacionNivel}`,
            html: `<div style="background-color: ${colorPinHex}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #ffffff;"></div>`,
            iconSize:[14, 14],
            iconAnchor: [12, 12]
          })
        });

        marcadorFiltrado.bindPopup(() => generarPopupMuroPrivacidad(filaNegocio), {
          maxWidth: 280,
          className: "popup-negosistema-contenedor"
        });

        grupoMarcadoresComerciales.addLayer(marcadorFiltrado);
      }
    });

    if (grupoMarcadoresComerciales.getLayers().length > 0) {
      mapaNegosistema.fitBounds(grupoMarcadoresComerciales.getBounds(), { padding: [30, 30] });
    }
  });
}

function construirSliderOfertasCronologicas() {
  const contenedorSliderTrack = document.getElementById("contenedor_slider_track");
  if (!contenedorSliderTrack) return;

  contenedorSliderTrack.innerHTML = "";
  
  // Filtrado de promociones vigentes cruzando ID_NEGOCIO
  // CSV Ofertas: Columna 0 = ID_NEGOCIO, Columna 1 = Titulo, Columna 2 = Descuento, Columna 3 = Caducidad (YYYY-MM-DD)
  const fechaHoySistema = new Date();
  let ofertasContadasInyectadas = 0;

  baseDatosOfertasMemoria.forEach(filaOferta => {
    if (!filaOferta || filaOferta.length < 4) return;

    const idNegocioOferta = filaOferta[0].trim();
    const tituloPromocion = filaOferta[1].trim();
    const textoDescuento  = filaOferta[2].trim();
    const fechaCaducidad  = new Date(filaOferta[3].trim());

    // Validación cronológica estricta: omitir si ya expiró
    if (fechaCaducidad < fechaHoySistema) return;

    // Buscamos si el negocio pertenece a la colonia activa actual para segmentar el carrusel
    const negocioAsociado = baseDatosNegociosMemoria.find(n => n[6].trim() === idNegocioOferta);
    if (!negocioAsociado || negocioAsociado[2].trim().toLowerCase() !== coloniaActivaUrl) return;

    ofertasContadasInyectadas++;

    const slideGrupoElemento = document.createElement("div");
    slideGrupoElemento.className = "slide-group";

    slideGrupoElemento.innerHTML = `
      <div class="feature-card-link">
        <div class="feature-card">
          <div class="card-image">
            <img src="./ofertas/default.png" alt="${tituloPromocion}">
          </div>
          <div class="card-content">
            <h3>${tituloPromocion}</h3>
            <p>${textoDescuento}</p>
            <small style="color: #c62828; font-weight: bold; display: block; margin-top: 5px;">Vence: ${filaOferta[3]}</small>
          </div>
        </div>
        <a href="https://wa.me{negocioAsociado[10]}" class="btn-wa-float" target="_blank">¡PEDIR!</a>
      </div>
    `;

    contenedorSliderTrack.appendChild(slideGrupoElemento);
  });

  // Si no hay ofertas activas en la colonia, inyecta la tarjeta demo de respaldo sin romper el viewport
  if (ofertasContadasInyectadas === 0) {
    contenedorSliderTrack.innerHTML = `
      <div class="slide-group">
        <div class="feature-card-link">
          <div class="feature-card">
            <div class="card-image">
              <img src="./Imagenes/caballete.png" alt="Muestra">
            </div>
            <div class="card-content">
              <h3>Buscando Ofertas Activas...</h3>
              <p>Las promociones cambian según la colonia elegida.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Vinculación final de la inicialización de eventos para el buscador predictivo
function inicializarEntornoComercial() {
  const contenedorMapa = document.getElementById("mapa_seccion");
  if (!contenedorMapa) return;
  
  if (!coloniaActivaUrl) {
    window.location.href = "./index.html";
    return;
  }
  
  mapaNegosistema = L.map("mapa_seccion");
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; Negosistema 2026"
  }).addTo(mapaNegosistema);
  
  grupoMarcadoresComerciales = L.featureGroup().addTo(mapaNegosistema);
  
  configurarBuscadorPredictivoCamaleon(); // Activación de la escucha en tiempo real
  ejecutarFlujoDatosComercial();
}
