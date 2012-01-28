var map;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var youMarker;
var infowindow;

function initMap() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      // Initialize the Google Maps API v3
      map = new google.maps.Map(document.getElementById("leMap"), {
        zoom: 17,
        center: point,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      directionsDisplay.setMap(map);

      var rackMarkerIcon = "img/rackMarker.png";
      infowindow = new google.maps.InfoWindow({
        content: "Default"
      });
      placeYouMarker(point);
      var youMarkerContent = '<div class="infoWindow">' +
                             '<h1>This is you!</h1>' +
                             '</div>';
      google.maps.event.addListener(youMarker, 'click', function() {
        infowindow.setContent(youMarkerContent);
        infowindow.open(map,youMarker);
      });
      $.getJSON("data/ChattanoogaBicycleParkingCleaned.json",{
        format: "json"
      },function(data) {
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
              google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(markerContent);
                infowindow.open(map,marker);
              });
            }
          })
        }
      );
    });
  } else {
    alert('W3C Geolocation API is not available');
  };
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
  var youMarkerIcon = "img/youMarker.png";
  youMarker = new google.maps.Marker({
    position: point,
    map: map,
    title: "This is you",
    icon: youMarkerIcon,
    zIndex: 300
  });
}
$(document).ready(function() {
  window.scrollTo(0, 1);
  initMap();
  if (("standalone" in window.navigator) && !window.navigator.standalone) {
    $("#addToHome").show();
  }
  window.onorientationchange = reorient;
  window.setTimeout(reorient, 0);
}).on("click", "#addToHome a", function() {
  $(this).parent().hide();
  return false;
}).on("click", ".infoWindow a", function() {
  var coords = $(this).attr("data-location").split(",");
  calcRoute(coords[0],coords[1]);
  return false;
}).on("click", ".refreshPosition", function() {
  youMarker.setMap(null);
  navigator.geolocation.getCurrentPosition(function(position) {
    var newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    placeYouMarker(newPosition);
    map.setCenter(newPosition);
  });
  infowindow.close();
  return false;
});