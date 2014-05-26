//TODO write logout code and add button to account view
function User() {
	this.loggedIn=false;
	this.uid=-1;		//device id
	this.fbid = -1;		//facebook id
	this.fbAccount = false;
	this.extraInfo = "";

	this.posn = null;

	this.fName = "";
	this.lName = "";

	this.stats=null; //Sample: "stats":{"gpsAnnotate":"10","login":"294","mOk":"1","newAed":"4","picture":"4","text":"1"},

	this.email='';
	this.trust=0;

	this.leaderboard=null;
	this.challenges=null;

}

User.prototype.getPointValues = function(){
	var pointValues = [];
	pointValues['New AEDs'] = 80;
	pointValues['Updates'] = 40;
	pointValues['Peer Reviews'] = 25;
	return pointValues;
}

User.prototype.loadUser = function(){
	this.loadUserFromStorage();
	this.loadUserFromWeb();
}

User.prototype.loadUserFromStorage = function(){
	var tmpObj = Communicate.getUser();
	if(tmpObj != null && tmpObj.uid) {
		for(var propt in tmpObj){
			//console.log('loading '+propt+': '+tmpObj[propt]);
			this[propt] = tmpObj[propt];
		}
	}

	if(!this.uid || this.uid == -1){
		this.uid  = Math.floor((Math.random()*10000)+1);
		console.log("random uid: "+this.uid);
		Communicate.setUser(app.user);
	}
	if(!this.fbid || this.fbid == -1){
		// Using the device id as fbid in the interim.
		this.fbid = this.uid;
		this.fbAccount = false;
		Communicate.setUser(app.user);
	}
};

User.prototype.loadUserFromWeb = function() {
	var extraInfo="";
	if(this.fbAccount && this.fName != null) {
		extraInfo = "&fName="+this.fName+"&lName="+this.lName+"&email="+this.email	;
	}

	 $.ajax(app.WEBSITE_ADDRESS+"/server/getUser.php?fbid="+this.fbid + extraInfo, {
		context: this,
		dataType: 'json',
		success: function(response) {
			 this.loadJSON(response);
		},
		error: function(request, errorType, errorMessage) {
			app.isOffline=true;
			console.log("Error on getUser ajax call. Error message:"+errorMessage+" url: "+this.url);
		},
		timeout: 10000
  });
};

User.prototype.updateName = function(fName,lName, callback){

	var extraInfo= "&fName="+fName+"&lName="+lName	;

	$.ajax(app.WEBSITE_ADDRESS+"/server/updateName.php?fbid="+this.fbid + extraInfo, {
		 dataType: 'json',
		 success: function(response) {
			app.user.setName(fName,lName);
			Communicate.setUser(this);
			AccountView.refreshUI();
			//TODO get callback working -> callback();

		 },
		 error: function(request, errorType, errorMessage) {
		  console.log("Error on updating name. Error message:"+errorMessage);
		 },
		 timeout: 10000
  });
};

User.prototype.loadJSON = function(response) {
	this.stats = response.stats;
	if(this.stats==null){
		this.stats={
			"gpsAnnotate":"0",
			"login":"1",
			"mOk":"0",
			"mReport":"0",
			'cfrmNo':'0',
			'cfrmOk':'0',
			"newAed":"0",
			"picture":"0",
			"text":"0"
		};
	}
	this.trust = response.trust;
	this.leaderboard = response.leaderboard;
	this.challenges = response.challenges;

	Communicate.setUser(this);
};


User.prototype.setName = function(fName,lName) {
	this.fName = fName;
	this.lName = lName;
};

User.prototype.getName = function() {
	if(this.fName!=null && this.lName!=null){
		return this.fName+' '+this.lName;
	}
	return '';
};

//This function lets us keep the 0's and avoid overwriting existing stats array completely
User.prototype.updateStats = function(newStats) {
	for (var tmp in newStats) {
			this.stats[tmp]=parseInt(newStats[tmp]);
	}
};

User.prototype.updateLocation = function(position) {
	this.posn = position;
};

User.prototype.getLatLng = function() {
	if(this.posn){
		return new L.LatLng(this.posn.coords.latitude, this.posn.coords.longitude);
	}
	return null;
};

