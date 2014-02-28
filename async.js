var Napkin = Napkin || {};

(function(N, $){

    N.async = N.async || {};

    N.async.getJson = function(url, callback){
        if (!url) throw Error('Cannot get json data without a url');
        $.ajax({
            type: 'GET',
            url: url
        }).done(function(msg){
            callback($.parseJSON(msg));
        });
    };

    N.async.post = function(url, data, callback){
        if (!url) throw Error('Cannot post data without a url');
        $.ajax({
            type: 'POST',
            url: url,
            data: data
        }).done(function(msg){
            callback($.parseJSON(msg));
        });
    }

})(Napkin, jQuery);