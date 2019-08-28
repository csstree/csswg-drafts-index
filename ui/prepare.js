discovery.setPrepare(function(data) {
    data.forEach(item => item.id = item.file + '/' + item.type + '/' + item.name);
    
    console.log(data);
    const syntaxIndex = data.reduce(
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

    const specIndex = [...new Set(data.map(e => e.file))].reduce(
        (map, item) => map
            .set(item, {
                name: item,
                file: item
            }),
        new Map()
    );
    discovery.addEntityResolver(value => {
        if (value) {
            value = specIndex.get(value) || specIndex.get(value.id);
        }

        if (value) {
            return {
                type: 'spec',
                id: value.name,
                name: value.name,
                entity: value
            };
        }
    });
});
