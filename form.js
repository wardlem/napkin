var Napkin = Napkin || {};

(function(N, $){

    if (!N.Interface){
        return;
    }

    N.interfaces.FormElement = new N.Interface('Form Element', ['getValue', 'save', 'render']);

    var FormComposite = {
        addChild: function(child){
            Napkin.Interface.ensureImplements(child, Napkin.interfaces.FormElement);
            this.children.push(child);
            this.element.appendChild(child.render());
        },
        getValue: function(){
            var i, l, values = {}, temp;
            for (i = 0, l = this.children.length; i < l; i++){
                temp = this.children[i].save();
                $.extend(values, temp);
            }
            return values;
        }
    };

    var Form = N.Class.extend(function(data){
        this.container = data.container;
        this.action = data.action || '';
        this.method = data.method || 'POST';
        this.children = data.children || [];
        this.id = data.id || '';
        this.class = data.class ? ($.isArray(data.class) ? data.class : [data.class]) : null;
        this.element = this.build();
        this.handleError = typeof data.handleError === 'function' ? data.handleError : function(data){
            alert(data);
        };
        var self = this;
        this.handleResponse = (typeof data.handleSuccess === 'function' ? function(msg){
            data.handleSuccess(msg, self);
        } : function(data){
            alert(data)
        }
            )
    })
        .augment(FormComposite)
        .method('save', function(){
            try {
                var values = this.getValue();
                Napkin.async.post(this.action, values, this.handleResponse);
            } catch (e) {
                if (e.name === 'ValidationFailure'){
                    this.handleError(e.message);
                }
            }
        })
        .method('render', function(){
            this.container.appendChild(this.element);
        })
        .method('build', function(){
            var el = document.createElement('form'), div = document.createElement('DIV'), i, l;
            div.className = 'form_inputs';
            el.setAttribute('method', this.method);
            el.setAttribute('action', this.action);
            if (this.id) el.id = this.id;
            if (this.class) el.className = this.class.join(' ');
            for (i = 0, l = this.children.length; i < l; i++){
                Napkin.Interface.ensureImplements(this.children[i], Napkin.interfaces.FormElement);
                div.appendChild(this.children[i].render());
            }
            el.appendChild(div);
            return el;
        })
        .method('reset', function(){
            this.element.reset();
        });

    var FormElement = N.Class.extend(function(data){    // implements form element interface
        this.validation = data.validation || null;
        this.required = data.required || false;
        this.name = data.name || null;
        this.id = data.id || null;
        this.class = data.class ? ($.isArray(data.class) ? data.class : [data.class]) : null;
        this.label = data.label || '';
        this.element = this.build();
    })
        .method('render', function(){
            var el = document.createElement('LI');
            var label = document.createElement('LABEL');
            label.for = this.id;
            label.innerText = this.label;
            el.appendChild(label);
            var div = document.createElement('DIV');
            div.className='input';
            div.appendChild(this.element);
            el.appendChild(div);
            return el;
        })
        .method('build', function(){
            throw Error('FormElement.build() is an abstract method and must be overwritten.')
        })
        .method('save', function(){
            var value = this.getValue(), message;
            if (!value && this.required){
                throw {
                    name: 'ValidationFailure',
                    message: (this.label || this.name) + ' is a required field.'
                }
            }
            if (this.validation && typeof this.validation === 'function'){
                if ((message = this.validation(value)) != false){
                    throw {
                        name: 'ValidationFailure',
                        message: message
                    }
                }
            }
            var val = {};
            val[this.name] = value;
            return val;
        });

    var FieldSet = FormElement.extend(function(data){
        this.children = data.children || [];
        FieldSet.superclass.constructor.call(this, data);
    })
        .augment(FormComposite)
        .method('build', function(){
            var el = document.createElement('FIELDSET'),
                ul = document.createElement('UL'),
                i, l, li;
            if (this.id) el.id = this.id;
            if (this.class) el.className = this.class.join(' ');
            for(i = 0, l = this.children.length; i < l; i++){
                Napkin.Interface.ensureImplements(this.children[i], Napkin.interfaces.FormElement);
                ul.appendChild(this.children[i].render());
            }
            el.appendChild(ul);
            return el;
        })
        .method('render', function(){
            return this.element;
        })
        .method('save', function(){
            return this.getValue();
        });

    var FormField = FormElement.extend(function(data){
        this.placeholder = data.placeholder || null;
        this.default = data.default || null;
        this.value = data.value || this.default || null;
        if (!data || !data.name){
            throw Error('A form field can not be created without a name.');
        }
        FormField.superclass.constructor.call(this, data);

    })
        .method('getValue', function(){
            return this.element.value;
        });

    var FormInput = FormField.extend(function(data){
        this.type = this.type || data.type || 'text';
        FormInput.superclass.constructor.call(this, data);
    })
        .method('build', function(){
            var el = document.createElement('INPUT');
            el.type = this.type;
            el.name = this.name;
            if (this.id) el.id = this.id;
            if (this.class) el.className = this.class.join(' ');
            if (this.placeholder) el.setAttribute('placeholder', this.placeholder);
            if (this.value) el.value = this.value;
            return el;
        });

    var FormHidden = FormInput.extend(function(data){
        this.type = 'hidden';
        FormHidden.superclass.constructor.call(this, data);
    });

    var FormButton = FormField.extend(function(data){
        this.onClick = data.onClick || null;
        this.type = data.type || 'button';
        FormButton.superclass.constructor.call(this, data);
    })
        .method('build', function(){
            var el = document.createElement('BUTTON');
            el.type = this.type;
            el.innerText = this.label;
            if (this.name) el.name = this.name;
            if (this.id) el.id = this.id;
            if (this.class) el.className = this.class.join(' ');
            if (this.value) el.value = this.value;
            return el;
        })
        .method('render', function(){
            return this.element;
        })
        .method('getValue', function(){
            return {};
        })
        .method('save', function(){
            return this.getValue();
        });

    var FormSelect = FormField.extend(function(data){
        this.options = data.options || {};
        FormSelect.superclass.constructor.call(this, data);
    })
        .method('build', function(){
            var el = document.createElement('SELECT'), i;
            el.name = this.name;
            if (this.placeholder){
                el.innerHTML = '<option value="">' + this.placeholder + '</option>';
            }

            for (i in this.options){

                var option = this.options[i];
                var opt = document.createElement('OPTION');
                if (i === this.value) opt.selected = true;
                opt.innerText = option;
                opt.value = i;
                el.appendChild(opt);
            }

            return el;
        })
        .method('getValue', function(){
            return this.element.options[this.element.selectedIndex].value;
        });

    N.form = N.form || {};

    N.Form = Form;
    N.form.Element = FormElement;
    N.form.Input = FormInput;
    N.form.FieldSet = FieldSet;
    N.form.Field = FormField;
    N.form.Select = FormSelect;
    N.form.Button = FormButton;
    N.form.Hidden = FormHidden;

})(Napkin, jQuery);