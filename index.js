var hotReload = require('hot-reload');

var HotReloader = hotReload.HotReloader;
var proto = HotReloader.prototype;

proto.uninstallRaptor = function(uninstallRaptor) {
    this._uninstallRaptor = uninstallRaptor !== false;
    return this;
};

proto.clientAutoReload = function(sockets) {
    var _this = this;
    require('raptor-hot-reload/AutoReloadTag').setEnabled(true);

    sockets.on('connection', function (socket) {

        var emitModified = function(eventArgs) {
            socket.emit('modified', {path: eventArgs.path});
        };

        _this.afterReload(emitModified)
            .afterSpecialReload(emitModified);

        socket.on('disconnect', function () {
            _this.removeListener('afterReload', emitModified);
            _this.removeListener('afterSpecialReload', emitModified);
        });
    });

    return this;
};

exports.create = function(require) {
    if (typeof require !== "function") {
        throw new Error('"require" function is required');
    }

    var raptorDir  = require('raptor').sourceDir;

    var hotReloader = hotReload.create(require);
    hotReloader._uninstallRaptor = true;
    hotReloader.uncache(function(moduleName) {
        if (hotReloader._uninstallRaptor) {
            if (moduleName.endsWith('.raptor_module')) {
                return true;
            }
            else if (moduleName.startsWith(raptorDir)) {
                return true;
            }
        }
        return false;
    });

    // hotReloader.specialReload("\.(css|rhtml|less)$", function(path) {
    //     require('raptor/optimizer').getDefaultPageOptimizer().clearCache();
    // });

    hotReloader.specialReload("*.rhtml", function(path) {

        require('raptor/optimizer').getDefaultPageOptimizer().clearCache();
        console.log('[raptor-hot-reload] Cleared RaptorJS Optimizer cache');

        require('raptor/templating').unloadFile(path);
        console.log('[raptor-hot-reload] Unloaded template: ' + path);
    });

    hotReloader.beforeReload(function() {
        if (hotReloader._uninstallRaptor) {
            console.log('[raptor-hot-reload] Uninstalling RaptorJS...');

            var Module = require('module').Module;
            if (Module.uninstallRaptor) {
                Module.uninstallRaptor();
            }

            console.log('[raptor-hot-reload] RaptorJS Uninstalled');
        }
    });

    return hotReloader;
}