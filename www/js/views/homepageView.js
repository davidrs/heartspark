var HomepageView = {
	isSplashRunning: false,
	init: function() {
		this.addButtonListener();
	},
	addButtonListener: function () {
		$('#search-button').click(function(event) {
			HomepageView.showSearchView();
		});

		$('#foundAed').on('click', function(event) {
			//TODO change if to see if closes ones are < threshold
			if(app.aedList.closestAeds === null || app.aedList.closestAeds.length<=0){
				$.mobile.changePage("submit.html", { transition: "slideup"});

			}
			else{
				if(app.aedList.closestAeds && app.aedList.closestAeds[0].distance > app.RADIUS_FOR_NEARBY_AEDS_METERS){
					$.mobile.changePage("submit.html", { transition: "slideup"});
				}
				else{
					$.mobile.changePage("duplicates.html", { transition: "slideup"});
				}

			}
		});
	},
	showSplash: function(){
		//Get/update num of app uses
		this.numAppUses = localStorage.getItem("numAppUses");
		this.numAppUses++;
		localStorage.setItem("numAppUses",this.numAppUses);

		//If a newby show splash intro.
		//DISABLED: intro animation not necessary.
		/*
		if(app.numAppUses < 3){
			this.playIntroAnimation();
		}
		*/
	},
	hideMenu: function(){
		$('#main-menu a').hide();
	},
	showMenu: function(){
		if(HomepageView.isSplashRunning){
			return;
		}
		$('#main-menu a').show();
	},

	showSearchView: function(){
		var oldTime = new Date()-2000000000; //old
		if(app.user && app.user.posn && app.user.posn.timestamp){
			app.user.posn.timestamp = oldTime;
		}
		GPS.setLocationOnce = false; // so onUserLocationUpdate treats it like the first time.
		HomepageView.refreshUI();
	},

	refreshUI: function(){
		if(!DEVICE_READY){
			return;
		}

		if(app.user && app.user.hasRecentPosition(10)){
			HomepageView.showMenu();
		}
		//Clean up
		$('#home-info').html('');
		$('#manual-location').remove();

		/* DISABLE Code. Was broken because missing connectivity plugin on ios
		// Add this to cofig if trying again <gap:plugin name="org.apache.cordova.network-information" version="0.2.7" />
		if(this.isOffline && !GPS.setLocationOnce){
			$('#home-info').html('No internet connection or GPS found.<br />').show();
		} else if(this.isOffline){
				$('#home-info').html('No internet connection found.<br />').show();
		} else */
		if((!app.user || !app.user.hasRecentPosition(10)) && $('submit-my-location').length<1){
			HomepageView.hideMenu();
			$('#home-info').after('<div id="manual-location"><label for="my-location" >Turn on GPS or Search Location:</label>'+
								'<input type="text"  name="my-location" id="my-location" value="" placeholder="Wood Ave, New York">'+
								'<a href="#" id="submit-my-location" data-role="button" data-inline="true" class="pull-right" data-theme="b">Search</a>'+
								'</div>');

			$( "#my-location" ).textinput();
			$( "#submit-my-location" ).button();

			$('#submit-my-location').click(function(e){
				e.preventDefault();
				var addressString = $('#my-location').val();
				$('#home-info').show().html('Searching...').show();
				$('#manual-location').remove();
				GPS.geocodeAddress(addressString, 
					function(location){
						if(location){
							var manualPosn = {
								coords:{
									latitude: (location.d ? location.d : location.k),
									longitude: (location.e ? location.e : location.A),
									accuracy: 20 },
								timestamp:  new Date()
							};
							GPS.setLocationOnce = false; // so onUserLocationUpdate treats it like the first time.
							


							GPS.onUserLocationUpdate(manualPosn);
							$.mobile.changePage("map.html", { transition: "slideup"});
						} else{
							HomepageView.showSearchView();
						}
					});
			});
		} else if($('#home-info').html() === '' || this.GPSErrorCount <= 0){
			if($(window).height() < 500){
				$('#home-info').hide();
			} else if(!app.user || app.user.trust < 6){
				$('#home-info').html('Save lives by adding new defibs.<br />Find the nearest ones!').show();
			} else{
				$('#home-info').html(randomFacts[Math.floor(Math.random()*randomFacts.length)]).show();
			}
		}
	},

	playIntroAnimation: function(){
		HomepageView.isSplashRunning = true;
		HomepageView.hideMenu();
		$('#logo').hide();
		$('#home-info').hide();
		var centerText = $('.centerText');
		var info1 = $('<img src="img/info_1.png"  style="display:none;" />');
		var info3 = $('<img src="img/info_3.png" style="display:none;" />');
		centerText.height('300');
		centerText
			.append(info1)
			.append(info3);

			info1.fadeIn().delay(1500)
			.fadeOut(function(){
				$(this).remove();
				info3.fadeIn().delay(1500)
				.fadeOut(function(){
					$(this).remove();
					centerText.height('auto');
					$('#logo').fadeIn();
					$('#home-info').fadeIn();
					HomepageView.isSplashRunning = false;
					HomepageView.refreshUI();
				});
			});
	},
};


$(document).delegate('#index', 'pageinit', function () {
	HomepageView.init();
});

$(document).delegate('#index', 'pageshow', function () {
	//force deactivate hack ui bug fix
	$('#main-menu [data-role="button"]').removeClass($.mobile.activeBtnClass);
	Map.focus="user"; //reset user focus on map
	HomepageView.refreshUI();
});


var randomFacts = [];

randomFacts.push("Signs of cardiac arrest include: no breathing or only gasping, no movement, and no pulse.");
randomFacts.push("Up to 40,000 cardiac arrests occur each year in Canada.");
randomFacts.push("There’s one cardiac arrest every 12 minutes in Canada.");
randomFacts.push("AEDs are so easy to use that untrained 6th graders can use them.");
randomFacts.push("Survival rate drops by 7 to 10% for every minute without defibrillation.");
randomFacts.push("After 12 min without a defibrillator the survival rate is less than 5%");
randomFacts.push("Chicago airports public access to AED program showed survival rates as high as 56%.");
randomFacts.push("AEDs are safe, effective and easy to use by laypersons");
randomFacts.push("Any place with 1000 adults, age 35+, per day can expect one cardiac arrest every 5 years.");
randomFacts.push("Legislation in provinces across Canada protects individuals who use AEDs from liability when they are used in the context of saving a life.");
randomFacts.push("Combined with CPR, an AED may increase the likelihood of survival by 75% or more.");
randomFacts.push("Common AED locations: gyms, airports, airplanes, shopping malls, recreation facilities, office buildings and other public locations.");
