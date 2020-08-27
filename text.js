var fastn = require('fastn');
var registerRenderer = require('./registerRenderer');
var insertIntoParent = require('./insertIntoParent');
var getComponentConfig = require('fastn/getComponentConfig');

function updateText(component, text){
    if(!component.element){
        return;
    }

    component.element.data = (text == null ? '' : text);
}

function renderTextComponent(component){
    component.element = document.createTextNode(component.text);
    updateText(component, component.text);
    component.on('text', value => updateText(component, value));
    component.on('insertElement', (parentComponent, index) => insertIntoParent(component, parentComponent, index))
    component.on('removeElement', (parentComponent, index) => component.element && component.element.remove())
}

function textComponent(settings){
    if(typeof settings === 'string' || typeof settings === 'number' || fastn.is.attachable(settings)){
        settings = { text: settings };
    }

    var component = fastn.component(settings);

    fastn.setProperty(component, 'text', {
        value: component.text || ''
    });
    

    component.render = function(renderers){
        if(component.element){
            return;
        }
        renderers = registerRenderer(renderers, 'text', renderTextComponent);
        renderers.text(component);
        component.emit('render', component, renderers);
    }

    return component;
}

module.exports = textComponent;