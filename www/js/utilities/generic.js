function createComparator(property) {
    return function(a, b) {
        return a[property] - b[property];
    };
}


function distanceToString(distance){
	return (distance > 1000 ? Math.round(distance/100)/10+" km": Math.round(distance)+" m");	
}

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


function getProp(a, type, lng) {
    var rs;
    loop: for ( var i = 0; i < a.length; i++) {
        for ( var j = 0; j < a[i].types.length; j++) {
            if (a[i].types[j] == type) {
                rs = a[i][lng];
                break loop;
            }
        }
    }
    return rs;
}
