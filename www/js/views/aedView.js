var AedView={
    init: function() {
       //DRS take map off of aed page.
       //$("#aed-page .map-container").append(Map.mapDOM);       // Map.resizeMap();
        this.putContentOnPage();

    },
    putContentOnPage: function() {
        var currentAed = app.currentAed;
        if (currentAed.img != null) {
            ImageStorage.loadImage(app.WEBSITE_ADDRESS+"/server/"+currentAed.img,
                                    currentAed.getImgName(),
                                    $("#aed-page .content .imageContainer .imageOfAed"));
        }
        $("#aed-page .content .name").html(currentAed.name);
        $("#aed-page .content .description").html(currentAed.description);
        $("#aed-page .content .address").html(currentAed.getShortAddress());
        $("#aed-page .content .distance").html(currentAed.getDistance());
    },
    gotoMap:function(){
        if(Map != null){
            Map.panTo(app.currentAed.posn);
            Map.zoomTo(15);
            Map.focus = 'currentAed';
        }
        $.mobile.changePage("map.html", "none", true, false);
    }
};


$(document).delegate('#aed-page', 'pagebeforeshow', function(){
    AedView.init();
});

$(document).delegate('#aed-page', 'pageshow', function(){
        $( GLOBAL ).on( "currentAed-changed", function(event){
            AedView.putContentOnPage();
        });
        $('.current-aed-map').click( function(event){
            AedView.gotoMap();
        });
        $('.btn-challenges').click( function(event){
            $.mobile.changePage("edit.html", "none", true, false);
        });
});
