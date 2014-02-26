var Napkin = Napkin || {};

(function(N, $){

    if (!N.Class || !N.Interface || !N.Publisher || !N.Subscriber || !$){
        return;
    }

    var FormController = N.Class.extend(function(saveRoute, data, container){
        this.saveRoute = saveRoute;
        this.container = container;
        this.form = new FormView(data);
    })
        .method('render', function(){
            this.container.append(this.form.display());
        });

    var FormView = N.Class.extend(function(data){
        this.children = this.create(data);
        this.action = data.action || "#";
        this.method = data.method || "POST";
        this.id = data.id || "the_form";
        this.class = (typeof data.class === 'string' ? data.class.split(" ")
            : (typeof data.class === 'array' ? data.class : null) );
        this.element = this.build();

    }).method('save', function(){
        var data = {}, i;
        for (i in this.children){
            data = $.extend(this.children[i].save(), data);
        }
        return data;
    }).method('build', function(data){
        var element = "<form action='" + this.action + "' method='" + this.method +"'" +
            (this.class ? " class='" + this.class.join(" ") + "'" : "") +
            (this.id ? " id='" + this.id + "'" : "") +
            ">";
        element += "</form>";
        element = $(element);
        var i;
        for (i in this.children){
            element.append(this.children[i].display());
        }
        return element;
    }).method("create", function(data){
        var children = {}, i;
        for (i in data.data){
            children[i] = new N.form.Group(data.data[i])
        }
        return children;
    }).method('display', function(){
        return this.element;
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

    var FormGroup = FormElement.extend(function(data, element){
        this.children = this.create(data);
        this.element = this.build();
    })
        .method('build', function(){
            var element = $("<fieldset></fieldset>");
            for (var i in this.children){
                element.append(this.children[i].display());
            }
            return element;
        }).method('create', function(data){
            var children = {}, i;
            {
                for (i in data.data){
                    switch (data.data[i].type){
                        case 'select':
                            children[i] = new Napkin.form.Select(data.data[i]);
                            break;
                        case 'date':
                            children[i] = new Napkin.form.Date(data.data[i]);
                            break;
                        default:
                            children[i] = new Napkin.form.Input(data.data[i], null, data.data[i].type);
                    }
                }
            }
            return children;
        })
        .method('display', function(){
            return this.element;
        });

    /* Base form field class */
    var FormField = FormElement.extend(function(data, element, type){
        console.log('constructing');
        if (typeof data !== 'object') data = {};
        this.name = data.name || '';
        this.class = (typeof data.class === 'string' ? data.class.split(" ")
            : (typeof data.class === 'array' ? data.class : null) );
        this.id = data.id || '';
        this.default = data.default || null;
        this.value = data.value || this.default;
        this.placeholder = data.default || null;
        this.element = element || this.build();
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
        this.type = type || 'text';
        FormInput.superclass.constructor.call(this, data, element, this.type);
        this.changePublisher = null;
    })
        .method('build', function(){
            var el = "<input type='" + this.type + "'" +
                (this.value ? " value='" + this.value + "'" : "") +
                (this.name ? " name='" + this.name + "'" : "") +
                (this.class ? " class='" + this.class.join(" ") + "'" : "") +
                (this.id ? " id='" + this.id + "'" : "") +
                (this.placeholder ? " placeholder='" + this.placeholder + "'" : "") +
            ">";

            console.log(el);

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
                this.changePublisher = new Napkin.event.Publisher;
                this.createChangeEvent();
            }
            return this.changePublisher;
        });

    var FormDate = FormInput.extend(function(data, element){
        Napkin.form.Input.prototype.constructor.call(this, data, element, 'date');
    });

    var FormSelect = FormField.extend(function(data, element){
        FormSelect.superclass.constructor.call(this, data, element, 'select');
        this.options = data.options || {};
        this.element = this.build();
    })
        .method('build', function(){
            var element = "<select" +
                (this.value ? " value='" + this.value + "'" : "") +
                (this.name ? " name='" + this.name + "'" : "") +
                (this.class ? " class='" + this.class.join(" ") + "'" : "") +
                (this.id ? " id='" + this.id + "'" : "") +
                (this.placeholder ? " placeholder='" + this.placeholder + "'" : "") +
                ">";
            for (var i in this.options){
                element += "<option" +
                    (i === this.value ? " selected" : "") +
                    ">" + this.options[i] + "</option>";
            }
            element += "</select>";
            element = $(element);
            return element;
        });


    N.form = {};
    N.form.Controller = FormController;
    N.form.View = FormView;
    N.form.Element = FormElement;
    N.form.Field = FormField;
    N.form.Input = FormInput;
    N.form.Group = FormGroup;
    N.form.Date = FormDate;
    N.form.Select = FormSelect;

})(Napkin, jQuery);