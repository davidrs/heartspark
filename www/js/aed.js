var Aed = function(obj, listIndex, isFromServer) {
	this.databaseIndex = obj.id;
	this.name = obj.name;
	this.address = obj.address;
	this.description = obj.description;
	this.hours = obj.hours; //what if hours are null?
	this.numAnnotations=parseInt(obj.numAnnotations);
	this.img = obj.img;//what if img is null?
	this.trust=parseInt(obj.trust);
	this.submitterId=obj.submitterId;

	this.listIndex = listIndex;
	this.distance = 0;

	if(isFromServer){
		this.publ = obj.public; // not sure how it will like keyword 'public'
		this.posn =  new L.LatLng(parseFloat(obj.lat),parseFloat(obj.lng));
	}
	else{
		this.publ = obj.publ;
		this.posn = new L.LatLng(obj.posn.lat, obj.posn.lng);
		this.distance = parseFloat(obj.distance);
	}
};


Aed.prototype.setAddress = function(shortAddress) {
	return this.address = shortAddress;
};


Aed.prototype.getDistance = function() {
	return distanceToString(this.distance);
};


Aed.prototype.getShortAddress = function(){
	var commaIndex = this.address.indexOf(',', Math.min(5,this.address.length));

	// > 5 to ensure one exists, and we're not truncating too much
	if(commaIndex>5){
		return this.address.substring(0,commaIndex);
	}

	return this.address;
};

Aed.prototype.getHours = function(){
	if(this.hours){
		var hoursAry=	this.hours.split(',');
		if(hoursAry.length>5){
			if(hoursAry[0] !== ''){
				return ("Mon-Fri: " + (hoursAry[0]==hoursAry[1]?"Closed":  hoursAry[0]
				+" to "+  hoursAry[1])
				+"<br/>Sat: "+(hoursAry[2]==hoursAry[3]?"Closed":  hoursAry[2]
				+" to "+  hoursAry[3])
				+"<br/>Sun: "+  (hoursAry[4]==hoursAry[5]?"Closed":hoursAry[4]
				+" to "+  hoursAry[5]));
			}
		}
		else{
			return this.hours;
		}
	}

	return "";
};

Aed.prototype.distanceTo = function(destinationLatLng) {
	return this.posn.distanceTo(destinationLatLng);
};


Aed.prototype.hasImg = function() {
	return !(this.img == null || this.img == "");
};

Aed.prototype.getImgName =function(){
	var imgPath = this.img;
	if (imgPath == null || imgPath === '') {
		imgPath = "";
	} else {
		imgPath = imgPath.replace("uploads/", "");
	}
	return imgPath;
};

Aed.prototype.getIcon = function(){
	if(this.publ > 0) {
		return Map.publicIcon;
	}
	else{
		if(this.trust >= app.TRUST_MIN_FOR_CONFIDENT){
			return Map.publicIcon; //no legend, so having privateIcon was just confusing.
		}
		else if(this.trust > app.TRUST_MIN_TO_SHOW){
			return  Map.unsureIcon;
		}
		else{
			console.log("ERROR: trying to get icon for untrusted AED");
			return null; //Definitely not trusted, so crash it, should never be asked for icon.
		}
	}
};

Aed.prototype.hasDynamicChallenges = function() {
	return (!this.hasImg()); // || this.numAnnotations<3 || maitenance update older than a month);
};


