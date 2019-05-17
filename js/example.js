var startDate = new Date();
startDate.setUTCHours(0, 0, 0, 0);

var map = L.map('map', {
    zoom: 12,
    fullscreenControl: true,
    center: [39.3, 4]
});

// start of TimeDimension manual instantiation
var timeDimension = new L.TimeDimension({
        period: "PT1M",
    });
// helper to share the timeDimension object between all layers
map.timeDimension = timeDimension; 
// otherwise you have to set the 'timeDimension' option on all layers.

var player        = new L.TimeDimension.Player({
    transitionTime: 100, 
    loop: false,
    startOver:true
}, timeDimension);

var timeDimensionControlOptions = {
    player:        player,
    timeDimension: timeDimension,
    position:      'bottomleft',
    autoPlay:      true,
    minSpeed:      1,
    speedStep:     0.5,
    maxSpeed:      15,
    timeSliderDragUpdate: true
};

var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);
map.addControl(timeDimensionControl);

var icon = L.icon({
    iconUrl: 'img/locomotive.png',
    iconSize: [22, 22],
    iconAnchor: [10, 25]
});

var geojsonMarkerOptions = {
    radius: 4,
    fillColor: "#000",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};



var customLayer = L.geoJson(null, {
    pointToLayer: function (feature, latLng) {
        if (feature.properties.hasOwnProperty('last')) {
            return new L.Marker(latLng, {
                icon: icon
            });
        }
        return L.circleMarker(latLng);
    }
});

var gpxLayer = omnivore.gpx('data/wvstrain1.gpx', null, customLayer).on('ready', function() {
    map.fitBounds(gpxLayer.getBounds(), {
        paddingBottomRight: [40, 40]
    });
});


var gpxTimeLayer = L.timeDimension.layer.geoJson(gpxLayer, {
    updateTimeDimension: true,
    addlastPoint: true,
    waitForReady: true
});

var pioneerLayer = L.tileLayer('https://a.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=db5ae1f5778a448ca662554581f283c5', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);;

var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var baseMaps = {
    "Pioneer layer": pioneerLayer,
    "OSM Layer": osmLayer,
};

var overlayMaps = {
    "Train 1": gpxTimeLayer,
//    "Train 2": trainstops,
};

//var controlLayers = L.control.layers().addTo(map);



//var baseLayers = getCommonBaseLayers(map); // see baselayers.js
//osmLayer.addTo(map);
var controlLayers = L.control.layers(baseMaps, overlayMaps).addTo(map);

$.getJSON("data/trainstops.geojson",function(Data){
    var trainstops = L.geoJson(Data, {
        pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
	    },
        onEachFeature: function (feature, layer) {
			layer.bindPopup(feature.properties.Station);
        }
	});
    trainstops.addTo(map);
  controlLayers.addOverlay(trainstops, 'Train Stops');
});
gpxTimeLayer.addTo(map);
