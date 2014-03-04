var Napkin = Napkin || {};

(function(N){

    if (!N.Interface){
        return;
    }

    N.interfaces.FormElement = new N.Interface('Form Element', ['getValue', 'save', 'render', 'reset']);

    var FormComposite = {

        addChild: function(child){
            Napkin.Interface.ensureImplements(child, Napkin.interfaces.FormElement);
            this.children.push(child);
            this.append(child);
        },

        getValue: function(){
            var i, l, values = {}, temp;
            for (i = 0, l = this.children.length; i < l; i++){
                temp = this.children[i].save();
                N.augment(values, temp);
            }
            return values;
        },

        reset: function(){
            var i, l;
            for (i = 0, l = this.children.length; i < l; i++){
                this.children[i].reset();
            }
        }
    };

    var Form = N.dom.Element.extend(function(data){
        data.method = data.method || 'POST';
        data.children = data.children || [];
        data.handleError = typeof data.handleError === 'function' ? data.handleError : function(data){
            alert(data);
        };
        var self = this;
        data.handleSuccess =
            typeof data.handleResponse === 'function'
                ? function(msg){
                data.handleResponse(msg, self);
            } : function(data){
                alert(data);
            };

        Form.superclass.constructor.call(this, 'FORM', data);
    })
        .augment(FormComposite)
        .method('save', function(){
            try {
                var values = this.getValue();
                Napkin.async.post(this.action, values, this.handleSuccess);
            } catch (e) {
                if (e instanceof Napkin.exceptions.ValidationException){
                    this.handleError(e.message);
                } else {
                    throw e;
                }
            }
        })
        .method('build', function(){
            var el = Form.superclass.build.call(this);
            el.setAttribute('method', this.method);
            el.setAttribute('action', this.action);
            return el;
        });

    var FormElement = N.dom.Element.extend(function(tag, data){
        FormElement.superclass.constructor.call(this, tag, data);
        this.label = this.label || '';
    })
        .method('save', function(){
            var value = this.getValue(), message;
            if (!value && this.required){
                throw new Napkin.exceptions.ValidationException((this.label || this.name) + ' is a required field.');
            }
            if (this.validation && typeof this.validation === 'function'){
                if ((message = this.validation(value)) != false){
                    throw new Napkin.exceptions.ValidationException(message);
                }
            }
            var val = {};
            val[this.formName] = value;
            return val;
        });

    var FieldSet = FormElement.extend(function(data){
        FieldSet.superclass.constructor.call(this, 'FIELDSET', data);
        this.children = this.children || [];
    })
        .augment(FormComposite)
        .method('save', function(){
            return this.getValue();
        });

    var FormField = FormElement.extend(function(tag, data){
        data = data || {};
        data.default = data.default || '';
        data.value = data.value || this.default;
        data.formName = data.formName || data.name;
        if (!data.formName){
            throw new Napkin.exceptions.InvalidArgument('A form field can not be created without a name.');
        }
        FormField.superclass.constructor.call(this, tag, data);
    })
        .method('getValue', function(){
            return this.element.value;
        })
        .method('reset', function(){
            this.element.value = this.default || '';
        })
        .method('build', function(){
            var el = FormField.superclass.build.call(this);
            if (this.required === true) el.required = true;
            return el;
        })
        .method('val', function(value){
            if (value){
                this.value = value;
                this.element.value = value;
                return this;
            }
            return this.element.value;
        })
        .publishers('change', 'input')
        .eventInitializer('change', function(obj){
            obj.element.addEventListener('change', function(e){
                obj.deliver('change', new Napkin.event.Change(obj, e, obj.getValue()));
            });
        })
        .eventInitializer('input', function(obj){
            obj.element.addEventListener('input', function(e){
                obj.deliver('input', new Napkin.event.Input(obj, e, obj.getValue()));
            });
        });

    var FormInput = FormField.extend(function(data){
        data = data || {};
        data.type = data.type || 'text';
        FormInput.superclass.constructor.call(this, 'INPUT', data);
    })
        .method('build', function(){
            var el = FormInput.superclass.build.call(this);
            el.type = this.type;
            el.name = this.formName;
            if (this.placeholder) el.setAttribute('placeholder', this.placeholder);
            if (this.value) el.value = this.value;
            return el;
        });


    var FormHidden = FormInput.extend(function(data){
        data = data || {};
        data.type = 'hidden';
        FormHidden.superclass.constructor.call(this, data);
    });

    var FormButton = FormElement.extend(function(data){
        data = data || {};
        data.type = data.type || 'button';
        FormButton.superclass.constructor.call(this, 'BUTTON', data);
    })
        .method('build', function(){
            var el = FormButton.superclass.build.call(this);
            el.type = this.type;
            el.innerText = this.label;
            if (this.name) el.name = this.name;
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
        })
        .method('reset', function(){})
        .publishers('click')
        .eventInitializer('click', function(obj){
            obj.element.addEventListener('click', function(e){
                e.preventDefault();
                obj.deliver('click', new Napkin.event.Click(obj, e, obj.getValue()));
            });
        });

    var FormSelect = FormField.extend(function(data){
        data = data || {};
        data.options = data.options || {};
        FormSelect.superclass.constructor.call(this, 'SELECT', data);
    })
        .method('build', function(){
            var el = FormSelect.superclass.build.call(this), i;
            el.name = this.name;
            if (this.placeholder) el.innerHTML = '<option value="">' + this.placeholder + '</option>';

            for (i in this.options){
                var option = this.options[i];
                var opt = new Napkin.dom.Element('OPTION');
                if (i === this.value) opt.element.selected = true;
                opt.text(option);
                opt.element.value = i;
                el.appendChild(opt.render());
            }
            return el;
        })
        .method('getValue', function(){
            return this.val();
        })
        .method('getSelectedOption', function(){
            return this.element.options[this.element.selectedIndex]
        });


    N.form = N.form || {};
    N.exceptions.ValidationException = Napkin.Exception.extend(function(message, file, line, code, trace){
        this.name = 'Validation Exception';
        Napkin.exceptions.InvalidArgument.superclass.constructor.call(this, message, file, line, code, trace);
    });

    N.Form = Form;
    N.form.Element = FormElement;
    N.form.Input = FormInput;
    N.form.FieldSet = FieldSet;
    N.form.Field = FormField;
    N.form.Select = FormSelect;
    N.form.Button = FormButton;
    N.form.Hidden = FormHidden;

})(Napkin);