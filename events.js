var Napkin = Napkin || {};

(function(N){
    if (!N.Class || !N.Interface){
        return;
    }

    var PublisherInterface = new N.Interface('Publisher', ['deliver', 'registerSubscriber', 'unregisterSubscriber']);
    var SubscriberInterface = new N.Interface('Subscriber', ['cancel', 'receive']);

    /* Publisher class */
    var Publisher = N.Class.extend(function(){
        this._subscribers = [];
        this._subscribers.foreach = function(fnc){
            var i,l;
            for(i = 0, l = this.length; i < l; i++){
                fnc(this[i]);
            }
        }
    })
        .method('registerSubscriber', function(subscriber){
            if (this._subscribers.indexOf(subscriber) === -1){
                this._subscribers.push(subscriber);
            }
        })
        .method('deliver', function(data){
            this._subscribers.foreach(function(el){
                el.receive(data);
            })
        })
        .method('unregisterSubscriber', function(subscriber){
            var i = this._subscribers.indexOf(subscriber);
            if (i !== -1){
                this._subscribers.splice(i, 1);
            }
        });

    /* Subscriber class */
    var Subscriber = N.Class.extend(function(publisher, fnc){
        Napkin.Interface.ensureImplements(publisher, Napkin.interfaces.Publisher);
        this.call = fnc;
        this.publisher = publisher;
        publisher.registerSubscriber(this);
    })
        .method('receive', function(data){
            this.call(data);
        })
        .method('cancel', function(){
            this.publisher.unregisterSubscriber(this);
        });

    /* Attach classes */
    N.Publisher = Publisher;
    N.Subscriber = Subscriber;

    /* Attach interfaces */
    N.interfaces.Publisher = PublisherInterface;
    N.interfaces.Subscriber = SubscriberInterface;

})(Napkin);