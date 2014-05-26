//Phonegap storage api: http://docs.phonegap.com/en/3.0.0/phonegap_storage_storage.md.html#localStorage

var Communicate = {
	CLOSEST_AEDS_KEY: 'closestAeds',
	ALL_AEDS_KEY: 'allAeds',
	USER_KEY: 'user',

    /*
   	CURRENT_AED_POS_KEY: 'currentAedPos',
    Commenting out for now, could be useful for multipage apps.
	getCurrentAedPos: function(){
		return window.localStorage.getObject(this.CURRENT_AED_POS_KEY);
	},
	setCurrentAedPos: function(aedPos){
		return window.localStorage.setObject(this.CURRENT_AED_KEY,aedPos);
	},*/

	getClosestAeds: function(){
		return window.localStorage.getObject(this.CLOSEST_AEDS_KEY);
	},
	setClosestAeds: function(aeds){
		return window.localStorage.setObject(this.CLOSEST_AEDS_KEY,aeds);
	},

	getAllAeds: function(){
		return window.localStorage.getObject(this.ALL_AEDS_KEY);
	},
	setAllAeds: function(aeds){
		return window.localStorage.setObject(this.ALL_AEDS_KEY,aeds);
	},

	getUser: function(){
		return window.localStorage.getObject(this.USER_KEY);
	},
	setUser: function(user){
		return window.localStorage.setObject(this.USER_KEY,user);
	}
};
