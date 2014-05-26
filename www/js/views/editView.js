    var EditView = {
    init: function() {
        this.fillInContent();
        this.addDynamicChallenges();
        this.addButtonListeners();
    },
    fillInContent :function () {
        var user = app.user;
        var aed = app.currentAed;

        $("#edit-page #aedInfo #nameLabel").text(aed.name);
        $("#edit-page #aedInfo #name").val(aed.name);
        $("#edit-page #aedInfo #addressLabel").text(aed.address);
        $("#edit-page #aedInfo #address").val(aed.address);
        $("#edit-page #aedInfo #descriptionLabel").text(aed.description);
        $("#edit-page #aedInfo #description").val(aed.description);

        // Find the challenges specifically for this Aed, and display them.
        var aedChallenges = user.findAedChallenges(aed.databaseIndex);
        var content = '';
        for(var i = 0; i < aedChallenges.length; i++) {
            var aedChallenge = aedChallenges[i];
            content += '<li data-theme="c"><a class="challengeLink" href="challenge.html" data-transition="slide" data-challengepos="';
            content += aedChallenge.listIndex + '">';
            //if you want icons you need icon styles, grab ones from challenge page
            //content +='<img src="img/icons/'+aedChallenge.type+'.png" class="challenge-icon" />';
            content +='<span class="type">Judge '+ aedChallenge.type + '  edit</span><span class="points-pill">25pt</span></a></li>';
        }
        $('#aedChallengesList').append(content).listview('refresh');
    },
    addDynamicChallenges: function(){
      var htmlContent = '';
      htmlContent += this.addMaintenanceChallenge();
      htmlContent += this.addPictureChallenge();
      htmlContent += this.addGPSChallenge();

        // TODO: add a challenge if the maintenance update hasn't been performed in a month
       $('#aedChallengesList').append(htmlContent).listview('refresh');
    },

    addMaintenanceChallenge: function(){
      var htmlContent='';

      if(app.currentAed.trust >  app.TRUST_MIN_FOR_CONFIDENT){
        htmlContent += '<li data-theme="c" id="maintenanceChallenge">'
                    + '<a class="challengeLink" id="openMaintenance" href="#" data-transition="slide">Monthly Check-up  '
                    + '<span class="points-pill">40pt</span></a></li>';

        $('#aedChallengesList').on('click','#openMaintenance',function() {
             $("#edit-page #aedInfo #maintenanceChallenge").hide();
             $.mobile.changePage("maintenanceCheck.html", { transition: "slideup"});
        });
      }
      return htmlContent;
    },
    addPictureChallenge: function(){
      var htmlContent='';

      if (app.currentAed.img == null) { //TODO should also make sure no outstanding 'judge pic'
        htmlContent += '<li data-theme="c" id="takePictureChallenge">'
                    + '<a class="challengeLink" id="getPicture" href="#" data-transition="slide">Take a Photo  '
                    + '<span class="points-pill">40pt</span></a></li>';

        $('#aedChallengesList').on('click','#getPicture',function() {
            // NB: since we are reusing the takePicture code (From the add aed flow), we need to have a different call back,
            // we don't want the user to be directed to the add aed extraInfo or thankyou page.
            // Therefore, we pass the callback function into takePicture (on default it goes through the add aed flow).
            SubmitPictureView.takePicture(function() {
                    app.user.incrementStat('picture');
                   $("#edit-page #aedInfo #takePictureChallenge").hide();
            });
        });
      }

      return htmlContent;
    },

    addGPSChallenge: function(){
      var htmlContent='';

      if(app.currentAed.numAnnotations<4){
        htmlContent += '<li data-theme="c"  id="gps-challenge"><a href="#" id="gps-update"><h2>Improve GPS</h2>';
        htmlContent += '<p>Stand next to the defib then press here to update. </p><span class="points-pill">40pt</span></a></li>';

        $('#aedChallengesList').on('click','#gps-update',function() {
          navigator.notification.confirm('Use your current gps to update this defibs location?',
                function(buttonIndex){
                    if(buttonIndex == "1"){
                          EditView.forceGPSUpdate();
                    }
                },
                'GPS Update',
                'Yes,No'
            );
        });
      }

      return htmlContent;
    },

    addButtonListeners: function () {
        $("#updateAed").click(function() {
                              EditView.updateAedToServer();
        });
        $("#editAed").click(function() {
                            EditView.displayInfo(true);
         });
        $("#cancelUpdate").click(function() {
                            EditView.displayInfo(false);
        });

        $(".challengeLink").on('click', function(event) {
          app.currentChallenge = app.user.challenges[$(this).data("challengepos")];
        });

    },
    displayInfo: function(updatingInfo) {
        if (updatingInfo) {
            $(".updateAed").show();
            $(".aedInfo").hide();
        }
        else if (!updatingInfo) {
            $(".updateAed").hide();
            $(".aedInfo").show();
        }
    },

    // For updating the aed's text
    updateAedToServer: function() {
        var name = $("#edit-page #aedInfo #name").val();
        var address = $("#edit-page #aedInfo #address").val();
        var description = $("#edit-page #aedInfo #description").val();

        if ((name != "" && address != "" && description != "") && (name != $("#edit-page #aedInfo #nameLabel").text() || address != $("#edit-page #aedInfo #addressLabel").text() || description != $("#edit-page #aedInfo #nameLabel").text())) {
            var parameters = {"editName":name, "editAddress":address, "editDescription":description, "public":"0"};
            parameters = JSON.stringify(parameters);

            $.ajax({
                   type : "GET",
                   url : app.WEBSITE_ADDRESS+"/server/update.php?fbid="+app.user.fbid+"&type=text&id=" + app.currentAed.databaseIndex+"&text="+parameters,
                   dataType : "json",
                   success : function(data) {
                       $("#edit-page #aedInfo #nameLabel").text(name);
                       $("#edit-page #aedInfo #addressLabel").text(address);
                       $("#edit-page #aedInfo #descriptionLabel").text(description);
                       EditView.displayInfo(false);

                       navigator.notification.alert('Thank you for the update! Your submission is being reviewed.', null, "Heart Spark");
                   },
                   error : function(data) {
                       OfflineRequests.addOfflineRequest(this.url);
                   },
                   statusCode : {
                       404 : function() {
                       console.errro("Text update to Server: page not found");
                   }
                   }
            });
        }
        else {
            navigator.notification.alert('None of the fields can be empty and you must change at least one value.', null, "Heart Spark");
        }
    },
    forceGPSUpdate: function(){
      //Pretend it succeded right away, cause waiting on GPS update below is slow, takes up to 1 min.
      $("#edit-page #aedInfo #gps-challenge").hide();
      app.user.incrementStat('gpsAnnotate');

      //try high accuracy first, if fails try low accuracy
      navigator.geolocation.getCurrentPosition(EditView.updateGPSToServer,
                                               function(err){
                                                //alert("err1");
                                                  navigator.geolocation.getCurrentPosition(EditView.updateGPSToServer,
                                                     function(err){
                                                       //alert("err2");
                                                                navigator.notification.alert('GPS update failed, please check your GPS settings.', null, "Heart Spark");

                                                     },
                                                       {   enableHighAccuracy: false,
                                                           timeout: 1000*30*1 ,
                                                           maximumAge: 5000 });
                                                  },
                                               {   enableHighAccuracy: true,
                                                   timeout: 1000*20*1 ,
                                                   maximumAge: 5000 });

    },
    updateGPSToServer: function(position){
      var lat= position.coords.latitude;// app.user.posn.coords.latitude;
      var lng= position.coords.longitude;
      //alert("accuracy:"+position.coords.accuracy);
     // alert("distance away: "+app.currentAed.posn.distanceTo(new L.LatLng(parseFloat(lat),parseFloat(lng))));
      if(app.currentAed.posn.distanceTo(new L.LatLng(parseFloat(lat),parseFloat(lng))) > (1.5*app.MIN_ACCURACY_DISTANCE)){
         navigator.notification.alert('Sorry, you are not closest enough to the AED.', null, "Heart Spark");
         return;
      }
       else if(position.coords.accuracy > app.MIN_ACCURACY_DISTANCE){
         navigator.notification.alert('Sorry, your GPS reading is not currently accurate enough.', null, "Heart Spark");
         return;
      }
      else{
        navigator.notification.alert('Thank you for the GPS update!', null, "Heart Spark");
      }


      console.log("try gps: "+app.WEBSITE_ADDRESS+"/server/update.php?fbid="+app.user.fbid+"&type=gps&id=" + app.currentAed.databaseIndex+'&lat='+lat+'&lng='+lng);

            $.ajax({
                   type : "GET",
                   url : app.WEBSITE_ADDRESS+"/server/update.php?fbid="+app.user.fbid+"&type=gps&id=" + app.currentAed.databaseIndex+'&lat='+lat+'&lng='+lng,
                   dataType : "json",
                   success : function(data) {
                        console.log("success");
                        app.currentAed.posn =  new L.LatLng(parseFloat(lat),parseFloat(lng));
                   },
                   error : function(data) {
                     console.log("fail");
                       OfflineRequests.addOfflineRequest(this.url);
                       navigator.notification.alert('GPS update failed, we\'ll try resending it later.', null, "Heart Spark");
                   },
                   statusCode : {
                       404 : function() {
                       console.error("Text update to Server: page not found");
                   }
                   }
            });

    }
};

$(document).delegate('#edit-page', 'pageshow', function(){
  EditView.init();
});