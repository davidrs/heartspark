var SubmitTextView = {
	init: function() {
		this.addButtonListener();
		if(!app.isOffline){
			this.getAproxAddress();
		}
	},
	addButtonListener: function () {
		$("#submitAed").click(function() {
			SubmitTextView.sendAedToServer();
		});
	},
	getAproxAddress: function(){
		var geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(app.currentAed.posn.lat, app.currentAed.posn.lng );
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
			  if (results[0]) {
			   	var a = results[0].address_components;
				var streetNum = getProp(a, 'street_number', 'long_name');
				var streetName = getProp(a, 'route', 'short_name');
				var address = (streetNum != undefined
						/*&& streetNum.indexOf('-') === -1*/ ? streetNum : '?')
						+ ' ' + streetName;
				if (address == undefined) {
					address = '';
				}
				$('#address').attr('value', address);
			  } else {
			    console.log('No geocoderesults found');
			  }
			} else {
			  console.log('Geocoder failed due to: ' + status);
			}
		});

	},
	sendAedToServer: function() {
		var gpsInfo='';
		var coords = app.user.posn.coords;
		var aedSubmitForm = $('#aedSubmitForm').serializeObject();

		if (this.validateForm(aedSubmitForm)) {

		var parameters = {"editName":aedSubmitForm.name, "editAddress":aedSubmitForm.address, "editDescription":aedSubmitForm.description, "public":"0"};
            parameters = JSON.stringify(parameters);

console.log(app.WEBSITE_ADDRESS+"/server/update.php?fbid="+app.user.fbid +
					'&type=text' +
					'&id='+app.currentAed.databaseIndex +
					"&text="+ encodeURIComponent(parameters) +
					"&public="+(app.DEBUG_MODE?2:0));

			$.ajax(app.WEBSITE_ADDRESS+"/server/update.php?fbid="+app.user.fbid +
					'&type=text' +
					'&id='+app.currentAed.databaseIndex +
					"&text="+ encodeURIComponent(parameters) +
					"&public="+(app.DEBUG_MODE?2:0),
					{
						dataType: 'json',
						success: function(response) {
							// DRS TODO update local AED to match new content.
							app.currentAed.name = aedSubmitForm.name;
							app.currentAed.address = aedSubmitForm.address;
							app.currentAed.description = aedSubmitForm.description;
							$.mobile.changePage("submitPicture.html", { transition: "slideup"});
						},
						error: function(request, errorType, errorMessage) {
								// TODO figure out if fail was no internet/ server or malformed. Only add to offline que if former
								OfflineRequests.addOfflineRequest(this.url);
								navigator.notification.alert('Internet failed, we\'ll resend it next time the app restarts and has internet!.', null, "Heart Spark");
								console.log("Error: submitting new Aed Text:"+errorMessage+" and errorType:"+errorType);
						}
					});
		}
	},
	validateForm: function(aedSubmitForm){
		if (aedSubmitForm.name === "" ||	aedSubmitForm.description === "") {
			navigator.notification.alert('You must fill out a name and description.',
											null,
											"Heart Spark");
			return false;
		}
		return true;
	}
};

$(document).delegate('#submit-text-page', 'pageshow', function(){
	SubmitTextView.init();
});
