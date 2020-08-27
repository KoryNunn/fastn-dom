var getComponentConfig = require('fastn/getComponentConfig');
var fastn = require('fastn');

function endElementIndex(component, end){
    if(!Array.isArray(component.element)){
        return 0;
    }

    var children = fastn.component.getChildren(component);
    var endChild = children[end > 0 ? 0 : children.length - 1];

    if(!endChild || !endChild.element){
        return -1;
    }

    if(Array.isArray(endChild.element)){
        return endElementIndex(endChild, end);
    }

    return Array.prototype.indexOf.call(component.containerElement.childNodes, endChild.element);
}

function getPreviousLogicalSibling(component, containerElement){
    var parent = fastn.component.getParent(component);

    if(!parent){
        return;
    }

    var siblings = fastn.component.getChildren(parent);
    var relativeIndex = siblings.indexOf(component);

    if(relativeIndex != 0){
        return siblings[relativeIndex - 1];
    }

    if((parent.containerElement || parent.element) !== containerElement){
        return parent;
    }

    return getPreviousLogicalSibling(parent);
}

function getAbsoluteIndex(component){
    var parent = fastn.component.getParent(component);
    var previousSibling = getPreviousLogicalSibling(component, parent.containerElement);

    if(previousSibling === parent){
        return 0;
    }

    return endElementIndex(previousSibling, -1) + 1;
}

module.exports = function insertIntoParent(component, parentComponent, index){
    if(!parentComponent){
        return;
    }

    var containerElement = parentComponent.containerElement || parentComponent.element;

    if(!containerElement){
        return;
    }
    
    if(!component.element){
        var componentConfig = getComponentConfig(component);
        component.render(componentConfig.renderers);
    }

    if(Array.isArray(containerElement)){
        return;
    }

    var absoluteIndex = Array.isArray(parentComponent.element) ? getAbsoluteIndex(component) : index;

    if(containerElement.childNodes[absoluteIndex] === component.element){
        return;
    }

    containerElement.insertBefore(component.element, containerElement.childNodes[absoluteIndex]);
}
