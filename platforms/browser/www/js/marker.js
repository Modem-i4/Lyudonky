var map, globalMap, postMap;
var lastPostMarker;

window.initMap = function() {
    let defaultCoords = { lat: 50.32950893773501, lng: 26.51267607672072 }
	map = new google.maps.Map(document.getElementById("map"), {
		center: defaultCoords, 
		zoom: 11,
		disableDefaultUI: true,
		zoomControl: true,
        minZoom: 10
		});
	globalMap = new google.maps.Map(document.getElementById("global-map"), {
		center: defaultCoords, 
		zoom: 11,
		disableDefaultUI: true,
		zoomControl: true,
        minZoom: 10
		});
    postMap = new google.maps.Map(document.getElementById("post-map"), {
		center: defaultCoords, 
		zoom: 11,
		disableDefaultUI: true,
		zoomControl: true,
        minZoom: 10
        });
    $.get("https://etceteragames.000webhostapp.com/tut/getPoints.php",
    function(response) {
        $points = JSON.parse(response);
        console.log($points);
        $points.forEach(point => {
            addMarker({
                id: point.id,
                lat: parseFloat(point.lat),
                lng: parseFloat(point.lon),
                iconImage: point.thumb,
                content: point.comment,
                author: point.username,
                date: point.date,
            });
        });
    });
        
    CustomMarker.prototype = new google.maps.OverlayView();

    CustomMarker.prototype.draw = function () {
        var div = this.div_;
        if (!div) {
            div = this.div_ = document.createElement('div');
            div.className = "customMarker";

            var pic = document.createElement("div");
            pic.setAttribute('class', 'point-image');
            pic.setAttribute('style', 'background: url("' + this.imageSrc + '");');
            div.appendChild(pic);
            var me = this;
            google.maps.event.addDomListener(div, "click", function (event) {
                google.maps.event.trigger(me, "click");
            });

            var panes = this.getPanes();
            panes.overlayImage.appendChild(div);
        }

        let size = globalMap.zoom * 10;
        div.style.width = size + 'px';
        div.style.height = size + 'px';
        var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
        if (point) {
            div.style.left = point.x + 'px';
            div.style.top = point.y + 'px';
        }
    };
}
        
function addMarker(props){
    let infowindow = new google.maps.InfoWindow({
      content: `<div data-id="${props.id}"><h3>${props.content}</h3><span>${props.date}</span><pre>${props.author}</pre>
      <div class="dislike" onclick="dislikeBtn(this)"><img src="img/dislike.svg"></div>
      <div class="like" onclick="likeBtn(this)"><img src="img/like.svg"></div></div>`,
    });
    let customMarker = new CustomMarker(new google.maps.LatLng(props.lng,props.lat), "data:image/png;base64,"+props.iconImage, infowindow);
    
    customMarker.addListener("click", () => {
        infowindow.open(globalMap, customMarker.marker);
    });
}


function CustomMarker(latlng, imageSrc, infowindow) {
    this.latlng_ = latlng;
    this.imageSrc = imageSrc;
    this.marker = new google.maps.Marker({
        position: latlng,
        map: globalMap,
        infoWindow: infowindow,
        size: new google.maps.Size(250, 250),
        pixelOffset: 300
    });
    this.setMap(globalMap);
}
