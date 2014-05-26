function AedList() {
	var aeds = {};
	var timeOfLastCalculation = 0;
	this.closestAeds = null;

	this.init = function() {
		this.loadAedsFromStorage();
		$(GLOBAL).trigger('aedsLoaded');
	};

	this.loadAedsFromStorage = function() {
		this.aeds = [];
		var aedListObject = Communicate.getAllAeds();
		if (aedListObject != null) {
			for(var i=0; i< aedListObject.aeds.length ;i++){
				this.aeds.push(new Aed(aedListObject.aeds[i],this.aeds.length,false));
			}
		}
	};

	this.loadAedsFromWeb = function() {
		console.log("loadAedsFromWeb");
		var self=this;
		var params = {
			format:'json',
			resultLimit:100
		};

		if(app.user.posn){
			params.lat = app.user.posn.coords.latitude;
			params.lng = app.user.posn.coords.longitude;
		}
		console.log(app.WEBSITE_ADDRESS+"/server/getaeds.php" + '  '+JSON.stringify(params));
		$.ajax(app.WEBSITE_ADDRESS+"/server/getaeds.php", {
				type:'GET',
				data: params,
				dataType: 'json',
				timeout: 10000,
				context: this,
				success: function(response) {
					console.log('success load from web: ' +response.length);
					this.loadJSON(response);
					this.saveAedsToStorage();
					$(GLOBAL).trigger('aedsLoaded');
				},
				error: function(request, errorType, errorMessage) {
					console.log("Error requesting aeds from server. Request:"+ request +" Error Message:"+errorMessage);
					if(errorType === "timeout" ){
						self.loadAedsFromWeb();
					}
				}
		});
	};

	this.loadJSON = function(jsonObj) {
		this.aeds = [];
		try {
			for (var i = 0; i < jsonObj.length; i++) {
				this.aeds.push(new Aed(jsonObj[i], this.aeds.length,true));
			}
			this.timeOfLastCalculation = 0; //forces nearest n calc to not be skipped
		} catch (error) {
			console.error("Error parsing json string from server. error:"+error);
		}
	};


	this.addAed = function(jsObject) {
		this.aeds.push(new Aed(jsObject, this.aeds.length, true));
		if(app.user.posn){
			this.calculateNClosestAeds(app.user.getLatLng(), app.NUM_CLOSEST_AEDS, true);
		}
	};

	this.saveAedsToStorage = function() {
		var aedListObject = {};
		aedListObject.aeds = this.aeds;

		Communicate.setAllAeds(aedListObject);
	};

//TODO create a function that just recalculates for the 10 closest aeds.
	// NOTE: This function also sets all of the distances for the Aeds in the aedList.
	this.calculateNClosestAeds = function(latLng, numOfAedsToReturn, forceNew) {
		console.log('calculateNClosestAeds');
		if(this.aeds == null || latLng == null){
			return null;
		}

        var now = new Date();
        if(!forceNew && this.closestAeds && (now - this.timeOfLastCalculation) < 1*60*1000){
            return;
        } else{
    		this.timeOfLastCalculation = now;
        }

        console.log('calculateNClosestAeds Proceeding');
		// TODO: Set this somewhere else, initializing here to get the stub working
		var emergency = false;
		var TRUST_MIN = 1;

		var threshold = 6371*1000;// start with radius of earth in m

		this.closestAeds = [];

		for ( var i = 0; i < numOfAedsToReturn; i++) {
			if(!this.aeds[i] || i > this.aeds.length){
				break;
			}

			this.closestAeds[i] = this.aeds[i];
			this.closestAeds[i].distance = this.aeds[i].distanceTo(latLng);
		}

		for ( var currentAedListId = numOfAedsToReturn; currentAedListId < this.aeds.length; currentAedListId++) {
			if (this.aeds[currentAedListId].trust >= TRUST_MIN || !emergency) {
				var d = this.aeds[currentAedListId].distanceTo(latLng);
				this.aeds[currentAedListId].distance = d;

				// Check if its closer than the furthest in the closestAeds list.
				if (d < threshold) {
					this.closestAeds[numOfAedsToReturn - 1] = this.aeds[currentAedListId];

					// Bubble down
					for ( var j = numOfAedsToReturn - 2; j >= 0; j--) {
						if (d < this.closestAeds[j].distance) {
							// insert and bump them all along 1
							this.closestAeds[j + 1] = this.closestAeds[j];
							this.closestAeds[j] = this.aeds[currentAedListId];
						} else {
							break;
						}
					}

					//Set new threshold
					threshold = this.closestAeds[numOfAedsToReturn - 1].distance;
				}
			}
		}
		// TODO :save the closestAeds to local storage using Communication method.

		$(GLOBAL).trigger( "nclosest-changed" );
	};

	this.size = function() {
		return this.aeds.length;
	};

	this.getList = function() {
		// TODO: we may need to massage the array data into a list
		return this.aeds;
	};

	this.getAed = function(index) {
		if (index >= 0 && index < this.aeds.length) {
			return this.aeds[index];
		}
		else {
			return null;
		}
	};

	this.getAedDbId = function(databaseId) {
		var aed;
		for (var i=0; i < this.aeds.length; i++) {
			aed = this.aeds[i];
			if (aed.databaseIndex == databaseId) {
				return aed;
			}
		}
		return null;
	};

}
