var Napkin = Napkin || {};

(function(N){

    if (!N.Class || !N.Interface){
        return;
    }

    // Interfaces for events module
    N.interfaces.Publisher = new N.Interface('Publisher', ['deliver', 'registerSubscriber', 'unregisterSubscriber']);
    N.interfaces.PublisherComposite = new N.Interface('Publisher Composite', ['hasPublisher', 'getPublisher'])
        .extend(N.interfaces.Publisher);
    N.interfaces.Subscriber = new N.Interface('Subscriber', ['cancel', 'receive']);

    /**
     * Allows a Class object to add publishers to their instances
     *
     * @this {Napkin.Class} - a Class that inherits from Napkin.Class
     * @param {...string} name - the names of all the publishers you want to add
     * @returns {Napkin.Class}
     * @throws
     */
    N.Class._base.publishers = function(name)
    {
        var i, l;
        this.prototype._publishers = this.prototype._publishers || {};
        for (i = 0, l = arguments.length; i < l; i++){
            name = arguments[i];
            if (!(typeof name === 'string')) throw new Napkin.exceptions.InvalidArgument('A publisher must be made with a string for a name.');
            this.prototype._publishers[name] = true;
        }
        return this;
    };

    N.Class._base.eventInitializer = function(name, func)
    {
        this._initializers = this._initializers || {};
        this._initializers[name] = func;
    };

    // Method to determine if an instance object has a publisher
    // Parameter name is the name of the publisher being searched for
    // Returns boolean - True if it has the publisher, false if not
    // All Napkin instances will inherit this method
    N.Class.prototype.hasPublisher = function(name)
    {
        return this._publishers && this._publishers[name] != false;
    };

    // Method to get an instance's publisher object by name
    // Parameter name
    N.Class.prototype.getPublisher = function(name)
    {
        if (! this.hasPublisher(name)) return null;
        if (!(this._publishers[name] instanceof Napkin.Publisher)){
            if (this._initializers && typeof this._initializers[name] === 'function'){
                this._initializers[name](this);
                this._initializers[name] = false;
            }
            this._publishers[name] = new Napkin.Publisher();
        }
        return this.publishers[name];
    };

    N.Class.prototype.deliver = function(name, data)
    {
        var publisher;
        if (publisher = this.getPublisher(name)){
            publisher.deliver(data)
        }
        return this;
    };

    N.Class.prototype.registerSubscriber = function(name, subscriber, returnOutcome)
    {
        returnOutcome = returnOutcome || false;
        var publisher;
        if (publisher = this.getPublisher(name)){
            publisher.registerSubscriber(subscriber);
            return returnOutcome ? true : this;
        }
        return returnOutcome ? false : this;
    };

    N.class.unregisterSubscriber = function(name, subscriber){
        var publisher;
        if (publisher = this.getPublisher(name)){
            publisher.unregisterSubscriber(subscriber);
            return this;
        }
        return this;
    };

    N.Class.prototype.subscribe = function(target, name, callback, handle)
    {
        Napkin.Interace.ensureImplements(target, Napkin.interfaces.PublisherComposite);
        if (target.hasPublisher(name)){
            var subscriber = new Napkin.Subscriber(target.getPublisher(name), callback);
            if (handle){
                this._subscribers = this._subscribers || {};
                this._subscribers[handle] = subscriber;
            }
        }
    };

    N.Class.prototype.cancelSubscription = function(handle)
    {
        var i;
        if (this._subscribers && (i = this._subscribers.indexOf(handle)) !== -1){
            this._subscribers[i].cancel();
            this._subscribers.splice(i, 1);
        }
        return this;
    };

    N.Class.prototype.addPublisher = function()
    {
        var i, l, name;
        this._publishers = this._publishers || {};
        for (i = 0, l = arguments.length; i < l; i++){
            name = arguments[i];
            if (!(typeof name === 'string')) throw new Napkin.exceptions.InvalidArgument('A publisher must be made with a string for a name.');
            this._publishers[name] = true;
        }
        return this;
    };


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
            Napkin.Interface.ensureImplements(subscriber, Napkin.interfaces.Subscriber);
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
        this.publisher = N.isArray(publisher) ? publisher : [publisher];
        publisher.registerSubscriber(this);
    })
        .method('receive', function(data){
            this.call(data);
        })
        .method('cancel', function(){
            this.publisher.unregisterSubscriber(this);
        });


    // Event data structure classes

    var Event = N.Class.extend(function(source, event){
        this.source = source;
        this.event = event;
        this.name = this.name || 'Event';
    });

    var FormEvent = Event.extend(function(source, event, value){
        this.name = this.name || 'Form Event';
        this.value = value;
        FormEvent.superclass.constructor.call(this, source, event);
    });

    var ChangeEvent = FormEvent.extend(function(source, event, value){
        this.name = 'Change Event';
        ChangeEvent.superclass.constructor.call(this, source, event, value);
    });

    var InputEvent = FormEvent.extend(function(source, event, value){
        this.name = 'Input Event';
        ChangeEvent.superclass.constructor.call(this, source, event, value);
    });

    var SubmitEvent = FormEvent.extend(function(source, event, value){
        this.name = 'Submit Event';
        ChangeEvent.superclass.constructor.call(this, source, event, value);
    });

    var ClickEvent = Event.extend(function(source, event){
        this.name = 'Click Event';
        ClickEvent.superclass.constructor.call();
    });

    N.event = N.event || {};
    N.event.Event = Event;
    N.event.FormEvent = FormEvent;
    N.event.Input = InputEvent;
    N.event.Change = ChangeEvent;
    N.event.Submit = SubmitEvent;
    N.event.Click = ClickEvent;


    /* Attach classes */
    N.Publisher = Publisher;
    N.Subscriber = Subscriber;


})(Napkin);