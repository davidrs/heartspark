
var GPS = {
    GPS_HIGH_ACCURACY: true, //true for emulator, false for dad's android

    GPSWatchId: null,
    GPSErrorCount:0,
    setLocationOnce:false,
    stopSettingLocation:false,

    startGPS: function() {
        //Do a single request with accuracy false to cover case of devices that don't work with true.
        navigator.geolocation.getCurrentPosition(this.onUserLocationRoughUpdate,
                                                 this.onUserLocationError,
                                                 {   enableHighAccuracy: false,
                                                     timeout: 20*1000 ,
                                                     maximumAge: 50*1000 });


        this.GPSWatchId = navigator.geolocation.watchPosition(this.onUserLocationUpdate,
                                                            this.onUserLocationError,{
                                                                enableHighAccuracy: this.GPS_HIGH_ACCURACY,
                                                                timeout: 20*1000 ,
                                                                maximumAge: 3*60*1000 });
    },
    stopGPS: function(){
        if(this.GPSWatchId){
            navigator.geolocation.clearWatch(this.GPSWatchId);
        }
    },
    onUserLocationRoughUpdate: function(position) {
        this.GPSErrorCount = -1;
        if(app.usr && app.user.posn){
            var now = new Date();
            var lastUpdate = Date.parse(app.user.posn.timestamp);
            if((now - lastUpdate) < 5*60*1000){ //If we've had a recent update don't use it, risk overriding precise posn
                return;
            }
        }

        GPS.onUserLocationUpdate(position);
    },

    //Gets called if any gps update is happening...
    onUserLocationUpdate: function(position) {
        console.log("GPS update: " + JSON.stringify(position));
        this.GPSErrorCount = -1;

        HomepageView.refreshUI();

        var point = L.latLng(position.coords.latitude, position.coords.longitude);
        if(position && point.distanceTo(app.user.getLatLng()) > app.RADIUS_FOR_NEARBY_AEDS_METERS){
            console.log("moved a lot");
            GPS.setLocationOnce = false; //to force it to run laod AEDS from web after setting user.
        }
        app.user.updateLocation(position);
		Map.updateUserMarker();

        if(!GPS.setLocationOnce && app.aedList){
            console.log('setLocationOnce');
            app.aedList.loadAedsFromWeb();
            GPS.setLocationOnce = true;
            HomepageView.refreshUI();
        } else{
            app.aedList.calculateNClosestAeds(app.user.getLatLng(), app.NUM_CLOSEST_AEDS);
        }
    },
    onUserLocationError: function (error){
        //console.log("error GPS: "+error.code);

        this.GPSErrorCount++;

        if(this.GPSErrorCount>1 && error.code == PositionError.TIMEOUT){
            console.log('stopping and falling back to rough gps');
            this.stopGPS();

            this.GPSWatchId = navigator.geolocation.watchPosition(this.onUserLocationUpdate,
                                                            this.onUserLocationError,{
                                                                enableHighAccuracy: false,
                                                                timeout: 30*1000 ,
                                                                maximumAge: 1*60*1000 });
        }
    },
    geocodeAddress: function(addressString, callback) {
        var geocoder = new google.maps.Geocoder();
        var searchParams = {address: addressString}; //TODO urlencode.

        geocoder
                .geocode(
                        searchParams,
                        function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK ){//} && results[0].geometry.location_type!="APPROXIMATE") {
                                var location = results[0].geometry.location;
                                if(results.length > 1){
                                    alert("Your search got multiple results, but we made our best guess.");
                                }
                                callback(location);
                            } else {
                                alert("Sorry, couldn't find location.");
                                callback();
                            }
                        });
    }
};