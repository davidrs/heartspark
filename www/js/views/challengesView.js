var ChallengesView={
    MAX_CHECK: 4,
    shownPopup: false,
    contentList:[],
    init: function(){
        //Add new nearby aeds to challenge list.
        for (var i = 0; i < app.aedList.closestAeds.length; i++) {
            if(i> this.MAX_CHECK && this.contentList.length > this.MAX_CHECK){
                break;
            }

            //New listings need approval:
            if (!this.alreadyExists(app.aedList.closestAeds[i].databaseIndex) &&
                app.aedList.closestAeds[i].trust < app.TRUST_MIN_FOR_CONFIDENT){

                var tmpChallenge = {
                    type:'newAed',
                    aedId: app.aedList.closestAeds[i].databaseIndex
                    //intentionally no eventId, because dynamically generated.
                };

                app.user.challenges.push(tmpChallenge);
            }
        }
    },
    alreadyExists: function(dbId){
        for(var i = 0; i < app.user.challenges.length; i++) {
            if(app.user.challenges[i].aedId == dbId){
                return true;
            }
        }
        return false;
    },
    putContentOnPage: function() {
        console.log("putContentOnPage");
        var challenges = app.user.challenges;
        var content = '';//<li data-role="list-divider" role="heading"> Challenges  </li>';
        var tmpObj={};
        this.contentList = [];

        if(app.numAppUses < 32 && !this.shownPopup){
            $( '.jQM-popup' ).popup('open');
            this.shownPopup = true;
        }

        //Get challenges for nearest 2
        //TODO instead of generic link to edit page put actual challenges here.
        for (var i = 0; i < app.aedList.closestAeds.length; i++) {
            if(i> this.MAX_CHECK && this.contentList.length > this.MAX_CHECK){
                break;
            }

            if (!this.alreadyExists(app.aedList.closestAeds[i].databaseIndex) 
                &&  app.aedList.closestAeds[i].hasDynamicChallenges()) {
                tmpObj={};
                tmpObj.text = '<li><a  href="edit.html" data-transition="slide" class="misc-challenge" data-icon="star" data-databaseid="'+app.aedList.closestAeds[i].databaseIndex+'">';
                tmpObj.text += '<div class="text-box"><h2 class="name">'+app.aedList.closestAeds[i].name+'</h2>' +
                                '<p class="ul-li-desc">Misc challenges</p></div><div class="distance">'+app.aedList.closestAeds[i].getDistance()+'</div></a></li>';
                tmpObj.distance = app.aedList.closestAeds[i].distance;
                this.contentList.push(tmpObj);
            }
        }

        //get challenge html and distances
        for (var i = 0; i < challenges.length; i++) {
            var challenge = challenges[i];
            var challengeAed = app.aedList.getAedDbId(challenge.aedId);
            if(challengeAed && challengeAed.distance < 25000){
                tmpObj={};
                tmpObj.text="";
                //TODO p text based on challenge type

                tmpObj.text += '<li data-theme="c"><a class="challengeLink" href="challenge.html" data-transition="slide" data-challengepos="'+i+'">';
                tmpObj.text += '<div class="text-box"><h2 class="name">' + challengeAed.name + '</h2><p class="ul-li-desc">';
                tmpObj.text += '<img src="img/icons/'+challenge.type+'.png" class="challenge-icon" /> ';
                tmpObj.text += ''+this.getTypeDescription(challenge.type)+'</p></div><div class="distance">'+challengeAed.getDistance()+'</div></a></li>';
                tmpObj.distance = challengeAed.distance;

                this.contentList.push(tmpObj);

            }
        }

        // sort challenges
        this.contentList.sort(createComparator("distance"));

        //print challenges
        for (var i = 0; i < this.contentList.length; i++) {
            content += this.contentList[i].text;
        }


         $('#challengesList').html(content).listview('refresh');
    },
    getTypeDescription:function(type){
        if(type=="newAed"){
            return 'Judge newly submitted AED';
        }
        else if(type=="picture"){
            return 'Judge picture update';
        }
        else if(type=="text"){
            return 'Judge text update';
        }
        return '';
    },
    addChallengeLinkListeners: function () {
        $('.challengeLink').on('click', function(event) {
           //#challenges-page #challengesList .challenge
            app.currentChallenge = app.user.challenges[$(this).data("challengepos")];
            app.currentAed = app.aedList.getAedDbId(app.currentChallenge.aedId);
        });

        $('.misc-challenge').on('click', function(event) {
            app.currentAed = app.aedList.getAedDbId([$(this).data("databaseid")]);
        });

    }
};
$(document).delegate('#challenges-page', 'pageinit', function(){
     ChallengesView.init();
});
$(document).delegate('#challenges-page', 'pageshow', function(){
     ChallengesView.putContentOnPage();
     ChallengesView.addChallengeLinkListeners();
});
