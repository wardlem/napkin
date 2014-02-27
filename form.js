var Napkin = Napkin || {};

(function(N, $){

    if (!N.Interface){
        return;
    }

    N.interfaces.FormElement = new N.Interface('Form Element', ['getValue', 'render']);

    var FormComposite = {
        addChild: function(child){
            Napkin.Interface.ensureImplements(child, Napkin.interfaces.FormElement);
            this.children.push(child);
            this.element.append(child.render());
        },
        getValue: function(){
            var i, l, values = {}, temp;
            for (i = 0, l = this.children.length; i < l; i++){
                temp = this.children[i].getValue();
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
    })
        .augment(FormComposite)
        .method('save', function(){
            var values = this.getValue();
            Napkin.async.post(this.action, values);
        })
        .method('render', function(){
            this.container.html(this.element);
        })
        .method('build', function(){
            var el = $('<form></form>'), i, l;
            el.attr('method', this.method);
            el.attr('action', this.action);
            if (this.id) el.attr('id', this.id);
            if (this.class) el.attr('class', this.class.join(' '));
            for (i = 0, l = this.children.length; i < l; i++){
                Napkin.Interface.ensureImplements(this.children[i], Napkin.interfaces.FormElement);
                el.append(this.children[i].render());
            }
            return el;
        });

    var FormElement = N.Class.extend(function(data){    // implements form element interface
        this.name = data.name || null;
        this.id = data.id || null;
        this.class = data.class ? ($.isArray(data.class) ? data.class : [data.class]) : null;
        this.label = data.label || '';
        this.element = this.build();
    })
        .method('render', function(){
            var el = $('<div></div>');
            el.append('<label for="'+ this.id +'">' + this.label +'</label>');
            var div = $('<div class="input"></div>');
            div.append(this.element);
            el.append(div);
            return el;
        })
        .method('build', function(){
            throw Error('FormElement.build() is an abstract method and must be overwritten.')
        });

    var FieldSet = FormElement.extend(function(data){
        this.children = data.children || [];
        FieldSet.superclass.constructor.call(this, data);
    })
        .augment(FormComposite)
        .method('build', function(){
            var el = $('<fieldset></fieldset>'), i, l;
            if (this.id) el.attr('id', this.id);
            if (this.class) el.attr('class', this.class.join(' '));
            var ul = $('<ul></ul>'), li;
            for(i = 0, l = this.children.length; i < l; i++){
                Napkin.Interface.ensureImplements(this.children[i], Napkin.interfaces.FormElement);
                li = $('<li></li>');
                li.append(this.children[i].render());
                ul.append(li);
            }
            el.append(ul);
            return el;
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
            var val = {};
            val[this.name] = this.element.val();
            return val;
        });

    var FormInput = FormField.extend(function(data){
        this.type = this.type || data.type || 'text';
        FormInput.superclass.constructor.call(this, data);
    })
        .method('build', function(){
            var el =$('<input type="' + this.type +'" name="' + this.name +'" />');
            if (this.id) el.attr('id', this.id);
            if (this.class) el.attr('class', this.class.join(' '));
            if (this.placeholder) el.attr('placeholder', this.placeholder);
            if (this.value) el.val(this.value);
            return el;
        });

    var FormButton = FormField.extend(function(data){
        this.onClick = data.onClick || null;
        this.type = data.type || 'button';
        FormButton.superclass.constructor.call(this, data);
    })
        .method('build', function(){
            var el = $('<button type="'+ this.type +'">' + this.label + '</button>');
            if (this.name) el.attr('name', this.name);
            if (this.id) el.attr('id', this.id);
            if (this.class) el.attr('class', this.class.join(' '));
            if (this.value) el.val(this.value);
            return el;
        })
        .method('render', function(){
            return this.element;
        })
        .method('getValue', function(){
            return {};
        });

    var FormSelect = FormField.extend(function(data){
        this.options = data.options || {};
        FormSelect.superclass.constructor.call(this, data);
    })
        .method('build', function(){
            var el = $('<select name="' + this.name + '"></select>'), i;
            if (this.placeholder) el.append('<option value="">' + this.placeholder + '</option>');
            for (i in this.options){
                var option = this.options[i];
                el.append('<option value="' + i +'"' + (i === this.value ? ' selected' : '') + '>' + option + '</option>')
            }
            return el;
        })
        .method('updateOptions', function(opts){
            console.log(opts);
            this.options = opts;
            this.element = this.build();
        });

    N.form = N.form || {};

    N.Form = Form;
    N.form.Element = FormElement;
    N.form.Input = FormInput;
    N.form.FieldSet = FieldSet;
    N.form.Field = FormField;
    N.form.Select = FormSelect;
    N.form.Button = FormButton;

})(Napkin, jQuery);