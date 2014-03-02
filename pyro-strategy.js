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
    }

    function renderFieldSet(item)
    {
        var ul = new Napkin.dom.Element('UL'), i, l;
        for(i = 0, l = item.children.length; i < l; i++){
            Napkin.Interface.ensureImplements(item.children[i], Napkin.interfaces.FormElement);
            ul.append(item.children[i].render(pyroFormStrategy()));
        }
        item.element.append(ul);
    }

    function renderField(item)
    {
        var li = new Napkin.dom.Element('LI'),
            label = new Napkin.dom.Element('LABEL'),
            div = new Napkin.dom.Element('DIV', {'class': 'input'});
        label.for = item.id;
        label.innerText = item.label;
        li.append(label);
        div.append(item.element);
        li.append(div);
        return li;
    }

    switch (item.tag.toLowerCase()){
        case 'form':
            renderForm(item);
            break;
        case 'fieldset':
            renderFieldSet(item);
            break;
        default:
            renderField(item);
            break;
    }
};