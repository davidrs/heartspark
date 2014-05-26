var ChallengeView={
    init: function() {
        this.putContentOnPage();
        this.addButtonListeners();
    },
    putContentOnPage: function() {
        var challenge = app.currentChallenge;
        var aed = app.currentAed;

        if (challenge.type=='newAed') {
            $("#challenge-page .content .type").html('<h3>New Defib Submitted</h3><p>Verify it exists then approve or reject this listing accordingly.</p>');
            $("#challenge-page .content .text-box").hide();
        }
        else{
            $("#challenge-page .content .name").html(aed.name);
            $("#challenge-page .content .description").html(aed.description);
            $("#challenge-page .content .distance").html(aed.getDistance());
            $("#challenge-page .content .type").html(challenge.type);
        }

        $("#challenge-page .content .newChallengeData").html(this.getNewContent(challenge,aed));
        $("#challenge-page .content .oldChallengeData").html(this.getOldContent(challenge,aed));

    },
    getNewContent: function (challenge,aed) {
        var type= challenge.type;
        var content= challenge.content;
        var html='';
        if(type=="picture"){
            html='<img src="'+app.WEBSITE_ADDRESS+'/server/'+content+'" width="120px">' ;  //TODO proper getImage call
        }
        else if ( type=="newAed"){
            html= "<strong>"+ aed.name+ "</strong> <br/>"
            + aed.description+ "<br/>"
            + aed.getShortAddress()+ "<br />";
            + aed.getHours();
        }
        else if(type=="text"){
            //New content
            html= unescape(content);
            html=html.replace(/\+/g," "); //replace + with spaces
            html=html.replace(/\\"/g,'"'); //replace \ with nothing
            //LowP server encoding on Live not the same as on local.
            var tmpObj=jQuery.parseJSON(html);

            html= "<strong>"+ tmpObj.editName+ "</strong> <br/>"
            +tmpObj.editDescription+ "<br/>"
            + tmpObj.editAddress+ "<br />";

            if(tmpObj.hasOwnProperty('time-submit-m-o')){
                html+= "Mon-Fri: " + tmpObj['time-submit-m-o']
                +" to "+ tmpObj['time-submit-m-c']
                +"<br/>Sat: "+ tmpObj['time-submit-st-o']
                +" to "+ tmpObj['time-submit-st-c']
                +"<br/>Sun: "+ tmpObj['time-submit-sn-o']
                +" to "+ tmpObj['time-submit-sn-c'] ;
            }
        }
        else{
            html=content+"";
        }

        return html;
    },
    getOldContent: function (challenge,aed) {
        var type= challenge.type;
        var content= challenge.content;
        var html='';

        if(type=="picture"){
            html= (imgPath!=''?'<h3>Old Picture</h3><img src="'+app.WEBSITE_ADDRESS+'/server/'+aed.img+'" width="120px" />' :'no image');  //TODO proper getImage call
        }
        else if(type=="text"  ){
            html= "<h3>Old Text</h3><strong>"+ aed.name+ "</strong> <br/>"
            + aed.description+ "<br/>"
            + aed.getShortAddress()+ "<br />";
            + aed.getHours();

        }
        else if ( type=="newAed"){
            html=""
        }
        else{
            html="";
        }
        return html;
    },
    addButtonListeners: function () {
        $("#rejectButton").click(function() {
            //DRS stats doesan't exist
            app.user.stats['cfrmNo'] = (parseInt(app.user.stats['cfrmNo'])+ 1);
            ChallengeView.sendApproveOrDenyToServer(false);
        });
        $("#approveButton").click(function() {
            app.user.stats['cfrmOk'] = (parseInt(app.user.stats['cfrmOk'])+ 1);
            ChallengeView.sendApproveOrDenyToServer(true);
        });
        $('.current-aed-map').click( function(event){
            AedView.gotoMap();
        });
    },
    sendApproveOrDenyToServer: function(approved) {
        $.ajax(app.WEBSITE_ADDRESS+"/server/update.php?fbid="+app.user.fbid+"&id="+app.currentChallenge.aedId+"&type=confirmation&approve="+approved+"&eventId="+app.currentChallenge.eventId, {
			success: function(response) {
				app.removeChallenge(app.currentChallenge.eventId);
			},
			error: function(request, errorType, errorMessage) {
				OfflineRequests.addOfflineRequest(this.url);
			}
        });
        $('#vote-buttons').html("Thank you for the review, 20pts for you!");
    }
};

$(document).delegate('#challenge-page', 'pageshow', function(){
    ChallengeView.init();
});
