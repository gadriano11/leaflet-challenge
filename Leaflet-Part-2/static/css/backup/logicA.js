// Creating the map object
let myMap = L.map("map", {
    center: [40.7, -73.95],
    zoom: 11,
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

    // Create a function to bind popups to each marker
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<strong>Location:</strong> ${feature.properties.place}<br><strong>Magnitude:</strong> ${feature.properties.mag}<br><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`);
    }

    // Create a legend
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [-10, 10, 30, 50, 70, 90];
        let labels = [];

        for (let i = 0; i < depths.length; i++) {
            div.innerHTML += `<i style="background:${getMarkerColor(depths[i] + 1)}"></i> ${depths[i]}${(depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km' : '+')}`;
        }

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
