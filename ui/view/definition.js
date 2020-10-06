discovery.view.define('definition', function(el, config, data, context) {
    return discovery.view.render(el, [{
        view: 'header',
        content: [
            'spec-location:source or $',
            {
                view: 'badge',
                when: 'type',
                data: '{ text: type, color: "#d0dde4" }'
            }
        ]
    }].concat(config.content || []), data, context);
});
