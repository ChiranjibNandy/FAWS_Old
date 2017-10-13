(function(){    
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(str, position) {
          position = position || 0;
          return this.indexOf(str, position) === position;
        };
    }
});