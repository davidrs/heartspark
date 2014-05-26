var MaintenanceCheckView={
    init: function() {
        this.addButtonListeners();
    },
    addButtonListeners: function () {
        $("#ok-button").click(function() {
            app.user.stats['mOk'] = (parseInt(app.user.stats['mOk'])+ 1);
            MaintenanceCheckView.sendReportToServer(true);
        });

        $("#bad-button").click(function() {
            app.user.stats['mReport'] = (parseInt(app.user.stats['mReport'])+ 1);
            MaintenanceCheckView.sendReportToServer(false);
        });

        $('.current-aed-map').click( function(event){
            AedView.gotoMap();
        });
    },
    sendReportToServer: function(approved) {
        var status = (approved ? 'ok':'report');

        //message only used on server side if 'report'.
        var message= encodeURIComponent($('#maintenance-message').val());

        $.ajax(app.WEBSITE_ADDRESS+"/server/update.php?fbid="+app.user.fbid+"&id="+app.currentAed.databaseIndex+"&type=maintenance&status="+status+"&message="+message, {
			success: function(response) {

			},
			error: function(request, errorType, errorMessage) {
				OfflineRequests.addOfflineRequest(this.url);
			}
        });
        $('#vote-buttons').html("<h3>Thank you for the update, 40pts for you!</h3>");
        $('#maintenance-message').hide();
    }
};

$(document).delegate('#maintenance-check-page', 'pageshow', function(){
    MaintenanceCheckView.init();
});
