var Napkin = Napkin || {};

(function(N){

    if (!N.Class) return;

    var Element = N.Class.extend(function(tag, data){
        this.tag = tag;
        if (!this.tag || typeof this.tag !== 'string'){
            console.log(tag);
            throw new Napkin.exceptions.InvalidArgument('A new element can not be created without a tag name');
        }
        if (typeof data === 'object'){
            if (data.class && typeof data.class === 'string'){
                data.class = data.class.split(' ');
            }
            for (var i in data){
                if (data.hasOwnProperty(i)){
                    this[i] = data[i];
                }
            }
        }
        this.element = this.build();
    })
        .method('build', function(){
            var el = document.createElement(this.tag);
            if (this.id) el.id = this.id;
            if (this.class) el.className = this.class.join(" ");
            return el;
        })
        .method('render', function(strategy){
            if (strategy && typeof strategy === 'function'){
                return strategy(this);
            }
            return this.element;
        })
        .method('append', function(child){
            try{
                if (child instanceof Napkin.dom.Element){
                    this.element.appendChild(child.render());
                } else {
                    this.element.appendChild(child);
                }
            } catch (e) {
                throw new Napkin.Exception('Dom failure: ' + child);
            }
        })
        .method('text', function(value){
            if (value){
                this.element.innerText = value;
                return this;
            }
            return this.element.innerText;
        })
        .method('html', function(html){
            if (html){
                this.element.innerHTML = html;
            }
        })
        .method('attr', function(attribute, value){
            if (value === false){
                this.element.removeAttribute(attribute);
            } else if (value){
                if (Napkin.isArray(value)){
                    value = value.join(' ');
                }
                this.element.setAttribute(attribute, value);
            } else {
                if (this.element.hasAttribute(attribute)){
                    value = this.element.getAttribute(attribute);
                }
            }
            return value || null;
        })
        .method('addClass', function(add){
            var classes = this.element.className;
            this.element.className = classes ? classes + " " + add : add;
            this.class.push(add);
            return this;
        })
        .method('removeClass', function(remove){
            var classes = this.element.className.split(' '), i;
            if ((i = classes.indexOf(remove)) !== -1){
                classes.splice(i, 1);
                this.element.className = classes.join(' ');
                this.class = classes;
            }
            return this;
        });

    Napkin.dom = Napkin.dom || {};
    Napkin.dom.Element = Element;

})(Napkin);