var DuplicatesView={
    populateList: function() {
        $('#duplicateAedsList #duplicateAedsListHeading').html(
            "Defibrilators Nearby");

        var closestAeds = app.aedList.closestAeds;
        var output = '';

        for (var i = 0; i < closestAeds.length; i++) {
            if(output!=='' && closestAeds[i].distance > app.RADIUS_FOR_NEARBY_AEDS_METERS){
                break;
            }
            output += '<li data-theme="c"><a class="aedLink aed-edit-link" href="#" data-pos="'+closestAeds[i].listIndex+'">'+closestAeds[i].name+' <span class="distance">'+ closestAeds[i].getDistance()+'</span></a></li>';
        }

        $('#duplicateAedsList').append(output).listview('refresh');
    },
    addAedLinkListeners: function () {
        $('.aed-edit-link').on('click', function(event) {
            event.preventDefault();
            app.currentAed = app.aedList.getAed($(this).data("pos"));
            $.mobile.changePage("edit.html", { transition: "slide"});
        });
    }
};

$(document).delegate('#duplicates-page', 'pagebeforeshow', function(){
                     DuplicatesView.populateList();
                     DuplicatesView.addAedLinkListeners();
});
