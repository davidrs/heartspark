var AccountView={
	shownPopup: false,

	init: function(){
		$('#account-picture').hide();//facebook disabled
		$('.fbLogoutButton').hide();
		$(".addNameButton").hide();
		this.addButtonListeners();
	},

	addButtonListeners: function() {
		$(".fbLoginButton").click(function() {
			$("#accountName").text("Logging in.");
			$("#accountName").show();

			//app.user.facebookLogin(); facebook disabled
			app.user.betaLogin();
		});
		$(".fbLogoutButton").click(function() {
			app.user.facebookLogout();
		});
		$(".addNameButton").click(function() {
			AccountView.showNamePrompt();
		});
	},

	updateStats: function(){
		var numEvents = app.user.getUserScores();
		var pointValues = app.user.getPointValues();
		var tableContent='';
		var totalEvents=0;
		var totalPoints=0;

		for (var eventType in numEvents) {
			numEvents[eventType]=(isNaN(numEvents[eventType])? 0 :numEvents[eventType] );
			tableContent += '<tr><td>'+eventType+'<small>('+pointValues[eventType]+' pts.)</small></td><td>'+numEvents[eventType]+'</td><td>'+numEvents[eventType] * pointValues[eventType]+'</td></tr>';
			totalEvents += numEvents[eventType];
			totalPoints += numEvents[eventType] * pointValues[eventType]
		}

		tableContent += '<tr><td><strong>Total</strong></td><td>'+totalEvents+'</td><td>'+totalPoints+'</td></tr>';
		$("#userTable").html(tableContent);

	},
	
	refreshUI: function() {
		if(!app.user.loggedIn && app.numAppUses < 3 && !this.shownPopup){
			$( '.jQM-popup' ).popup('open');
			this.shownPopup = true;
		}


		if(app.user!=null){
			//console.log("Welcome uid: "+app.user.uid );
			if(app.user.loggedIn){
				$('#login-container').hide();
				$('.fbLogoutButton').show();
				$('#accountStats').show();
				$('#accountBadges').show();

				if(app.user.getName()==='' || app.user.getName()===' '){
					$(".addNameButton").show();
				}
				else{
					$("#accountName").text(app.user.getName());
					$("#accountName").show();
					$(".addNameButton").hide();
				}

				this.updateStats();
				this.setBadgeOpacities();
				//this.updatePicture(); /facebook disabled
			}
			else{
				$('#login-container').show();
				$('.fbLogoutButton').hide();
				$(".addNameButton").hide();
				$("#accountName").hide();
				$('#accountStats').hide();
				$('#accountBadges').hide();
				$("#account-picture").prop("src", "img/profileDefault.jpg");
			}
		}
		else{
			console.log("user is null.");
		}
	},

	updatePicture: function(){
	var date = new Date();
		ImageStorage.loadImage("http://graph.facebook.com/"+app.user.fbid+"/picture?width=200&height=238",
								"account-pic-"+app.user.fbid+"-"+date.getMonth()+date.getFullYear()+".jpg",
								$("#account-picture"));
	},

	setBadgeOpacities: function(){
		//new user badge
		if(app.user.loggedIn){
			$(('#1_newUser')).css('opacity',1).prependTo('#badge-box');

		}
		else{
			$(('#1_newUser')).css('opacity',0.4);
		}

		//All other badges
		for (var tmp in app.user.stats) {
			if(app.user.stats[tmp]>0){
				$(('#1_'+tmp)).css('opacity',1).prependTo($('#badge-box'));
			}
			if(app.user.stats[tmp]>2){
				$(('#3_'+tmp)).css('opacity',1).prependTo('#badge-box');
			}
			if(app.user.stats[tmp]>4){
				$(('#5_'+tmp)).css('opacity',1).prependTo('#badge-box');
			}
		}

	},

	showNamePrompt: function(){
		navigator.notification.prompt(
			'Please enter your name',  // message
			this.onPromptReturn,                  // callback to invoke
			'Name',            // title
			['Ok','Exit'],             // buttonLabels
			'Hannah Heart'                 // defaultText
		);
	},

	onPromptReturn: function(results) {
		if(results.buttonIndex==1){
			var names = $.trim(results.input1);

			var nameAry = names.split(" ");
			if(nameAry){
					if(nameAry.length > 0){
						app.user.updateName(nameAry[0],(nameAry[1] ? nameAry[1]:''),this.refreshUI);
					}
			}
		}
	}
};

$(document).delegate('#account-page', 'pageinit', function () {
	AccountView.init();
});

$(document).delegate('#account-page', 'pageshow', function () {
	AccountView.refreshUI();
});
