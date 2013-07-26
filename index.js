var hotReload = require('hot-reload');

var HotReloader = hotReload.HotReloader;
var proto = HotReloader.prototype;

proto.uninstallRaptor = function(uninstallRaptor) {
    this._uninstallRaptor = uninstallRaptor !== false;
    return this;
};

proto.clientAutoReload = function(sockets) {
    var _this = this;
    global.raptorClientAutoReloadEnabled = true;

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

var req = require;

exports.create = function(require) {
    if (typeof require !== "function") {
        throw new Error('"require" function is required');
    }

    var raptorDir  = require('raptor').sourceDir;

    var hotReloader = hotReload.create(require);
    hotReloader._uninstallRaptor = true;

    // Exclude the express module from being uncached
    // since it is used to start a long running server
    // that should not be restarted
    var express;

    try {
        express = require('express');
    }
    catch(e) {
    }

    if (express) {
        hotReloader.uncacheExclude('express');
    }
    

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

    hotReloader.specialReload("*.rtld", function(path, context) {
        var compiler = require('raptor/templating/compiler');
        var workDir = compiler.getWorkDir ? compiler.getWorkDir() : compiler.workDir;

        if (workDir) {
            // Delete the compiled templates that were saved to disk
            // because the taglibs control how a template is compiled
            req('wrench').rmdirSyncRecursive(workDir.toString(), true);
            console.log('[raptor-hot-reload] Deleted work directory: ' + workDir);    
        }

        // Continue with a full reload
        context.fullReload();
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