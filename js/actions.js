// Bunch of global variables:
var map;
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();
var infowindow = new google.maps.InfoWindow({ content: "Default" });
var youMarker;
var youMarkerIcon = "img/youMarker.png";
var rackMarkerIcon = "img/rackMarker.png";
var placeMarkers = [];

$(document).ready(function() {

// Make mobile Safari scroll to top of document (hide address bar):
  window.scrollTo(0, 1);

// Initialize map if the browser supports geolocation:
  if (navigator.geolocation) {
    initMap();
  } else {
    alert('Your browser doesn’t support geolocation.');
  };

// If broswer is capable of standalone (iOS) and app is not in standalone mode, show call to action:
  if (("standalone" in window.navigator) && !window.navigator.standalone) {
    $("#addToHome").show();
  }

// Do something on reorient (between landscape & portrait):
  window.onorientationchange = reorient;
// and call reorient on load:
  window.setTimeout(reorient, 0);

}).on("click", "#addToHome a", function() {

// Hide call to action:
  $(this).parent().hide();
  return false;

}).on("click", ".infoWindow a", function() {

// Calculate route:
  var coords = $(this).attr("data-location").split(",");
  calcRoute(coords[0],coords[1]);
  return false;

}).on("click", ".refreshPosition", function() {

// Refresh user’s position on the map; first remove marker:
  youMarker.setMap(null);
// then find a new position from the browser:
  navigator.geolocation.getCurrentPosition(function(position) {

// then generate new position object, assign it to the marker,
// add the marker to the map, and center the map on the new position:
    var newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    placeYouMarker(newPosition);
    map.setCenter(newPosition);
  });

// Finally, close the infowindow:
  infowindow.close();
  return false;
}).on("click", "#clearRoute", function() {
  return clearRoute();
});

function initMap() {
  navigator.geolocation.getCurrentPosition(function(position) {
    var point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    map = new google.maps.Map(document.getElementById("leMap"), {
      zoom: 17,
      center: point,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    youMarker = placeYouMarker(point);
    var youMarkerContent = '<div class="infoWindow">' +
                           '<h1>This is you!</h1>' +
                           '</div>';
    setMarkerWindow(youMarker,youMarkerContent);
    setLocationMarkers("data/ChattanoogaBicycleParkingCleaned.json");
  });
}
function calcRoute(lat,lon) {
  var destination = new google.maps.LatLng(lat,lon);
  var request = {
    origin:youMarker["position"],
    destination:destination,
    travelMode: google.maps.TravelMode.BICYCLING
  };
  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(result);
      infowindow.close();
    }
  });
  directionsDisplay.setMap(map);
  $.each(placeMarkers, function (k,v) {
    v.setMap(null);
  });
  clearRouteLink("show");
}
function clearRoute() {
  directionsDisplay.setMap(null);
  $.each(placeMarkers,function(k,v) {
    v.setMap(map);
  });
  clearRouteLink("hide");
  return false;
}
function clearRouteLink(action) {
  var elem = document.getElementById("clearRoute");
  (action == "show") ? $(elem).show() : $(elem).hide();
}
function reorient(e) {
  var portrait = (window.orientation % 180 == 0);
  if (!portrait) {
    // alert("Not yet optimized for landscape view.");
    window.scrollTo(0, 1);
  };
  // $("body > div#container").css("-webkit-transform", !portrait ? "rotate(-90deg)" : "").css ;
}
function placeYouMarker(point) {
  return new google.maps.Marker({
    position: point,
    map: map,
    title: "This is you",
    icon: youMarkerIcon,
    zIndex: 300
  });
}
function setMarkerWindow(marker,content) {
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(content);
    infowindow.open(map,marker);
  });
}
function setLocationMarkers(JSONurl) {
  $.getJSON(JSONurl,
    { format: "json" },
    function(data) {
      $.each(data, function(k,v) {
        if (data[k]["Status"] == "Completed") {
          var lon = data[k]["X_Cor"];
          var lat = data[k]["Y_Cor"];
          var point = new google.maps.LatLng(lat, lon);
          var marker = new google.maps.Marker({
            position: point,
            map: map,
            title: data[k]["Location Name"]
          });
          var markerContent = '<div class="infoWindow">' +
                              '<h1>' + data[k]["Location Name"] + '</h1>' +
                              '<p>' + data[k]["Spaces"] + '<br>' +
                              '<a href="#" data-location="' + lat + ',' + lon + '">Route!</a></p>' +
                              '</div>';
          setMarkerWindow(marker,markerContent);
          placeMarkers.push(marker);
        }
      });
    }
  );
}