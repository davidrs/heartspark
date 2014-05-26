var AboutView={
    init: function() {
    	$('.content>div').hide();
    	$('#about-defibs').show();

    	$('#navbar a').click(function(event){
    		$('.content>div').hide();
    		$('#'+$(this).data('show')).show();
    	});
    }
};



$(document).delegate('#about-page', 'pageshow', function(){
    AboutView.init();
});