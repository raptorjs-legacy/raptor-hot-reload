define(
    'raptor-hot-reload/AutoReloadTag',
    function(require) {
        var enabled = undefined;

        return {
            render: function(input, context) {
                if (enabled === false) {
                    return;
                }

                if (enabled === undefined) {
                    // Only include socket.io if WebSockets and live 
                    // coding are actually enabled 
                    enabled = global.raptorClientAutoReloadEnabled  === true;
                }

                if (enabled && input.enabled !== false) {
                    require('raptor/templating').render('raptor-hot-reload/AutoReload.rhtml', {}, context);
                }
            }
        };
    });