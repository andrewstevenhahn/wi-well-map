console.log("Hello")

/* Example from Leaflet Quick Start Guide*/
$(document).ready(function () {
    var cities;
    var map = L.map('map').setView([43.7844, -88.7879], 6);

    L.tileLayer(
        'https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            }).addTo(map);
    
    console.log("Does this work")
});

//add tile layer...replace project id and accessToken with your own
// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
//     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
//     maxZoom: 18,
//     id: 'username.ab12cdef',
//     accessToken: 'pk.eyJ1IjoiYXNoYWhuIiwiYSI6ImNrd2NwcG03eWd0eXYyb3BnNWw3OG1oNnUifQ.RrIu8UiXFUike24U2SlJmg'
// }).addTo(map);

// var marker = L.marker([51.5, -0.09]).addTo(map);

// var circle = L.circle([51.508, -0.11], 500, {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5
// }).addTo(map);

// var polygon = L.polygon([
//     [51.509, -0.08],
//     [51.503, -0.06],
//     [51.51, -0.047]
// ]).addTo(map);

// marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
// circle.bindPopup("I am a circle.");
// polygon.bindPopup("I am a polygon.");

// var popup = L.popup()
//     .setLatLng([51.5, -0.09])
//     .setContent("I am a standalone popup.")
//     .openOn(map);

// var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }
