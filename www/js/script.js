
var rememberedFields = ['username', 'phone', 'e-mail', 'instagram', 'telegram'];

function homeLoad() {
	//get images
	$deviceId = device.uuid;
	$.get("https://etceteragames.000webhostapp.com/tut/getPhotos.php?deviceId="+$deviceId, 
	function(response) {
		$images = JSON.parse(response);
		$('#last-photos').html('');
		if($images.length) {
			$('#last-photos').append('<h2 class="center-text">Твої внески</h2>');
		} else {
			$('#last-photos').append('<div class="center-text no-commits"><img src="img/no-commits.png"></div>');
		}
		$images.forEach(image => {
			$('#last-photos').append(`<div class="gallery" data-id="${image.id}" style="background: url('data:image/jpg;base64,${image.thumb}')"></div>`);
		});
		$('.gallery').click(LaunchDetailsPage);
	});
}

function getPhotoFromCamera() { 
		navigator.camera.getPicture(onPhotoSuccess, onFail, { 
		quality: 75, 
		sourceType: navigator.camera.PictureSourceType.CAMERA, 
		destinationType: navigator.camera.DestinationType.DATA_URL, 
	}); 
} 
function getPhotoFromAlbum(){ 
	navigator.camera.getPicture(onPhotoSuccess, onFail,{ 
		quality: 75, 
		sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY, 
		destinationType: navigator.camera.DestinationType.DATA_URL 
	}); 
} 
function onPhotoSuccess(imageData){ 
	$('input[name=image]').val(imageData);
	LaunchGPSPage();
}
function onFail(message){ 
	if(message == "20") {
		alert("Ти повинен дозволити доступ до файлів :(");
	}
	else {
		alert("Ти не обрав фото");
	}
}

function LaunchGPSPage() {
	location.hash = "#geolocation";
	centerMapToUser();
}
function LaunchContactForm() {
	location.hash = "#contactform";
	$('.loading-bg').addClass('hidden');
}

function contactLoad() {
	$('input[name=comment]').val('');
	$('input[name=lat]').val(map.center.lng());
	$('input[name=lon]').val(map.center.lat());
	$('input[name=uuid]').val(device.uuid);
	// load fields
	rememberedFields.forEach(item => {
		$('#'+item).val(window.localStorage.getItem(item));
	});
}

function centerMapToUser() {
	navigator.geolocation.getCurrentPosition(
		(position) => {
			let latLng = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			map.setCenter(latLng);
			
			new google.maps.Marker({
				position: latLng,
				map: map,
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 10,
					fillOpacity: 1,
					strokeWeight: 2,
					fillColor: '#5384ED',
					strokeColor: '#ffffff',
				},
			});
		},
		function onError(error) {
			alert('code: '    + error.code    + '\n' +
		  'message: ' + error.message + '\n');
		},{
			enableHighAccuracy: false
		});
}
function LaunchThanksPage() {
	location.hash = "#thanks";
	initMap();
}


function validateForm(e) {
	let valid = true;
	e.preventDefault();
	$('.loading-bg').removeClass('hidden');
	if (valid) {
		let data = $('#contact-info').serialize();
		$.post("https://etceteragames.000webhostapp.com/tut/upload.php", data, LaunchThanksPage);
		// save fields
		rememberedFields.forEach(item => {
			window.localStorage.setItem(item, $('#'+item).val());
		});
	}
}
function LaunchDetailsPage() {
	location.hash = "#details";
	$("#post-details").html('<div class="center-text loading-spinner"><img src="img/load.gif"></div>');
	$("post-map").addClass('hidden');
	$.get(`https://etceteragames.000webhostapp.com/tut/getPost.php?id=${this.getAttribute('data-id')}`,
	function(response) {
		$post = JSON.parse(response);
		$html = `
		<div class="center-text">
			<img class="main-photo" src="data:image/jpg;base64,${$post.image}">
			<span style="float: left;">${moment($post.date).format('MMM DD, YYYY HH:mm')}</span>
			<span style="float: right; font-weight: bold;">${$post.username}</span>
		</div><br>`;
		if($post.comment) {
			$html += `
			<div class="center-text"><h3>Твій коментар:</h3></div>
			<span>${$post.comment}</span>`;
		}
		else {
			$html += `<span>Ти не прокоментував це фото</span>`;
		}
		$html += `<div class="center-text"><h3>Мапа:</h3></div>`;
		$('#post-details').html($html);
		if($post.phone || $post.email || $post.instagram || $post.telegram) {
			$html = `<div class="center-text"><h3>Твої контакти:</h3></div>
						<div class="contacts">`;
			if($post.phone)
				$html += `<div class="phone">${$post.phone}</div>`;
			if($post.email) 
				$html += `<div class="email">${$post.email}</div>`;
			if($post.instagram) 
				$html += `<div class="instagram">${$post.instagram}</div>`;
			if($post.telegram) 
				$html += `<div class="telegram">${$post.telegram}</div>`;
			$html += `</div>`;
			$('#post-contacts').html($html)
		}
		$("post-map").removeClass('hidden');
		let pos = { lat: parseFloat($post.lon), lng: parseFloat($post.lat) };
		postMap.setCenter(pos);
		map.setZoom(11);
		if(lastPostMarker != null) {
			lastPostMarker.setMap(null);
		}
		var lastPostMarker = new google.maps.Marker({
			position: pos,
			map: postMap
		});
			
	});
}

function likeBtn(btn) {
	let root = btn.parentElement;
	if(root.getAttribute('liked') != 'true') {
		root.setAttribute('liked', 'true');
	}
	else {
		root.setAttribute('liked', 'none');
	}
}
function dislikeBtn(btn) {
	let root = btn.parentElement;
	console.log(root.getAttribute('liked'));
	console.log(root.getAttribute('liked') != 'false');
	if(root.getAttribute('liked') != 'false') {
		root.setAttribute('liked', 'false');
	}
	else {
		root.setAttribute('liked', 'none');
	}
}

$(function() {
	$('#get-album-photo').click(getPhotoFromAlbum);
	$('#get-camera-photo').click(getPhotoFromCamera);
	$('#accept-geo').click(LaunchContactForm);
	$("#contact-info").submit(validateForm);
	$(document).on("deviceready", homeLoad);
	$(document).on('pageshow', '#home', homeLoad);
	$(document).on('pageshow', '#contactform', contactLoad);
});
