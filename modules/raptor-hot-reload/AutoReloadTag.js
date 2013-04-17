define(
    'raptor-hot-reload/AutoReloadTag',
    function(require) {
        
        return {
            render: function(input, context) {
                if (input.enabled !== false) {
                    require('raptor/templating').render('raptor-hot-reload/AutoReload.rhtml', {}, context);
                }
            }
        };
    });