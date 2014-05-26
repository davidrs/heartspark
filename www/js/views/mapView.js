var MapView={
	init: function(){
		Map.init('map-canvas');
		Map.drawClosestAeds();

        $( GLOBAL ).on( "nclosest-changed", function(event){
        	Map.drawClosestAeds();
        });
	}
};

$(document).delegate('#map-page', 'pageinit', function () {
	//console.log("init mapView");
    MapView.init();
});


$(document).delegate('#map-page', 'pageshow', function () {
	//Map.map.invalidateSize();
	Map.resizeMap();

	if(Map.focus == "currentAed"){
		if(app.currentAed){
	 		Map.panTo(app.currentAed.posn);
	        Map.zoomTo(15);
	        if(Map.markers[app.currentAed.databaseIndex]){
		        Map.markers[app.currentAed.databaseIndex].openPopup();
		    }
	    }
	}
	else{
		if(app.user.posn){
			Map.panTo(app.user.getLatLng());
		}
	}
	Map.map.invalidateSize();

});
