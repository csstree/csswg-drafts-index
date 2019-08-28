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
                name: value.title,
                entity: value
            };
        }
    });

    data.defs.forEach(item => {
        item.source.spec = specIndex.get(item.source.spec);
        item.id = item.source.spec.id + '/' + item.defType + '/' + item.name;
    });
    
    const syntaxIndex = data.defs.reduce(
        (map, item) => map
            .set(item, item)
            .set(item.id, item),
        new Map()
    );
    discovery.addEntityResolver(value => {
        if (value) {
            value = syntaxIndex.get(value) || syntaxIndex.get(value.id);
        }

        if (value) {
            return {
                type: 'def',
                id: value.id,
                name: value.name,
                entity: value
            };
        }
    });
});
