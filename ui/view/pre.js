discovery.view.define('pre', function(el, config, data, context) {
    const { content } = config;

    if (content) {
        this.render(el, content, data, context);
    } else {
        el.textContent = data;
    }
}, { tag: 'span' });
