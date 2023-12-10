// Creating the map object
let myMap = L.map("map", {
    center: [-37.8136, 144.9631], // Center coordinates
    zoom: 3, // Initial zoom level
    maxBounds: L.latLngBounds([-90, -180], [90, 180]), // Set the max bounds to cover the whole map
});

// Adding the tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(myMap);

// Store the API query variables.
// For docs, refer to https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php.
let earthQuakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to determine the marker color based on depth
function getMarkerColor(depth) {
    if (depth > 90) return "#330066"; // purple
    else if (depth > 70) return "#663399"; // indigo
    else if (depth > 50) return "#9900CC"; // violet
    else if (depth > 30) return "#CC00FF"; // fuchsia
    else if (depth > 10) return "#FF3399"; // magenta
    else return "#FF66CC"; // light pink
}

// Use D3.js to fetch and process data
d3.json(earthQuakeURL).then(function (data) {
    // Create a function to determine the marker size based on magnitude
    function getMarkerSize(magnitude) {
        return magnitude * 5;
    }

    // Create a function to format the timestamp to a human-readable date
    function formatDate(timestamp) {
        let date = new Date(timestamp);
        return date.toLocaleString();
    }

    // Create a function to bind popups to each marker
    function onEachFeature(feature, layer) {
        layer.bindPopup(`
            <strong>Location:</strong> ${feature.properties.place}<br>
            <strong>Magnitude:</strong> ${feature.properties.mag}<br>
            <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km<br>
            <strong>Date:</strong> ${formatDate(feature.properties.time)}
        `);
    }

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

    // Create a GeoJSON layer with the retrieved data
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getMarkerSize(feature.properties.mag),
                fillColor: getMarkerColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: onEachFeature
    }).addTo(myMap);
});
