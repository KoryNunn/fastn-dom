var fastn = require('fastn');
var getComponentConfig = require('fastn/getComponentConfig');
var fancyProps = require('fancy-props');
var textComponent = require('./text');
var registerRenderer = require('./registerRenderer');
var insertIntoParent = require('./insertIntoParent');

function renderDomComponent(component){
    component.element = component.element || document.createElement(component.tagName);
    component.on('insertElement', (parentComponent, index) => insertIntoParent(component, parentComponent, index));
    component.on('removeElement', (parentComponent, index) => component.element && component.element.remove());
    component.on('newListener', (eventName, handler) => addEventListener(component, eventName, handler));
    component.on('removeListener', (eventName, handler) => removeEventListener(component, eventName, handler));

    Object.keys(component._events).forEach(eventName => {
        var handlers = [component._events[eventName]].flat()
        handlers.forEach(handler => addEventListener(component, eventName, handler));
    });

    var componentConfig = getComponentConfig(component);
    var componentPropertiesConfig = componentConfig.properties;

    Object.keys(componentConfig.properties).forEach(key => {
        updateProperty(component, key, component[key]);
        component.on(key, value => updateProperty(component, key, value));
    });
}

function updateProperty(component, key, value){
    var element = component.element;

    var isProperty = key in element || !('getAttribute' in element),
        fancyProp = component._fancyProps && component._fancyProps(key) || fancyProps[key],
        previous = fancyProp ? fancyProp(element) : isProperty ? element[key] : element.getAttribute(key);

    if(!fancyProp && !isProperty && value == null){
        value = '';
    }

    if(value !== previous){
        if(fancyProp){
            fancyProp(element, value);
            return;
        }

        if(isProperty){
            element[key] = value;
            return;
        }

        if(typeof value !== 'function' && typeof value !== 'object'){
            element.setAttribute(key, value);
        }
    }
}

function addEventListener(component, eventName, handler){
    var componentConfig = getComponentConfig(component);
    componentConfig.eventHandlerMap = componentConfig.eventHandlerMap || new WeakMap();

    if(component.element && `on${eventName}` in component.element && !componentConfig.eventHandlerMap.has(handler)){
        function domHandler(event){
            handler(event, componentConfig.state, component);
        }

        componentConfig.eventHandlerMap.set(handler, domHandler);
        component.element.addEventListener(eventName, domHandler);
    }
}

function removeEventListener(component, eventName, handler){
    var componentConfig = getComponentConfig(component);
    componentConfig.eventHandlerMap = componentConfig.eventHandlerMap || new WeakMap();

    if(component.element && `on${eventName}` in component.element){
        var domHandler = componentConfig.eventHandlerMap.get(handler);
        if(domHandler){
            component.element.removeEventListener(eventName, domHandler);
            componentConfig.eventHandlerMap.delete(handler);
        }
    }
}

function domComponent(tag, settings, ...children){
    if(typeof settings === 'string' || typeof settings === 'number' || fastn.is.attachable(settings)){
        children.unshift(settings);
        settings = {};
    }

    children = children.reduce((initialisedChildren, child) => {
        if(child == null || child === false){
            return initialisedChildren;
        }
        
        if(fastn.is.component(child)){
            initialisedChildren.push(child);
        } else {
            initialisedChildren.push(textComponent({
                text: child
            }));
        }

        return initialisedChildren;
    }, []);

    var component = fastn.is.component(tag) ? tag : fastn.component(settings, children);

    fastn.setProperty(component, 'tagName', {
        value: tag || component.tagName
    });

    component.render = function(renderers){
        if(component.element){
            return;
        }
        var componentConfig = getComponentConfig(component);
        renderers = registerRenderer(renderers, 'dom', renderDomComponent);
        renderers.dom(component);
        componentConfig.renderers = renderers;

        component.emit('render', component, renderers);

        fastn.component.getChildren(component).forEach((child, childIndex) => {
            child.render(renderers);
            child.emit('insertElement', component, childIndex);
        });

        return component;
    }

    return component;
}

module.exports = domComponent;