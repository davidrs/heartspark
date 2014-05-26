var ListView={
    init: function(){
	    this.updateList();

        $( GLOBAL ).on( "nclosest-changed", function(event){
        	    ListView.updateList();
        });
    },
    updateList: function() {
    	if($('#closestAedsList').length){
			if(app.aedList == null || app.aedList.closestAeds == null){
				$('#closestAedsList').html("Closest Aeds not found. Please check your data and gps.").listview('refresh');
			}
			else{

				var closestAeds = app.aedList.closestAeds;
				var output = "";
				for (var i = 0; i < closestAeds.length; i++) {
					if(closestAeds[i].trust > app.TRUST_MIN_TO_SHOW){
						output += '<li data-theme="c"><a class="aedLink" href="#" data-transition="slide" data-pos="';
						output += closestAeds[i].listIndex+'"><div class="text-box"><h2 class="ui-li-heading">'+closestAeds[i].name+'</h2>';
						output += '<p class="ul-li-desc">'+closestAeds[i].description+'</p></div><div class="distance">'+closestAeds[i].getDistance()+'</div></a></li>';
					}
				}

				$('#closestAedsList').html(output).listview('refresh');

	        	this.addAedLinkListeners();
			}
		}

    },
    addAedLinkListeners: function () {
        $('.aedLink').on('click', function(event) {
        	event.preventDefault();
            Map.aedMarkerClick(this);
        });
    }
};

$(document).delegate('#list-page', 'pageinit', function () {
    ListView.init();

});
/*
$(document).delegate('#list-page', 'pagebeforeshow', function(){
	ListView.init();
});

*/
