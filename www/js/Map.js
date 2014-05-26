//TODO store DOM element of map in Map so any view can add it to its page.
var Map = {
	mapDOM: null,
	map: null,
	markers:null,
	popup: null,
	focus:'user',
	userMarker:null,
	publicIcon: L.icon({
		iconUrl: 'img/icons/public.png',
		iconSize:	 [25, 30], // size of the icon
		iconAnchor:   [12, 30], // point of the icon which will correspond to marker's location
		popupAnchor:  [-3, -36] // point from which the popup should open relative to the iconAnchor
	}),
	privateIcon: L.icon({
		iconUrl: 'img/icons/private.png',
		iconSize:	 [25, 30], // size of the icon
		iconAnchor:   [12, 30], // point of the icon which will correspond to marker's location
		popupAnchor:  [-3, -36] // point from which the popup should open relative to the iconAnchor
	}),
	unsureIcon: L.icon({
		iconUrl: 'img/icons/unsure.png',
		iconSize:	 [25, 30], // size of the icon
		iconAnchor:   [12, 30], // point of the icon which will correspond to marker's location
		popupAnchor:  [-3, -36] // point from which the popup should open relative to the iconAnchor
	}),
	init: function(elementId){
		this.markers={};
		Map.mapDOM = $('#'+elementId);
		this.popup = L.popup();
		this.map = L.map(elementId,{
			center: [45.4218,-75.6983],
			maxZoom: 15,
			minZoom: 3,
			zoom: 12
		});

		//TODO: IF we had offline tiles we would use them here:
		if(false && app.isOffline){
			this.map.options.maxZoom=15;
			console.log("using offline tiles");
			L.tileLayer('img/mapTiles/{z}/{x}/{y}.png', {
				maxZoom: 15,
				minZoom: 12,
				maxBounds: [
					[45.4572, -75.8401],
					[45.327530, -75.569565]
				]
			}).addTo(this.map);
		} else{
			this.map.options.maxZoom = 17;
			this.map.optionsminZoom= 3;
			//console.log("using online tiles");
			L.tileLayer('http://{s}.tiles.mapbox.com/v3/drustsmi.map-35zdi6tq/{z}/{x}/{y}.png',{//'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 17
			}).addTo(this.map);
		}

		this.userMarker=null; //this ensures a new one is created.
		this.updateUserMarker();
	},
	updateUserMarker: function(){
		//console.log("update user");
		if(this.map!==null){
			if(app.user.posn){
				var userLatLng = app.user.getLatLng();
				if(this.userMarker===null){
					this.userMarker = L.marker(userLatLng, 
												{zIndexOffset: -10});
					this.userMarker.addTo(this.map)
						.bindPopup("<b>You</b>");
					this.map.panTo(userLatLng, {animate:false});
					this.map.setZoom(15, {animate:false});
					this.map.invalidateSize();
				}
				this.userMarker.setLatLng(userLatLng);
			}
		}
	},
	aedMarkerClick: function(marker){
		app.currentAed = app.aedList.getAed($(marker).data("pos"));
		$(GLOBAL).trigger( "currentAed-changed" );
		//console.log("triggered id: "+app.currentAed);
		$.mobile.changePage("aed.html", "none", true, false);
	},
	addAedIconListeners: function () {
		Map.mapDOM.on('click', '.aedLink', function(event) {
			event.preventDefault();
			//console.log("click");
			Map.aedMarkerClick(this);
		});
	},
	resizeMap: function() {
		if(Map.mapDOM){
			var position = Map.mapDOM.position();
			Map.mapDOM.height(Math.max(100,
			 							$(window).height()-(110)));//+$(".ui-footer").height()+(position ? position.top : 120))));
		}
		if(Map.map){
				Map.map.invalidateSize();
		}
	},
	drawClosestAeds: function(){
		console.log("drawClosestAeds");
		if(app.aedList!==null){
			var closestAeds = app.aedList.closestAeds;
			if(closestAeds!==null){
				this.drawListAeds(closestAeds);
				this.addAedIconListeners();
			}
		}
	},
	drawAllAeds: function(){
		console.log('draw all AEDs');
		if(app.aedList!==null){
			var allAeds =  app.aedList.aeds;
			if(allAeds !== null){
				this.drawListAeds(allAeds);
			}
		}
	},
	drawListAeds: function(aedList){
		console.log("drawListAeds");
		if(aedList !== null){
			for(var i=0; i< aedList.length; i++){
				if(aedList[i].trust > app.TRUST_MIN_TO_SHOW){
					Map.markers[aedList[i].databaseIndex] = L.marker(aedList[i].posn,{icon: aedList[i].getIcon()}).addTo(this.map)
						.bindPopup('<a class="aedLink popup" href="#" data-transition="slide" data-pos="'+aedList[i].listIndex+'"><b>'+
									aedList[i].name+'</b><br />'+
									aedList[i].description +'<br />'+
									aedList[i].getShortAddress()+'</a>');
				}
			}
		}
	},
	panTo: function (latLng) {
		if(this.map){
			this.map.panTo(latLng, {animate:false});
		}
	},
	zoomTo: function (zoom) {
		if(this.map){
			this.map.setZoom(zoom, {animate:false});
		}
	}
};

$(window).resize(function() {
	Map.resizeMap();
});
