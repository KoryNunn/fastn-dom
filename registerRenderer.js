function registerRenderer(renderers, key, renderer){
    renderers = renderers || {};
    renderers[key] = renderers[key] || renderer;
    return renderers;
}

module.exports = registerRenderer;