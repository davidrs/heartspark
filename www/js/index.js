//TODO: move gps code to own js
//TODO if no gps then ask for an address or city on homepage.
//TODO currently every gps update it re-calculates distance for all aeds, not just closest.
// (because current closest might be way off if cached data)

//TODO clear que of offline requests if too old, or failed too much.

var GLOBAL={}; // global empty jquery object for events.
var DEVICE_READY = false;

var app = {
	WEBSITE_ADDRESS: "http://heartsparkapp.org",
	NUM_CLOSEST_AEDS: 15,
	TRUST_MIN_TO_SHOW: 0,
	TRUST_MIN_FOR_CONFIDENT: 10,
	RADIUS_FOR_NEARBY_AEDS_METERS: 200,
	MIN_ACCURACY_DISTANCE: 90,
	DEBUG_MODE: false,
	GPS_HIGH_ACCURACY: true, //true for emulator, false for dad's android

	numAppUses:0,
	isOffline: false,
	currentAed: null,
	currentChallenge: null,
	aedList:null,
	user:null,
	stopSettingLocation:false,

	// Application Constructor
	initialize: function() {
		this.bindEvents();
		// won't effect android since in html meta we set "user-scalable=no"
		this.initFastClick();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
		document.addEventListener("pause", this.onDevicePause, false);
		document.addEventListener("resume", this.onDeviceResume, false);
		document.addEventListener("online", this.onDeviceOnline, false);
		document.addEventListener("offline", this.onDeviceOffline, false);
	},
	initFastClick: function () {
		window.addEventListener('load', function() {
			FastClick.attach(document.body);
			}, false);
	},

	onDeviceReady: function() {
		DEVICE_READY = true;
		HomepageView.hideMenu();

		//app.initFacebook(); facebook disabled
		app.user = new User();
		app.user.loadUser();
		HomepageView.showSplash();

		app.aedList = new AedList();
		app.aedList.init();


		//If we have a location run nclosest
		if(app.user.posn && app.aedList){
			GPS.onUserLocationUpdate(app.user.posn);
			app.setUserLocationOnce = false;
		}

		GPS.startGPS();

		$(GLOBAL).on('aedsLoaded',function(){
			app.aedList.calculateNClosestAeds(app.user.getLatLng(), app.NUM_CLOSEST_AEDS, true);
		});

		OfflineRequests.runAllOfflineRequests();

		HomepageView.refreshUI();
	},

	onDevicePause: function(){
		GPS.stopGPS();
	},
	onDeviceResume: function(){
		GPS.startGPS();
	},
	onDeviceOnline: function(){
		app.isOffline = false;
	},
	onDeviceOffline: function(){
		app.isOffline = true;
	},
	initFacebook: function() {
		try {
			FB.init({ appId: "158261851002236", nativeInterface: CDV.FB, useCachedDialogs: false });
		} catch (e) {
			console.error("Error: facebook init: "+e);
		}
	},
	removeChallenge: function(eventId) {
		for(var i=0; i < app.user.challenges.length; i++) {
			if (app.user.challenges[i].eventId == eventId) {
				app.user.challenges.splice(i, 1);
				break;
			}
		}
	}
};
