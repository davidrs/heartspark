//Stackoverfolw info: http://stackoverflow.com/questions/14646947/phonegap-pass-js-data-between-the-pages
Storage.prototype.setObject = function(key, value) { this.setItem(key, JSON.stringify(value)); }
Storage.prototype.getObject = function(key) { var value = this.getItem(key);return value && JSON.parse(value); }
