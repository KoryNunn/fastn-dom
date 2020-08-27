var dom = require('../')
var binding = require('fastn/binding')
var mutate = require('fastn/mutate')

var state = {};
var otherState = {
    foo: 'bar'
};

var ui = dom('div',
    dom('h1', 'fastn-dom demo app'),
    dom('section',
        dom('p',
            'Name: ', dom('label', binding('name', binding('foo').attach(otherState), (a, b) => a + b))
        ),
        dom('input', {
            placeholder: 'Enter name',
            value: binding('name')
        })
        .on('input', (event, componentState, component) => {
            mutate.set(state, 'name', event.target.value)
        }),
        dom('button', 'X')
        .on('click', (event, componentState, component) => {
            mutate.remove(state, 'name')
        })
    )
)
.attach(state)
.render()

window.addEventListener('DOMContentLoaded', () => document.body.appendChild(ui.element))