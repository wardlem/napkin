var pyroFormStrategy = function(item)
{
    function renderForm(item)
    {
        var div = new Napkin.dom.Element('DIV', {'class': 'form_inputs'}), i, l;
        for (i = 0, l = item.children.length; i < l; i++){
            Napkin.Interface.ensureImplements(item.children[i], Napkin.interfaces.FormElement);
            div.append(item.children[i].render(pyroFormStrategy));
        }
        item.append(div);
        item.container.appendChild(item.element);
    }

    function renderFieldSet(item)
    {
        var ul = new Napkin.dom.Element('UL'), i, l;
        for(i = 0, l = item.children.length; i < l; i++){
            Napkin.Interface.ensureImplements(item.children[i], Napkin.interfaces.FormElement);
            var li = item.children[i].render(pyroFormStrategy);
            ul.append(li);
        }
        item.append(ul);
        return item;
    }

    function renderField(item)
    {
        var li = new Napkin.dom.Element('LI'),
            label = new Napkin.dom.Element('LABEL'),
            div = new Napkin.dom.Element('DIV', {'class': 'input'});
        label.for = item.id;
        label.innerText = item.label;
        li.append(label);
        div.append(item);
        li.append(div);
        return li;
    }

    switch (item.tag.toLowerCase()){
        case 'form':
            return renderForm(item);
            break;
        case 'fieldset':
            return renderFieldSet(item);
            break;
        default:
            return renderField(item);
            break;
    }
};