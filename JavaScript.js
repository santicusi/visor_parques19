var map; // Variable global para el mapa
var icono3MarkersGroup = L.layerGroup();


document.addEventListener('DOMContentLoaded', function() {

    var bounds2 = L.latLngBounds(
        L.latLng(3.480364, -76.595351), // Suroeste del límite (ajusta estas coordenadas)
        L.latLng(3.387528, -76.508388)    // Noreste del límite (ajusta estas coordenadas)
    );


    map = L.map('map', {
        center: [3.426679, -76.542534],
        zoom: 14,
        minZoom: 13, // Ajusta el nivel mínimo de zoom aquí
        maxZoom: 19, // Ajusta el nivel máximo de zoom aquí
        maxBounds: bounds2,
        maxBoundsViscosity: 1.0 
    });

    // Definir las capas base
    var calles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map data © OpenStreetMap contributors'
    });

    var satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles © Esri'
    });

    var blanco = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
         maxZoom: 19,
         attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, tiles by <a href="https://carto.com/attributions">CARTO</a>'
     }).addTo(map);

    // Añadir una capa base por defecto
    blanco.addTo(map);

    // Crear un objeto con las capas base para el control de capas
    var baseMaps = {
        "Calles": calles,
        "Satélite": satelite,
        "Blanco": blanco
    };
    

    var overlayMaps = {
        "Ruido": icono3MarkersGroup
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    icono3MarkersGroup.addTo(map);

    // URL de tu archivo SVG
    var svgUrl = 'capa/comuna19.svg';

    // Establecer límites aproximados para la ciudad de Cali, Colombia
    var bounds = [[3.506026, -76.743246], [3.338051, -76.305039]]; // Coordenadas aproximadas

    // Crear una capa de imagen y añadirla al mapa con los límites especificados
    var svgLayer = L.imageOverlay(svgUrl, bounds);
    svgLayer.addTo(map);


    // Funciones para crear iconos
    function createIcon(size) {
        return L.icon({
            iconUrl: 'capa/icono2.svg',
            iconSize: size,
            iconAnchor: [size[0] / 2, size[1] / 2]
        });
    }

    function createClickedIcon(size) {
        return L.icon({
            iconUrl: 'capa/icono1.svg',
            iconSize: size,
            iconAnchor: [size[0] / 2, size[1] / 2]
        });
    }

    function updateIconSize(zoomLevel) {
        var size = zoomLevel * 1.5;
        return [size, size];
    }

    var currentMarker = null;
    var isEditing = false;

    map.on('click', function(e) {
        if (isEditing) {
            return; 
        }

        if (currentMarker) {
            map.removeLayer(currentMarker); 
        }

        var iconSize = updateIconSize(map.getZoom());
        var customIcon = createIcon(iconSize);
        currentMarker = L.marker(e.latlng, {icon: customIcon}).addTo(map);
        document.getElementById("myForm").reset(); 
        document.querySelector('.info-box').style.display = 'block';
        document.getElementById('latitud').value = e.latlng.lat;
        document.getElementById('longitud').value = e.latlng.lng;
        document.getElementById('id').value = ''; 
        isEditing = false;
    });


    function submitForm() {
        var formData = new FormData(document.getElementById("myForm"));
        console.log("Form Data antes de enviar:", Object.fromEntries(formData.entries()));
        var url = isEditing ? 'codigo3.php' : 'codigo.php';

        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Respuesta de red no fue OK');
            }
            return response.text();  // Cambiado de json() a text()
        })
        .then(text => {
            console.log("Respuesta del servidor:", text); // Imprime la respuesta completa
            return JSON.parse(text); // Intenta analizar la respuesta como JSON
        })
        .then(data => {
            // Resto del manejo de la respuesta
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error en la solicitud: ' + error);
        });
        
        return false; // Evitar el envío tradicional del formulario
    }

    document.getElementById("myForm").onsubmit = submitForm;

    function cargarDatosEnFormulario(marcador) {
        document.getElementById('parques').value = marcador.parques;
        document.getElementById('descripcion').value = marcador.descripcion;
        document.getElementById('latitud').value = marcador.latitud;
        document.getElementById('longitud').value = marcador.longitud;
        document.getElementById('id').value = marcador.id; // Asegúrate de que este valor no sea undefined
        document.querySelector('.info-box').style.display = 'block';
        isEditing = true; 
    }

    // Recuperar marcadores existentes
    fetch('codigo2.php')
    .then(response => response.json())
    .then(data => {
        todosLosMarcadores = []; // Vaciar el arreglo antes de llenarlo
        data.forEach(function(marcador) {
            var iconSize = updateIconSize(map.getZoom());
            var customIcon = createIcon(iconSize);
    
            var marker = L.marker([marcador.latitud, marcador.longitud], {icon: customIcon})
            .addTo(map)
            .bindPopup(marcador.parques + "<br>" + marcador.descripcion);
    
            // Agregar el marcador y su tipo al arreglo para el filtrado
            todosLosMarcadores.push({
                marker: marker,
                tipo: marcador.parques
            });

            marker.on('click', function() {
                var clickedIconSize = updateIconSize(map.getZoom());
                var clickedIcon = createClickedIcon(clickedIconSize);
                marker.setIcon(clickedIcon);
            });
    
            marker.on('click', function() {
                cargarDatosEnFormulario(marcador);
                currentMarker = marker;
                isEditing = true;
            });
        });
    })
    .catch(error => console.error('Error:', error));

    var todosLosMarcadores = [];

    // Función para filtrar marcadores
    function filtrarMarcadores() {
        var tipoSeleccionado = document.getElementById('filtroParques').value;
        todosLosMarcadores.forEach(marcador => {
            if (tipoSeleccionado === 'Todos' || marcador.tipo === tipoSeleccionado) {
                marcador.marker.addTo(map); // Mostrar marcador
            } else {
                map.removeLayer(marcador.marker); // Ocultar marcador
            }
        });
    }
    
    // Evento de clic para el botón de filtrar
    document.getElementById('botonFiltrar').addEventListener('click', filtrarMarcadores);

    var puntosCoordenadas = [
        [3.432479, -76.546754],
        [3.435000, -76.548000],
        [3.433336, -76.539790],
        [3.414712, -76.549186],
        [3.406101, -76.550988],
        [3.427821, -76.542362],
        [3.423136, -76.550088],
        [3.418924, -76.547809],
    ];

    // Crear y añadir marcadores al mapa
    puntosCoordenadas.forEach(function(coordenadas) {
        var marker = crearIcono3Marker(coordenadas);
        icono3MarkersGroup.addLayer(marker);
    });

    // Evento de cambio de zoom
    map.on('zoomend', function() {
        actualizarTamañoIcono3Markers();
    });

    function crearIcono1Marker(marcador) {
        var iconSize = updateIconSize(map.getZoom());
        var customIcon = L.icon({
            iconUrl: 'capa/icono1.svg',
            iconSize: iconSize,
            iconAnchor: [iconSize[0] / 2, iconSize[1] / 2]
        });
    
        var marker = L.marker([marcador.latitud, marcador.longitud], {icon: customIcon})
                      .bindPopup(marcador.parques + "<br>" + marcador.descripcion);
        return marker;
    }


    function crearIcono3Marker(coordenadas) {
        var iconSize = obtenerTamañoIcono(map.getZoom());
        var svgIcon = L.icon({
            iconUrl: 'capa/icono3.svg',
            iconSize: iconSize,
            iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
            popupAnchor: [1, -34]
        });
    
        var marker = L.marker(coordenadas, {icon: svgIcon})
                      .bindPopup("¡¡RUIDO EN ESTA ZONA!!");
        return marker;
    }
    
    function obtenerTamañoIcono(zoomLevel) {
        var size = zoomLevel >= 12 ? [20, 35] : [zoomLevel * 2.5, zoomLevel * 6.25];
        return size;
    }
    
    function actualizarTamañoSvgMarkers() {
        var newSize = obtenerTamañoIcono3Markers(map.getZoom());
        svgMarkersList.forEach(function(marker) {
            marker.setIcon(L.icon({
                iconUrl: 'capa/icono3.svg',
                iconSize: newSize,
                iconAnchor: [newSize[0] / 2, newSize[1] / 2],
                popupAnchor: [1, -34]
            }));
        });
    }

    function toggleInfoBox() {
        var infoBox = document.querySelector('.info-box');
        var mapDiv = document.getElementById('map');
    
        if (infoBox.style.display === 'none') {
            infoBox.style.display = 'block'; // Muestra la información
            mapDiv.classList.replace('col-md-9', 'col-md-6'); // Ajusta el ancho del mapa
        } else {
            infoBox.style.display = 'none'; // Oculta la información
            mapDiv.classList.replace('col-md-6', 'col-md-9'); // Devuelve el mapa a su ancho original
        }
    }

});



