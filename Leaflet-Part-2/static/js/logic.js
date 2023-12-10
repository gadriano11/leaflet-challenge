// Creating the map object
let myMap = L.map("map", {
    center: [-37.8136, 144.9631], // Center coordinates
    zoom: 3, // Initial zoom level
    maxBounds: L.latLngBounds([-90, -180], [90, 180]), // Set the max bounds to cover the whole map
});

// Adding base maps
let streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 0,
    maxZoom: 20,
});

// Google Streets as a base map
// May be used as alternative but keep in mind that its web mercator is different hence the css would need to be altered.
// let googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
//     maxZoom: 20,
//     subdomains:['mt0','mt1','mt2','mt3']
// });

// Use Jawg maps as alternative base map
let jawgMap = L.tileLayer('https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
	attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 20,
	subdomains: 'abcd',
	accessToken: 'YFu6bfia0zScJPcxS9nZDym7FhfdNdd9qpJfsfuO7FZUdGBghN9gDYZLwmWXrc2A'
});

// Store the API query variables.
// For docs, refer to https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php.
let earthQuakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

let tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


// Function to determine the marker color based on depth
function getMarkerColor(depth) {
    if (depth > 90) return "#330066"; // purple
    else if (depth > 70) return "#663399"; // indigo
    else if (depth > 50) return "#9900CC"; // violet
    else if (depth > 30) return "#CC00FF"; // fuchsia
    else if (depth > 10) return "#FF3399"; // magenta
    else return "#FF66CC"; // light pink
}

// Use D3.js to fetch and process earthquake data
d3.json(earthQuakeURL).then(function (earthquakeData) {
    // Create a GeoJSON layer with the earthquake data
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 5,
                fillColor: getMarkerColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`
                <strong>Location:</strong> ${feature.properties.place}<br>
                <strong>Magnitude:</strong> ${feature.properties.mag}<br>
                <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km<br>
                <strong>Date:</strong> ${new Date(feature.properties.time).toLocaleString()}
            `);
        }
    });
    // Create a legend
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'legend');
    
        // Define the depth ranges
        let depthRanges = [
            { start: -10, end: 10 },
            { start: 10, end: 30 },
            { start: 30, end: 50 },
            { start: 50, end: 70 },
            { start: 70, end: 90 },
            { start: 90, end: Infinity } // "Infinity" for depths greater than 90
        ];

        // Sort depth ranges in ascending order
        depthRanges.sort((a, b) => a.start - b.start);
    
        // Create legend items
        depthRanges.forEach(range => {
            const rangeText = (range.start === 90) ? '90+' : `${range.start} - ${range.end}`;
            div.innerHTML += `
                <div class="color-scale-item">
                    <div class="legend-color" style="background:${getMarkerColor((range.start + range.end) / 2)}"></div>
                    <div class="legend-text">${rangeText} km</div>
                </div>`;
        });

        return div;
    };

        legend.addTo(myMap);

    // Use the local GeoJSON file for tectonic plates
    d3.json(tectonicPlatesURL).then(function (tectonicPlateData) {
        // Create a GeoJSON layer with the tectonic plate data
        let tectonicPlates = L.geoJSON(tectonicPlateData, {
            style: {
                color: "orange",
                weight: 2
            }
        });

        // Create overlays
        let overlayMaps = {
            "Earthquakes": earthquakes,
            "Tectonic Plates": tectonicPlates,
        };

        // Create a base maps object
        let baseMaps = {
            "Street Map": streetMap,
            "Terrain Map": jawgMap, // Add Google Streets as a base map
        };

        // Add base maps and overlays to the map
        streetMap.addTo(myMap); // Default base map
        L.control.layers(baseMaps, overlayMaps).addTo(myMap);

        // Add earthquake data as the default overlay
        earthquakes.addTo(myMap);
    });

});
