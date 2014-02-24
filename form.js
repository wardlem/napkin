var Napkin = Napkin || {};

(function(N, $){

    if (!N.Class || !N.Interface || !N.Publisher || !N.Subscriber || !$){
        return;
    }

    var FormController = N.Class.extend(function(saveRoute, data){
        this.saveRoute = saveRoute;
        this.form = new FormView(data);
    });

    var FormView = N.Class.extend(function(data){

    });

    var FormElement = N.Class.extend(function(element){
        this.element = element || this.build();
    })
        .method('build',function(){
            throw new Error('FormElement.build is an abstract method and must be overwritten');
        })
        .method('display', function(){
            return this.element;
        });

    /* Base form field class */
    var FormField = FormElement.extend(function(data, element, type){
        if (typeof data !== 'object') data = {};
        this.name = data.name || '';
        this.class = (typeof data.class === 'string' ? data.class.split(" ")
            : (typeof data.class === 'array' ? data.class : null) );
        this.id = data.id || '';
        this.default = data.default || null;
        this.value = data.value || this.default;
        this.placeholder = data.default || null;
        this.element = element || data.element || this.build();
        this.type = type || data.type || null;
    })
        .method('getValue', function(){
            return this.value;
        })
        .method('update', function(value){
            throw new Error('FormField.update is an abstract method and must be overwritten.');
        })
        .method('getType', function(){
            return this.type;
        })
        .method('reset', function(){
            this.update(this.default);
        });

    /* Base form input class */
    var FormInput = FormField.extend(function(data, element, type){
        FormInput.superclass.constructor.call(this, data, element, type);
        this.type = this.type || 'text';
        this.changePublisher = null;
    })
        .method('build', function(){
            var el = "<input type='" + this.type + "'" +
                (this.value ? " value='" + this.value + "'" : "") +
                (this.name ? " name='" + this.name + "'" : "") +
                (this.class ? " class='" + this.class.join(" ") + "'" : "") +
                (this.id ? " id='" + this.id + "'" : "") +
            ">";

            return $(el);
        })
        .method('update', function(value){
            this.value = value;
            this.element.val(value);
        })
        .method('createChangeEvent', function(){
            if (!this.changePublisher) return;
            var self = this;
            this.element.on('change', function(){
                self.changePublisher.deliver(self.element.val());
            })
        })
        .method('getChangePublisher', function(){
            if (!this.changePublisher){
                this.changePublisher = new N.publisher;
                this.createChangeEvent();
            }
            return this.changePublisher;
        });

    N.form = {};
    N.form.Controller = FormController;
    N.form.View = FormView;
    N.form.Element = FormElement;
    N.form.Field = FormField;
    N.form.Input = FormInput;

})(Napkin, jQuery);