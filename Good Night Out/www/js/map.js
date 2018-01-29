var socket = io.connect(window.localStorage.getItem("IP"));
//alert(window.localStorage.getItem("IP"));
 //var socket = io.connect("http://127.0.0.1:3000");
 var map;
  var k=0;
socket.emit('Hello',"Hello");
 function refreshMap()
{
  var mapa = new google.maps.Map(document.getElementById('mapContent'), {
    zoom: 13,
    center: new google.maps.LatLng(43.33294829188811, 21.893321990966797),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  map=mapa;  
}
this.refreshMap();
this.positionL();
k=1;
socket.on('locationsTransfer', function(locations){
 if(k!=1) 
 {
  refreshMap();
  positionL();
}
k=0;
if (locations == null)
{
 locations = [
  ['Bondi Beach', 43.33294829188811, 21.893321990966797, 4],
  ['Coogee Beach', 43.35294829188811, 21.893321990966797, 5],
  ['Cronulla Beach', 43.32294829188811, 21.893321990966797, 3],
  ['Manly Beach', 43.31294829188811, 21.893321990966797, 2],
  ['Maroubra Beach', 43.30294829188811, 21.893321990966797, 1]
];
}

var infowindow = new google.maps.InfoWindow();
var marker, i;
for (i = 0; i < locations.length; i++) {  
  marker = new google.maps.Marker({
    position: new google.maps.LatLng(locations[i].latitude, locations[i].longitude),
    map: map
  });
  google.maps.event.addListener(marker, 'click', (function(marker, i) {
    return function() {
      infowindow.setContent(locations[i].name);
      infowindow.open(map, marker);
    }
  })(marker, i));
}
});

$( "#btnAddLocationFromMap" ).click(function()
{
    var nameVal = $('#locationInput').val();
    var descriptionVal = $('#locDescription').val();
    var latitudeVal = $('#locLatInput').val();
    var longitudeVal = $('#locLngInput').val();
    var typeVal = $('#locType :selected').text();
    var locationObject = 
    {
        name: nameVal,
        description: descriptionVal,
        latitude: latitudeVal,
        longitude: longitudeVal,
        type:typeVal
    };  
    socket.emit('storeGlobalLocations', locationObject);
    socket.on('locationStoreResult',function(msg){alert(msg)});
});
$('#btnSearch').click(function()
 { 
  var typeV= $('#selectSearch :selected').text();
  var nameV= $('#textSearch').val();
  var radiusV=$('#radiusSearch').val();
  var latVal=$('#locLatInput').val();
  var lonVal=$('#locLngInput').val();
  var locationObject =
  {
     name:nameV,
     radius:radiusV,
     type:typeV,
     longitude:lonVal,
     latitude:latVal
  };
   socket.emit('search', locationObject);
   // socket.on('search',function(locationStoreResult){alert("locationObject.name")});
  });

  socket.on('locationsReturn',function(locationsReturn)
     {
      alert("Nalazite se u  blizini ovih/og mesta: "+locationsReturn)
     });

   function positionL()
   { 
     var options = {
      enableHighAccuracy: true,
      maximumAge: 3600000
   }

   var watchID1 = navigator.geolocation.watchPosition(onSuccess= function (position) {

    Latitude = position.coords.latitude;
    Longitude = position.coords.longitude;
    pozicija = {lat:Latitude,lon:Longitude };
    socket.emit('locationUpdate',pozicija);
}, onError=function(position){ 
     Latitude = position.coords.latitude;
    Longitude = position.coords.longitude;
    pozicija = {lat:Latitude,lon:Longitude };

     socket.emit('locationUpdate',pozicija);

    //alert('code: '    + position.code    + '\n' + 'message: ' + position.message + '\n');
   } , { timeout: 30000 ,enableHighAccuracy: true });

   var watchID = navigator.geolocation.getCurrentPosition(function (position)
   {    
                var Circle = null;
                var Radius = 10;

                var StartPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                function DrawCircle(Map, Center, Radius) {

                  if (Circle != null) {
                    Circle.setMap(null);
                  }
                  if(Radius > 0) {
                    Radius *= 1609.344;
                    Circle = new google.maps.Circle({
                      center: Center,
                      radius: Radius,
                      strokeColor: "#0000FF",
                      strokeOpacity: 0.35,
                      strokeWeight: 2,
                      fillColor: "#0000FF",
                      fillOpacity: 0.20,
                      map: Map
                    });
                  }
                }
                function SetPosition(Location, Viewport) {
                  Marker.setPosition(Location);
                  if(Viewport){
                    map.fitBounds(Viewport);
                    map.setZoom(map.getZoom() + 2);
                  }
                  else {
                    map.panTo(Location);
                  }
                  Radius = 10;
                  DrawCircle(map, Location, Radius);                   
                  $('#locLatInput').val(Location.lat);
                  $('#locLngInput').val(Location.lng);
                  $('#locRadiusInput').val(10);
                }

                var MapOptions = {
                  zoom: 5,
                  center: StartPosition,
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                  mapTypeControl: false,
                  disableDoubleClickZoom: true,
                  streetViewControl: false
                };                

                var Marker = new google.maps.Marker({
                  position: StartPosition, 
                  map: map, 
                  title: "You are here!",
                  animation: google.maps.Animation.DROP,
                  label: "You are here!",
                  draggable: true,
                });

                google.maps.event.addListener(Marker, "dragend", function(event) {
                  SetPosition(Marker.position);
                });

DrawCircle(map, StartPosition, Radius);
SetPosition(Marker.position);

},
function (error)
{
  alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
},options);   
}
