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
        var scaleFactor = 15;
        var area = attributeValue * scaleFactor;
        return Math.sqrt(area/Math.PI)*2;
    }

    function updatePropSymbols(timestamp) {
        
        wells.eachLayer(function(layer) {
            var timestamp2 = "yr" + timestamp.toString();
            var props = layer.feature.properties;
            var radius = calcPropRadius(props[timestamp2]);
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

    function createToggle() {
         
        var togglebutton = L.control({position: 'topright'});
        
        togglebutton.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'toggle');
            div.innerHTML = '<div class="form-check"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault"><label class="form-check-label" for="flexCheckDefault">Show Central Sands<br>Ecological Landscapes</label></div>';
            L.DomEvent.disableClickPropagation(div);
            return div
        }

        togglebutton.addTo(map)
        
        L.DomEvent.disableClickPropagation(togglebutton);

    }


    var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    OpenStreetMap_Mapnik.addTo(map);

    $.getJSON("data/plss_centroids_wellconstruction.geojson")
            .done(function(data) {
                var info = processData(data)
                let showSands = false;
                createPropSymbols(info.timestamps, data)
                createLegend(info.min,info.max);
                createSliderUI(info.timestamps);
                createToggle();
                document.getElementsByClassName("toggle")[0].addEventListener("mousedown", function() {
                    $.getJSON("data/centralsands_2.geojson", function(data){
                        var sandslayer = L.geoJson(data, {
                            style: {
                                fillColor: "#adadad",
                                fillOpacity: 0.6,
                                color: "#272827",
                                weight: 1,
                                className: "sands"
                            }
                        })

                        if (document.getElementsByClassName("toggle")[0].checked == false) {
                            $('.sands.leaflet-clickable').remove();
                            document.getElementsByClassName("toggle")[0].checked = true;
                        } else {
                            map.addLayer(sandslayer);
                            sandslayer.bringToBack();
                            document.getElementsByClassName("toggle")[0].checked = false;
                        }

                    });
                });


            })
    .fail(function() {alert("There has been a problem loading the data.")});

});