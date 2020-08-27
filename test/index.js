var test = require('tape');
var dom = require('../');
var document = require('dom-lightning').document;
var fastn = require('fastn');
var binding = require('fastn/binding');

global.document = global.document || document

function renderVirtualDomComponent(component){
    component.element = component.element || document.createElement(component.tagName);

    if('value' in component.element){
        component._lastStates = new Array(2);
    }
}

function renderVirtualDomTextComponent(component){
    component.element = document.createTextNode(component.data);
};

var virtualRenderers = {
    dom: renderVirtualDomComponent,
    domText: renderVirtualDomTextComponent
}

test('create div', function(t){
    t.plan(1);

    var div = dom('div');

    t.equal(div.tagName, 'div');
});

test('render div', function(t){
    t.plan(1);

    var div = dom('div');

    div.render();
    
    t.equal(div.element.outerHTML, '<div></div>');
});

test('render tree', function(t){
    t.plan(1);

    var div = dom('div', dom('span'));

    div.render();
    
    t.equal(div.element.outerHTML, '<div><span></span></div>');
});

test('render tree, insert unrendered component after render', function(t){
    t.plan(2);

    var div = dom('div');
    var span = dom('span');

    div.render();
    
    t.equal(div.element.outerHTML, '<div></div>');

    fastn.component.insertChild(div, span, 0);

    t.equal(div.element.outerHTML, '<div><span></span></div>');
});

test('render div with name', function(t){
    t.plan(1);

    var div = dom('div', { name: 'foo' });

    div.render();
    
    t.equal(div.element.outerHTML, '<div name="foo"></div>');
});

test('render div with class', function(t){
    t.plan(1);

    var div = dom('div', { class: 'foo bar' });

    div.render();
    
    t.equal(div.element.outerHTML, '<div class="foo bar"></div>');
});

test('render div udates class when changed', function(t){
    t.plan(2);

    var div = dom('div', { class: '' });

    div.render();
    
    t.equal(div.element.outerHTML, '<div></div>');

    div.class = 'bar'

    t.equal(div.element.outerHTML, '<div class="bar"></div>');
});

test('render div with bound name', function(t){
    t.plan(2);

    var div = dom('div', { class: binding('foo') });

    div.render();
    
    t.equal(div.element.outerHTML, '<div></div>');

    div.attach({
        foo: 'bar'
    });

    t.equal(div.element.outerHTML, '<div class="bar"></div>');
});

test('render div with bound name', function(t){
    t.plan(2);

    var myEmitter = new (require('events'))

    var div = dom('div', { class: myEmitter });

    div.render();
    
    t.equal(div.element.outerHTML, '<div></div>');

    myEmitter.emit('change', 'bar')

    t.equal(div.element.outerHTML, '<div class="bar"></div>');
});

test('render div with text child', function(t){
    t.plan(1);

    var div = dom('div', 'foo');

    div.render();
    
    t.equal(div.element.outerHTML, '<div>foo</div>');
});

test('render div with binding child', function(t){
    t.plan(2);

    var div = dom('div', binding('foo'));

    div.render();
    
    t.equal(div.element.outerHTML, '<div></div>');

    div.attach({
        foo: 'bar'
    });
    
    t.equal(div.element.outerHTML, '<div>bar</div>');
});

test('render tree with child components and text', function(t){
    t.plan(1);

    var div = dom('div', 
        dom('h1', 'Heading'),
        'text content'
    );

    div.render();
    
    t.equal(div.element.outerHTML, '<div><h1>Heading</h1>text content</div>');
});

test('render tree with child components and bound text', function(t){
    t.plan(2);

    var div = dom('div', 
        dom('h1', 'Heading: ', binding('title')),
        binding('content')
    );

    div.render();
    
    t.equal(div.element.outerHTML, '<div><h1>Heading: </h1></div>');

    div.attach({
        title: 'Title',
        content: 'Content'
    });
    
    t.equal(div.element.outerHTML, '<div><h1>Heading: Title</h1>Content</div>');
});

test('render tree with custom renderers', function(t){
    t.plan(2);

    var div = dom('div', 
        dom('h1', 'Heading: ', binding('title')),
        binding('content')
    );

    div.render(virtualRenderers);
    
    t.equal(div.element.outerHTML, '<div><h1>Heading: </h1></div>');

    div.attach({
        title: 'Title',
        content: 'Content'
    });
    
    t.equal(div.element.outerHTML, '<div><h1>Heading: Title</h1>Content</div>');
});

test('Adding dom events before render', function(t){
    t.plan(1);

    var button = dom('button')
        .on('click', (event, componentState, component) => {
            t.pass('Recieved click event');
        });

    button.render(virtualRenderers);

    button.element.click();
});

test('Adding dom events after render', function(t){
    t.plan(1);

    var button = dom('button');

    button.render(virtualRenderers)
        .on('click', (event, componentState, component) => {
            t.pass('Recieved click event');
        });

    button.element.click();
});

test('Removing dom events before render', function(t){
    t.plan(1);

    var listener = (event, componentState, component) => {
        t.pass('Recieved click event');
    }

    var button = dom('button')
        .on('click', listener);

    button.removeListener('click', listener);
    button.render(virtualRenderers);

    button.element.click();

    t.pass('No events for click')
});

test('Removing dom events after render', function(t){
    t.plan(1);

    var listener = (event, componentState, component) => {
        t.pass('Recieved click event');
    }

    var button = dom('button')
        .on('click', listener);

    button.render(virtualRenderers);

    button.element.click();

    button.removeListener('click', listener);

    button.element.click();
});

test('Inputs', function(t){
    t.plan(2);

    var input = dom('input', { value: 'foo' });

    input.render(virtualRenderers);

    t.equal(input.element.value, 'foo');

    input.value = 'bar';

    t.equal(input.element.value, 'bar');
});

test('Debounced input updates', function(t){
    t.plan(2);

    var input = dom('input', { value: 'foo' });

    input.render(virtualRenderers);

    t.equal(input.element.value, 'foo');

    input.value = 'bar';

    t.equal(input.element.value, 'bar');
});