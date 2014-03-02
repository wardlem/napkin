// Namespace
var Napkin = Napkin || {};

(function(N){

    /*
     * Class is a factory for creating classes
     */
    var Class =
    {
        // Called to add base class methods on a new class object
        _base: function(parent){
            this.extend = function(constructor)
            {
                return Class.extend.call(this, constructor);
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

            // Set the superclass appropriately
            this.superclass = parent;
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
            var superclass = this.prototype;

            Class._base.call(constructor, superclass);
            var c = constructor.prototype.constructor;
            var F = function(){};
            F.prototype = this.prototype;
            constructor.prototype = new F();
            constructor.prototype.constructor = c;

            return constructor;
        }
    };


    var Interface = Class.extend(function(name, methods)
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

    // Sugar for the built in Error class
    Error.prototype.toString = Error.prototype.toString || function(){ return this.name + ': ' + this.message};
    Error.prototype.getNextTrace = function(){return null;};

    // Exception interface
    Napkin.interfaces.Exception = new Napkin.Interface('Exception', ['toString', 'getNextTrace']);

    // Exception class
    Napkin.Exception = Napkin.Class.extend(function(message, file, line, code, trace){
        this.trace = trace || null;
        this.name = this.name || 'Napkin Exception';
        this.code = code || 0;
        this.message = message;
        this.file = file || 'UK';
        this.line = line || 'UK';
    })
        .method('toString', function(){
            return this.name + '(file: ' + this.file + '; line: ' + this.line + '; code: ' + this.code + '): ' + this.message;
        })
        .method('getNextTrace', function(){
            return this.trace;
        });

    Napkin.Exception.getTraceString = function(exception){
        if (! exception) return '';
        Napkin.Interface.ensureImplements(Napkin.interfaces.Exception, exception);
        return exception + '\n' + this.getTraceString(exception.getNextTrace());
    };

    Napkin.Exception.getTraceObject = function(exception, i){
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
        this.name = 'Invalid Argument Exception';
        Napkin.exceptions.InvalidArgument.superclass.constructor.call(this, message, file, line, code, trace);
    });
    N.exceptions.InterfaceViolation = Napkin.Exception.extend(function(message, file, line, code, trace){
        this.name = 'Interface Violation Exception';
        Napkin.exceptions.InvalidArgument.superclass.constructor.call(this, message, file, line, code, trace);
    });

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

    N.Class = Class;
    N.Interface = Interface;
    N.interfaces = {};


})(Napkin);
