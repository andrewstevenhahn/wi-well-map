//Code adapted from https://cartographicperspectives.org/index.php/journal/article/view/cp76-donohue-et-al/1307

$(document).ready(function () {
    var wells;
    var map = L.map('map').setView([44.7, -89.7], 7);

    function processData(data) {
        var timestamps = [];
        var min = Infinity;
        var max = -Infinity;

        for (var feature in data.features) {
            var properties = data.features[feature].properties;
            for (var attribute in properties) {

                if (['yr2010','yr2011','yr2012','yr2013','yr2014','yr2015','yr2016','yr2017','yr2018','yr2019','yr2020','yr2021'].includes(attribute)) {
                    
                    attribute = attribute.replace('yr','')
                    
                    if ( !timestamps.includes(attribute) ) {
                        timestamps.push(attribute);
                    }

                    if (properties[attribute] < min) {
                        min = properties[attribute];
                    }

                    if (properties[attribute] > max) {
                        max = properties[attribute];
                    }
                }
            }

        }

        return {
            timestamps: timestamps,
            min: min,
            max: max
        }
    }

    function calcPropRadius(attributeValue) {
        var scaleFactor = 20;
        var area = attributeValue * scaleFactor;
        return Math.sqrt(area/Math.PI)*2;
    }

    function updatePropSymbols(timestamp) {
        
        wells.eachLayer(function(layer) {
            var timestamp2 = "yr" + timestamp.toString();
            var prevtime = "yr" + (timestamp-1).toString();
            var props = layer.feature.properties;
            var radius = calcPropRadius(props[timestamp2]);
            var newwells = props[timestamp2] - props[prevtime];
            console.log(String(props.timestamp2) + "-" + String(props.prevtime))
            if (isNaN(newwells)) {
                var newwells = 0;
            }
            var popupContent = "<b> " + props["TWP"] + "N " + props["RNG"] + props["DIR_ALPHA"] + "</b><br>"
                    +"<i>" + String(props[timestamp2]) + " total high-capacity <br /> wells built between <br /> 2010 and "+ String(timestamp) +"</i>"
            
            layer.setRadius(radius)
            layer.bindPopup(popupContent, { offset: new L.Point(0,-radius)});

        });
    }

    function createPropSymbols(timestamps, data) {
        wells = L.geoJson(data, {

            pointToLayer: function(feature,latlng) {
  
                return L.circleMarker(latlng, {
                    fillColor: "#708598",
                    color: "#537898",
                    weight: 1,
                    fillOpacity: 0.6

                }).on({
                    
                    mouseover: function(e) {
                        this.openPopup();
                        this.setStyle({color: "yellow"})

                    },
                    mouseout: function(e) {
                        this.closePopup();
                        this.setStyle({color:"#537898"})
                    }

                });

            }

        }).addTo(map);

        updatePropSymbols(timestamps[0]);

    }

    function createLegend(min, max) {

        min = 1
        max = 20

        function roundNumber(inNumber) {

                return (Math.round(inNumber/1) * 1);  
        }

        var legend = L.control( { position: 'bottomright' } );

        legend.onAdd = function(map) {

        var legendContainer = L.DomUtil.create('div', 'legend');  
        var symbolsContainer = L.DomUtil.create('div', "symbolsContainer");
        var classes = [roundNumber(min), roundNumber((max-min)/2), roundNumber(max)]; 
        var legendCircle;  
        var lastRadius = 0;
        var currentRadius;
        var margin;

        L.DomEvent.addListener(legendContainer, 'mousedown', function(e) { 
            L.DomEvent.disableClickPropagation(this); 
        });  

        $(legendContainer).append("<h2 id='legendTitle'>New Wells Built<br>since 2010</h2>");
        
        for (var i = 0; i <= classes.length-1; i++) {  

            legendCircle = L.DomUtil.create("div", "legendCircle");  
            
            currentRadius = calcPropRadius(classes[i]);
            
            margin = -currentRadius - lastRadius - 2;

            $(legendCircle).attr("style", "width: " + currentRadius*2 + 
                "px; height: " + currentRadius*2 + 
                "px; margin-left: " + margin + "px" );				
            $(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");

            $(symbolsContainer).append(legendCircle);

            lastRadius = currentRadius;

        }

        $(legendContainer).append(symbolsContainer); 

        return legendContainer; 

        };

        legend.addTo(map);  

    } // end createLegend();

    function createSliderUI(timestamps) {

        var sliderControl = L.control({ position: 'bottomleft'} );

        sliderControl.onAdd = function(map) {

            var slider = L.DomUtil.create("input", "range-slider");

            L.DomEvent.disableClickPropagation(slider);

            $(slider)
                .attr({'type':'range', 
                    'max': timestamps[timestamps.length-1], 
                    'min': timestamps[0], 
                    'step': 1,
                    'value': String(timestamps[0])})
                .on('input change', function() {
                updatePropSymbols($(this).val().toString());
                    $(".temporal-legend").text(this.value);
            });
            return slider;
        }

        sliderControl.addTo(map)
        createTemporalLegend(timestamps[0]) 
    }

	function createTemporalLegend(startTimestamp) {

		var temporalLegend = L.control({ position: 'bottomleft' }); 

		temporalLegend.onAdd = function(map) { 
			var output = L.DomUtil.create("output", "temporal-legend");
 			$(output).text(startTimestamp)
			return output; 
		}

		temporalLegend.addTo(map); 
	}

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 12,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
    
    $.getJSON("data/plss_centroids_wellconstruction.geojson")
            .done(function(data) {
                var info = processData(data)
                createPropSymbols(info.timestamps, data)
                createLegend(info.min,info.max);
                createSliderUI(info.timestamps);
            })
    .fail(function() {alert("There has been a problem loading the data.")});

});