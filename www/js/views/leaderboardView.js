var LeaderboardView={
    init: function() {
        this.putContentOnPage();
    },
    putContentOnPage: function() {
        var leaderboard = app.user.leaderboard;
		var content='';
		if(leaderboard != null){
			for(var i=0; i < leaderboard.length; i++){
				content += '<li  data-theme="c"><img src="img/profileDefault.jpg" id="leader'+i+'" width="238" height="238"/><h3>';
				content += leaderboard[i].name+'</h3><p class="points">'+leaderboard[i].score+' pts.</p></li>';
			}
			$('#leaderboardList').append(content).listview('refresh');
			this.getImages(leaderboard);
		}
    },
	getImages: function(leaderboard){
		for(var i=0; i < leaderboard.length; i++){
			//facebook disabled version
			if(leaderboard[i].id<1000){
					$('#leaderboardList #leader'+i).prop("src", "img/profileDefault.jpg");
			}
			else{//Facebok version:
				ImageStorage.loadImage("http://graph.facebook.com/"+leaderboard[i].id+"/picture?width=238&height=238",
										"leader_"+leaderboard[i].id+".jpg",
										$('#leaderboardList #leader'+i));
			}
		}
	}
};

$(document).delegate('#leaderboard-page', 'pageinit', function(){
    LeaderboardView.init();
});