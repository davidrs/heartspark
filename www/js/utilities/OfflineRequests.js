//Phonegap storage api: http://docs.phonegap.com/en/3.0.0/phonegap_storage_storage.md.html#localStorage
//TODO don't let a bad request sit in here forever. Will be easier once we differentiate between network fail and bad request fail
var OfflineRequests = {
	OFFLINE_REQUESTS_KEY: 'offlineRequests',

	getOfflineRequests: function(){
		return window.localStorage.getObject(this.OFFLINE_REQUESTS_KEY);
	},
	setOfflineRequests: function(offlineRequests){
		return window.localStorage.setObject(this.OFFLINE_REQUESTS_KEY,offlineRequests);
	},
	addOfflineRequest: function(requestString){
		var offlineRequests = this.getOfflineRequests();
		if(offlineRequests === null){
			offlineRequests =  [];
		}
		offlineRequests.push(requestString);
		this.setOfflineRequests(offlineRequests);
	},
	runAllOfflineRequests: function(){
		var offlineRequests = this.getOfflineRequests();

		if(offlineRequests !== null){
			for (var i = 0; i < offlineRequests.length; i++) {
				var requestString = offlineRequests[i];
				console.log("about to offline request "+i+": "+ requestString);
				$.ajax(requestString, {
					 context: this,
					 dataType: 'json',
					 success: function(response) {
						 var index = offlineRequests.indexOf(requestString);
						 offlineRequests.splice(index,1);
						 console.log("succeeded "+response);
						 this.setOfflineRequests(offlineRequests);

					 },
					 error: function(request, textStatus,  errorThrown ) {
					 	var index = offlineRequests.indexOf(requestString);
					 	console.log("Error on offline queue "+textStatus+" threw: "+errorThrown+"  - i:"+index+" : "+offlineRequests[index]);
					 	if(errorThrown && errorThrown=="bad request" || (textStatus && textStatus=="parsererror" )){//TODO < This isn't working, but it seems that bad requests end up insuccess anyway, and thus get removed..
							console.log("bad request");
					 		offlineRequests.splice(index,1);
							this.setOfflineRequests(offlineRequests);
					 	}
					 },
					 timeout: 10000
			  });

				}
			}
	}
};
