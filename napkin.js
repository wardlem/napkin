// Namespace
var Napkin = Napkin || {};

(function(N){

    N.augment = function(){
        var override = arguments[0] === true, i, l, target;
        if (arguments.length < 2)throw new Napkin.exceptions.InvalidArgument('Napkin.augment() requires at least two object arguments');
        i = override ? 2 : 1;
        target = arguments[i-1];
        if (typeof target !== 'object') {
            throw new Napkin.exceptions.InvalidArgument('Napkin.augment() requires an object as the first parameter or true as the first and an object as the second argument');
        }

        for (i, l = arguments.length; i < l; i++){
            if (typeof arguments[i] !== 'object') throw new Napkin.exceptions.InvalidArgument('Napkin.augment() received an argument that was not an object');
            for (var prop in arguments[i]){
                if (override || typeof target[prop] === 'undefined'){
                    target[prop] = arguments[i][prop];
                }
            }
        }
        return target;
    };

    N.isArray = (function(){
        return Array.isArray ? Array.isArray : function(test){
            // TODO: Make this more robust
            return test instanceof Array;
        }
    })();

    /*
     * Class is a factory for creating classes
     */
    var Class =
    {
        // Called to add base class methods on a new class object
        _base: function(){
                this.extend = function(constructor)
                {
                    return Napkin.Class.extend.call(this, constructor);
                };

                this.method = function(name, func)
                {
                    // Assign name to the prototype object with a value of func
                    this.prototype[name] = func;

                    // Return this so we can use chaining
                    return this;
                };

                this.augment = function()
                {
                    // Iterate over the mix-in arguments
                    for (var i = 0, l = arguments.length; i < l; i++){
                        var obj = arguments[i];

                        // Make sure the mix-in object is in fact an object; if not, skip it
                        if (typeof obj === 'object'){

                            // Iterate over the mix-in's properties
                            for (var prop in obj){
                                // If the class object does not already have the property, add it
                                if (!this.prototype[prop]){
                                    this.prototype[prop] = obj[prop];
                                }
                            }
                        }
                    }

                    // Return this so we can use chaining
                    return this;
                };

                this.publishers = function(name)
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

                this.eventInitializer = function(name, func)
                {
                    this.prototype._initializers = this.prototype._initializers || {};
                    this.prototype._initializers[name] = func;
                    return this;
                };

        },

        extend: function(constructor){
            var isBase = this === Class;
            if (!constructor || !(typeof constructor === 'function' )) {
                // Constructor set to an empty function
                constructor = function(){};
                if (!isBase){
                    // constructor's constructor set to its parent's constructor
                    constructor.prototype.constructor = this.prototype.constructor;
                }
            }
            constructor.superclass = this.prototype;
            Class._base.call(constructor);
            var c = constructor.prototype.constructor;
            var F = function(){};
            F.prototype = this.prototype;
            constructor.prototype = new F();
            constructor.prototype.constructor = c;

            return constructor;
        },

        prototype: Function.prototype
    };

    N.Class = Class;

    var Interface = N.Class.extend(function(name, methods)
    {
        // Name is used for error reporting
        this.name = name;

        // Ensure that a methods argument is passed and that it is an array with at least one value
        if (!(Napkin.isArray(methods)) || methods.length < 1){
            throw new Napkin.exceptions.InvalidArgument('An interface must be instantiated with an array of at least one method for second parameter.');
        }

        // Ensure that each method is a string before saving it to the methods array
        this.methods = [];
        for(var i = 0, l = methods.length; i < l; i++){
            if (typeof methods[i] !== 'string'){
                throw new Napkin.exceptions.InvalidArgument('An interface\'s methods must be strings.');
            }
            this.methods.push(methods[i]);
        }

    }).method('inherit',function(){
        for (var i = 0, l = arguments.length; i < l; i++){
            var obj = arguments[i];
            if (!(obj instanceof Interface)){
                throw new Napkin.exceptions.InvalidArgument('An interface can not inherit from an object that is not an interface.  Attempted by interface ' + this.name + '.');
            }
            for (var j = 0, methodLength = obj.methods.length; j < methodLength; j++){
                if (this.methods.indexOf(obj.methods[j]) !== -1){
                    this.methods.push(obj.methods[j]);
                }
            }
        }

        return this;
    });

    Interface.ensureImplements = function(object)
    {
        // Make sure there are at least two arguments given: the test object and one or more interfaces
        if (arguments.length < 2){
            throw new Napkin.InvalidArgument('Function Interface.ensureImplements: expected at least 2 arguments, but fewer received.');
        }

        // Iterate through interface arguments
        for (var i = 1, l = arguments.length; i < l; i++){

            // Make sure the interface is in fact an Interface instance
            if (arguments[i].constructor !== Interface){
                throw new Napkin.InvalidArgument('Function Interface.ensureImplements: expected arguments 2 and up to be instances of Interface class');
            }

            // Make sure the test object has all the necessary methods to be considered an implementation of the interface
            for (var j = 0, methodsLength = arguments[i].methods.length; j < methodsLength; j++){
                var method = arguments[i].methods[j];
                if (! object[method] || typeof object[method] !== 'function'){
                    throw new Napkin.exceptions.InterfaceViolation('Function Interface.ensureImplements: object was found that does not implement interface ' +
                        arguments[i].name + '. It did not implement method ' + method + '.'
                    )
                }
            }
        }
    };

    N.Interface = Interface;


    // Sugar for the built in Error class
    Error.prototype.toString = Error.prototype.toString || function(){ return this.name + ': ' + this.message};
    Error.prototype.getNextTrace = function(){return null;};

    // Exception interface
    N.interfaces = N.interfaces || {};
    N.interfaces.Exception = new N.Interface('Exception', ['toString', 'getNextTrace']);

    // Exception class
    N.Exception = Napkin.Class.extend(function(message, file, line, code, trace){
        this.trace = trace || null;
        this.errName = this.errName || 'Napkin Exception';
        this.code = code || 0;
        this.message = message;
        this.file = file || '?';
        this.line = line || '?';
    })
        .method('toString', function(){
            return this.errName + '(file: ' + this.file + '; line: ' + this.line + '; code: ' + this.code + '): ' + this.message;
        })
        .method('getNextTrace', function(){
            return this.trace;
        });

    N.Exception.getTraceString = function(exception){
        if (! exception) return '';
        Napkin.Interface.ensureImplements(Napkin.interfaces.Exception, exception);
        return exception + '\n' + this.getTraceString(exception.getNextTrace());
    };

    N.Exception.getTraceObject = function(exception, i){
        var obj = {};
        i = typeof i === 'number' ? i : 0;
        if (!exception) return obj;
        Napkin.Interface.ensureImplements(Napkin.interfaces.Exception, exception);
        obj[i] = exception;
        return Napkin.augment(this.getTraceObject(exception.getNextTrace(), i + 1), obj);
    };

    // Specific Exceptions
    N.exceptions = {};
    N.exceptions.InvalidArgument = Napkin.Exception.extend(function(message, file, line, code, trace){
        this.errName = 'Invalid Argument Exception';
        Napkin.exceptions.InvalidArgument.superclass.constructor.call(this, message, file, line, code, trace);
    });
    N.exceptions.InterfaceViolation = Napkin.Exception.extend(function(message, file, line, code, trace){
        this.errName = 'Interface Violation Exception';
        Napkin.exceptions.InvalidArgument.superclass.constructor.call(this, message, file, line, code, trace);
    });

    if (!N.Class || !N.Interface){
        return;
    }

    // Interfaces for events module
    N.interfaces.Publisher = new N.Interface('Publisher', ['deliver', 'registerSubscriber', 'unregisterSubscriber']);
    N.interfaces.PublisherComposite = new N.Interface('Publisher Composite', ['hasPublisher', 'getPublisher'])
        .inherit(N.interfaces.Publisher);

    N.interfaces.Subscriber = new N.Interface('Subscriber', ['cancel', 'receive']);

    /**
     * Allows a Class object to add publishers to their instances
     *
     * @this {Napkin.Class} - a Class that inherits from Napkin.Class
     * @param {...string} name - the names of all the publishers you want to add
     * @returns {Napkin.Class}
     * @throws
     */


    // Method to determine if an instance object has a publisher
    // Parameter name is the name of the publisher being searched for
    // Returns boolean - True if it has the publisher, false if not
    // All Napkin instances will inherit this method
    N.Class.prototype.hasPublisher = function(name)
    {
        return this._publishers && this._publishers[name]  ;
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

        return this._publishers[name];
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

    N.Class.prototype.unregisterSubscriber = function(name, subscriber){
        var publisher;
        if (publisher = this.getPublisher(name)){
            publisher.unregisterSubscriber(subscriber);
            return this;
        }
        return this;
    };

    N.Class.prototype.subscribe = function(target, name, callback, handle)
    {
        Napkin.Interface.ensureImplements(target, Napkin.interfaces.PublisherComposite);
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
        this.fnc = fnc;
        this.publisher = N.isArray(publisher) ? publisher : [publisher];
        publisher.registerSubscriber(this);
    })
        .method('receive', function(data){
            this.fnc(data);
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
