google.maps.event.addDomListener(window, 'load', init);
var map;
function init() {
    var mapOptions = {
        center: new google.maps.LatLng(37.988587,-121.850282),
        zoom: 9,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.DEFAULT,
        },
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        scaleControl: true,
        scrollwheel: true,
        panControl: true,
        streetViewControl: false,
        draggable : true,
        overviewMapControl: true,
        overviewMapControlOptions: {
            opened: false,
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    }
    var mapElement = document.getElementById('dispensarymap');
    map = new google.maps.Map(mapElement, mapOptions);
    var iw = new google.maps.InfoWindow();
    var openLocation = null;
    var markers = [];
    var locations = {
        'Northern California': {
            'Oakland': [
                {
                    name: 'Harborside Health Center',
                    phone: '(888) 994-2726',
                    website: 'harborsidehealthcenter.com',
                    lat: 37.7839064,
                    lng: -122.2423205,
                    street_address: '1840 Embarcadero',
                    city_address: 'Oakland, CA 94606'
                }
            ],
            'Sebastopol': [
                {
                    name: 'Peace In Medicine',
                    phone: '(707) 823-4206',
                    website: 'peaceinmedicine.org',
                    lat: 38.4024673,
                    lng: -122.8202872,
                    street_address: '6771 Sebastopol Ave #100',
                    city_address: 'Sebastopol, CA 95472'
                }
            ]
        },
        'Washington': {
            'Seattle': [
                {
                    name: 'Choice Wellness',
                    phone: '(206) 682-3015',
                    website: '',
                    lat: 47.691432,
                    lng: -122.344278,
                    street_address: '8600 Aurora Ave N',
                    city_address: 'Seattle, WA 98103'
                },
                {
                    name: 'Dockside',
                    phone: '(206) 420-4837',
                    website: 'docksidecoop.org',
                    lat: 47.652386,
                    lng: -122.355659,
                    street_address: '223 N 36th St',
                    city_address: 'Seattle, WA 98103'
                }
            ]
        }
    };
    for (var region in locations) {
        var cities = locations[region];
        for (var city in cities) {
            var dispensaries = cities[city];
            for (var i = 0; i < dispensaries.length; i++) {
                var dispensary = dispensaries[i];
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(dispensary.lat, dispensary.lng),
                    map: map,
                    title: dispensary.name,
                    tel: dispensary.phone,
                    web: dispensary.website
                });
                if (dispensary.website.length == 0) {
                    link = '';
                } else if (dispensary.website.substring(0, 7) != "http://") {
                    link = "http://" + dispensary.website;
                } else {
                    link = dispensary.website;
                }
                marker.street_address = dispensary.street_address;
                marker.city_address = dispensary.city_address;
                markers.push(marker);
                bindInfoWindow(marker, map, dispensary);
            }
        }
    }
    function bindInfoWindow(marker, map, dispensary) {
        google.maps.event.addListener(marker, 'click', function() {
            if (openLocation === marker) {
                iw.close();
                openLocation = null;
            } else {
                var html= "<div style='color:#000;background-color:#fff;padding:5px;'><h4>"+dispensary.name+"</h4><p>"+dispensary.street_address+", "+dispensary.city_address+"</p><p>"+dispensary.phone+"</p>";
                if (link.length > 0) {
                    html = html.concat("<p><a href='"+link+"'>"+dispensary.website+"</a></p>");
                }
                html = html.concat('</div>');
                iw.setContent(html);
                iw.open(map,marker);
                openLocation = marker;
            }
        });
    }
    function constructListItem(marker) {
        var li = $('<li><h3>' + marker.title + '</h3>' + marker.city_address + '</li>');
        li.click(function () {new google.maps.event.trigger( marker, 'click' )});
        li.hover(function () {marker.setIcon()})
        return li;
    }
    google.maps.event.addListener(iw, 'closeclick', function () {
        openLocation = null;
    });
    google.maps.event.addListener(map, "click", function() {
        iw.close();
    });
    google.maps.event.addListener(map, "bounds_changed", function () {
        var list = $('#dispensary-list');
        list.html('');
        list.css({"pointer-events":"none","background-image":"url('img/ajax-loader.gif')"});
    })
    google.maps.event.addListener(map, "idle", function() {
        var list = $('#dispensary-list');
        list.html('');
        list.css({"pointer-events": "auto", "background-image": "none"});
        for(var i = markers.length, bounds = map.getBounds(); i--;) {
            if( bounds.contains(markers[i].getPosition()) ){
                list.append(function () {return constructListItem(markers[i])});
            }
        }
    });
    google.maps.event.addDomListener(window, "resize", function() {
        $('#dispensary-list').height(window.innerHeight);
        $('#dispensarymap').height(window.innerHeight);
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });
    $(document).ready(function() {
        $('#dispensary-list').height(window.innerHeight);
        $('#dispensarymap').height(window.innerHeight);
    });
}