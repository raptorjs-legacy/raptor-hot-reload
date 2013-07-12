define(
    'raptor-hot-reload/AutoReloadTag',
    function(require) {
        var enabled = false;

        return {
            setEnabled: function(_enabled) {
                enabled = _enabled;
            },

            render: function(input, context) {
                if (enabled && input.enabled !== false) {
                    require('raptor/templating').render('raptor-hot-reload/AutoReload.rhtml', {}, context);
                }
            }
        };
    });