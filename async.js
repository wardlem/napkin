var Napkin = Napkin || {};

(function(N, $){

    N.async = N.async || {};

    N.async.getJson = function(url, callback){
        if (!url) throw Error('Cannot get json data without a url');
        $.ajax({
            method: 'GET',
            url: url
        }).done(function(msg){
            callback($.parseJSON(msg));
        });
    }

})(Napkin, jQuery);