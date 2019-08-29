discovery.setPrepare(function(data) {
    const specIndex = data.specs.reduce(
        (map, item) => map
            .set(item, item)
            .set(item.id, item),
        new Map()
    );
    discovery.addEntityResolver(value => {
        if (value) {
            value = specIndex.get(value) || specIndex.get(value.id);
        }

        if (value) {
            return {
                type: 'spec',
                id: value.id,
                name: value.props.title,
                entity: value
            };
        }
    });

    data.defs.forEach(item => {
        item.source.spec = specIndex.get(item.source.spec);
        item.id = item.source.spec.id + '/' + item.type + '/' + item.props.name;
    });
    
    const defIndex = data.defs.reduce(
        (map, item) => map
            .set(item, item)
            .set(item.id, item)
            .set(item.props, item),
        new Map()
    );
    discovery.addEntityResolver(value => {
        if (value) {
            value = defIndex.get(value) || defIndex.get(value.id);
        }

        if (value) {
            return {
                type: 'def',
                id: value.id,
                name: value.props.name,
                entity: value
            };
        }
    });
});