User.prototype.betaLogin = function(){
	var email = $('#login-email').val();
	var passcode =  $('#login-passcode').val();

	$.ajax(app.WEBSITE_ADDRESS+"/server/getUser.php?email="+email+"&passcode="+passcode, {
			 context: this,
			 dataType: 'json',
			 success: function(response) {
				console.log("successfuly returned. " + JSON.stringify(response));//TODO print type to dom
				// if email property is there login was succesful.
				if(response.email){
					app.user.setName( response.first_name, response.last_name);
					app.user.email = response.email;
					app.user.fbid=response.id;
					app.user.loggedIn = true;
					Communicate.setUser(app.user);

					//Get stats etc...
					this.loadJSON(response);
				} else{
					alert("login failed"); //TODO replace with native dailogue
				}
				AccountView.refreshUI();
			 },
			 error: function(err) {
				alert("login failed"); //TODO replace with native dailogue
				console.log("Error on getUser passcode ajax call. Error message: "+err.message);
			 },
			 timeout: 10000
	});

	AccountView.refreshUI();
};

User.prototype.facebookLogin = function() {
	FB.login(
		function(response) {
			if (response.authResponse) {
				console.log("FB.login is successfull, about to call user.updateUserFromFacebook");
				app.user.updateUserFromFacebook();
			} else {
				console.error('No auth response on FB login attempt.');
				console.log(response);
			}
		},
		{ scope: "email" }
		);
};

User.prototype.facebookLogout = function() {
	this.loggedIn=false;
	this.fbid=this.uid;
	AccountView.refreshUI();
	Communicate.setUser(app.user);
};

User.prototype.updateUserFromFacebook = function() {
	FB.api('/me', function(response) {
			app.user.setName( response.first_name, response.last_name);
			app.user.email = response.email;
			app.user.fbid=response.id;
			app.user.loggedIn = true;
			Communicate.setUser(app.user);

			AccountView.refreshUI();
		});
};

User.prototype.findAedChallenges = function(aedDatabaseId) {
	var aedChallenges = [];
	for(var i=0; i < this.challenges.length; i++) {
		if (this.challenges[i].aedId == aedDatabaseId) {
			this.challenges[i].listIndex = i;
			aedChallenges.push(this.challenges[i]);
		}
	}
	return aedChallenges;
};

User.prototype.getUserScores = function(){
		//FYI "stats":  gpsAnnotate login  mOk  mReport newAed picture text cfrmOk cfrmNo
	var scores = [];
	scores['New AEDs']=0;
	scores['Updates']=0;
	scores['Peer Reviews']=0;

	for (var stat in this.stats) {
		if (this.stats.hasOwnProperty(stat)) {
			if (stat=="newAed"){
				scores['New AEDs'] += parseInt(this.stats[stat]);
			}
			else if(stat=="picture" || stat=="text" || stat=="mOk" || stat=="mReport" || stat=="gpsAnnotate"){
				scores['Updates'] += parseInt(this.stats[stat]);
			}
			else if(stat=="cfrmNo" || stat=="cfrmOk"){
				scores['Peer Reviews'] += parseInt(this.stats[stat]);
			}
		}
	}

	return scores;
};


User.prototype.incrementStat = function(statName){
	if(this.stats){
		if(this.stats[statName]){
			this.stats[statName] = (parseInt(this.stats[statName])+ 1);
		} else{
			this.stats[statName] = 1;
		}
	}
};

// returns true if user has a position object that is least x minutes new.
//TODO: doesn't work on ios for some reason..
User.prototype.hasRecentPosition = function(minutes){

	if(this.posn && this.posn.timestamp){
		var now = new Date();
		var then = new Date(this.posn.timestamp);

		if((now - then) < (minutes*60*1000)){		
			return true;
		}
		
		return false;
	}

	return false;
}


/* TODO started trying to do a stats object
var Stats = {};
Stats['picture'] = {
	fullName:'',
	numOccurances:0,
	parentCategory:'Updates',
	icon:'',
	points:'' <- not needed if mapping to parent Categories
};

	*/
