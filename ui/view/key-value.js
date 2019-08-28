/* eslint-env browser */
/* global discovery */

discovery.view.define('key-value-item', function(el, config, data, context) {
    const { key = 'text:key', value = 'struct:value' } = config;
    const keyEl = el.appendChild(document.createElement('span'));
    const valueEl = el.appendChild(document.createElement('span'));

    keyEl.className = 'view-key-value-item-key';
    this.render(keyEl, key, data, context);

    valueEl.className = 'view-key-value-item-value';
    this.render(valueEl, value, data, context);
});

discovery.view.define('key-value', function(el, config, data, context) {
    const { itemConfig, key, value } = config;
    let entries = null;
    
    if (Array.isArray(data)) {
        entries = data;
    } else {
        entries = [];
        for (let key in data) {
            if (hasOwnProperty.call(data, key)) {
                entries.push({ key, value: data[key] });
            }
        }
    }

    this.renderList(el, this.composeConfig({
        view: 'key-value-item',
        key,
        value
    }, itemConfig), entries, context);
});
