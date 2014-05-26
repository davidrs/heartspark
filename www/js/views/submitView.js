var SubmitView = {
	useGPS: true,
	newAedLocation: {},
	init: function() {
		this.addButtonListener();
		SubmitView.newAedLocation = app.user.getLatLng();
		this.initMap();

		// Using the trust score as a hacky indicator for if they're a newby and need help.
		if(app.user.trust<10){
			navigator.notification.alert('Drag the map marker to the location of the defibrillator.', null, "Heart Spark");
		}
	},
	show: function() {
		//Nothing specific we want to do on page show right now.
		this.resizeMap();
	},
	initMap: function(){
		var self =this;

		this.mapDOM = $('#submit-map-canvas');
		this.map = L.map('submit-map-canvas',{
			center: app.user.getLatLng(),
			maxZoom: 15,
			minZoom: 12,
			zoom: 12
		});

		if(false && app.isOffline){
			this.map.options.maxZoom=15;
			L.tileLayer('img/mapTiles/{z}/{x}/{y}.png', {
				maxZoom: 15,
				minZoom: 12,
				maxBounds: [
					[45.4572, -75.8401],
					[45.327530, -75.569565]
				]
			}).addTo(this.map);
		}
		else{
			this.map.options.maxZoom = 17;
			//console.log("using online tiles");
			L.tileLayer('http://{s}.tiles.mapbox.com/v3/drustsmi.map-35zdi6tq/{z}/{x}/{y}.png',{//'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 17
			}).addTo(this.map);
		}

		this.userMarker = null; //this ensures a new one is created.
		this.updateUserMarker();
		this.userMarker.on('dragend', function(evt) {
			SubmitView.newAedLocation =  self.userMarker.getLatLng();
		});
	},
	updateUserMarker: function(){
		if(this.map!==null){
			if(app.user.posn){
                var userLatLng = app.user.getLatLng();
				if(this.userMarker === null){
					this.userMarker = L.marker(userLatLng,
												{   draggable: true});
					this.userMarker.addTo(this.map);
					this.map.panTo(userLatLng, {animate:false});
					this.map.setZoom(15, {animate:false});
					this.map.invalidateSize();
				}
			}
		}
	},
	resizeMap: function() {
		if(this.mapDOM){
			var position = this.mapDOM.position();
			this.mapDOM.height(Math.max(100, $(window).height()-120));
	    }
	    if(this.map){
	    		this.map.invalidateSize();
	    }
	},
	addButtonListener: function () {
		$("#submitAedMap").click(function() {
			this.useGPS = true;
			SubmitView.sendAedToServer();
		});
		$("#submitAedAddress").click(function() {
			this.useGPS = false;
			SubmitView.sendAedToServer();
		});
	},
	sendAedToServer: function() {
		var params='';
		var coords = SubmitView.newAedLocation;
		var aedSubmitForm = $('#aedSubmitLocationForm').serializeObject();

		if (this.validateForm(aedSubmitForm)) {

			if(this.useGPS){
				params = "&lat="+coords.lat+"&lng="+coords.lng+"&accuracy=5"; //manually set location, so we set accuracy high.
			} else{
				params = '&address='+aedSubmitForm.address ;
			}

console.log(app.WEBSITE_ADDRESS+"/server/submit.php?fbid="+app.user.fbid +
					params +
					"&public="+(app.DEBUG_MODE?2:0));
			$.ajax(app.WEBSITE_ADDRESS+"/server/submit.php?fbid="+app.user.fbid +
					params +
					"&public="+(app.DEBUG_MODE?2:0), {
					dataType: 'json',
					success: function(response) {
						app.aedList.addAed(response.jsObject);
						app.currentAed = app.aedList.getAed(app.aedList.size()-1);
						Communicate.setAllAeds(app.aedList);
						$.mobile.changePage("submitText.html", { transition: "slideup"});
						//DRS TODO???maybe just go to edit.html instead...same functionaly. delete submitText
						//TODO =======================================================
					},
					error: function(request, errorType, errorMessage) {
							// TODO figure out if fail was no internet/ server or malformed. Only add to offline que if former
							OfflineRequests.addOfflineRequest(this.url);
							navigator.notification.alert('Internet failed, we\'ll resend it next time the app restarts and has internet!.', null, "Heart Spark");
							console.log("Error: submitting new Aed:"+errorMessage+" and errorType:"+errorType);
						 }
					});
		}
	},
	validateForm: function(aedSubmitForm){
		if(aedSubmitForm.address === "" && this.useGPS === false){
			navigator.notification.alert('You must use the map or provide an address.',
											null,
											"Heart Spark");
			return false;
		}

		return true;
	}
};

$(document).delegate('#submit-page', 'pageinit', function(){
	SubmitView.init();
});

$(document).delegate('#submit-page', 'pageshow', function(){
	SubmitView.show();
});
