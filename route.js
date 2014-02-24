var Napkin = Napkin || {};

(function(N){

    if (!N.Class || !N.Interface){
        return;
    }

    var Route = N.Class.extend(function(url, method){
        this.url = url;
        this.method = method || 'GET'
    })
        .method('send', function(data){
            var result;
            $.ajax({
                url: this.url,
                method: this.method(),
                data: data
            }).done(function(msg){
                result = msg;
            });
        });

    var SaveRoute = Route.extend(function(url){
        SaveRoute.superclass.constructor.call(this, url, 'POST');
    });





})(Napkin);