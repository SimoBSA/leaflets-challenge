// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
});

// Create the earthquake and tectonic plate layer groups
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

// Create the map object with center and zoom options.
let map = L.map("map", {
  center: [20, 0],
  zoom: 2,
  layers: [basemap, earthquakes] // Start with basemap and earthquakes visible
});

// Then add the 'basemap' tile layer to the map.
// (Already added in the map initialization.)

// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
let baseMaps = {
  "Base Map": basemap,
  "Street Map": streetmap
};

let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on the map.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth > 90) return "#d73027";
    if (depth > 70) return "#fc8d59";
    if (depth > 50) return "#fee08b";
    if (depth > 30) return "#d9ef8b";
    if (depth > 10) return "#91cf60";
    return "#1a9850";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude ? magnitude * 4 : 1;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<h3>Location: ${feature.properties.place}</h3><hr>
         <p>Magnitude: ${feature.properties.mag}</p>
         <p>Depth: ${feature.geometry.coordinates[2]} km</p>`
      );
    }
  }).addTo(earthquakes);

  earthquakes.addTo(map);
});

// Create a legend control object.
let legend = L.control({
  position: "bottomright"
});

// Then add all the details for the legend
legend.onAdd = function () {
  let div = L.DomUtil.create("div", "info legend");
  let depthIntervals = [-10, 10, 30, 50, 70, 90];
  let colors = [
    "#1a9850",
    "#91cf60",
    "#d9ef8b",
    "#fee08b",
    "#fc8d59",
    "#d73027"
  ];

  for (let i = 0; i < depthIntervals.length; i++) {
    div.innerHTML +=
      `<i style="background:${colors[i]}"></i> ${depthIntervals[i]}${(depthIntervals[i + 1] ? `&ndash;${depthIntervals[i + 1]}<br>` : '+')}`;
  }

  return div;
};

// Finally, add the legend to the map.
legend.addTo(map);

// OPTIONAL: Step 2
// Make a request to get our Tectonic Plate geoJSON data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
  L.geoJson(plate_data, {
    color: "orange",
    weight: 2
  }).addTo(tectonicPlates);

  tectonicPlates.addTo(map);
});