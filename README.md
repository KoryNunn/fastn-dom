# fastn-dom

A fastn DOM component-renderer

## Usage

Install

```sh
npm i --save fastn-dom
```

Build UI's

```js
var dom = require('fastn-dom');

var ui = dom('div',
    dom('h1', 'fastn-dom demo app'),
    dom('section',
        dom('p',
            'Name: ', dom('label', binding('name'))
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
);

ui.render();

document.body.appendChild(ui.element);
```