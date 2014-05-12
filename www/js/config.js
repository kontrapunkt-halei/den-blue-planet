/**
 *
 * RequireJS file paths and shim config.
 *
 *
 * The build will inline common dependencies into this file.
 * File paths will be used for other module packages too, as defined in build.js.
 *
 *
 * More info            https://github.com/jrburke/r.js/blob/master/build/example.build.js
 *                      https://github.com/ryanfitzer/Example-RequireJS-jQuery-Project
 *                      https://github.com/tbranyen/backbone-boilerplate
 *                      https://github.com/requirejs/example-multipage-shim
 *
 * @author Aki Karkkainen - adapted from https://github.com/requirejs/example-multipage-shim
 * @url https://github.com/akikoo/grunt-frontend-workflow
 * Twitter: http://twitter.com/akikoo
 *
 */

require.config({

    paths: {

        // Core libraries.
        jquery: 'lib/jquery/jquery',
        jqueryEasing: 'lib/jquery/jquery.easing',
        underscore: 'lib/underscore/underscore',
        backbone: 'lib/backbone/backbone',
        'backbone.layoutmanager': 'lib/backbone.layoutmanager/backbone.layoutmanager',
        'layoutmanager': 'app/general/layoutmanager',
        preloadjs: 'lib/preloadjs/preloadjs-0.4.0.min',

        // Templating.
        handlebars: 'lib/handlebars/handlebars',

        // Plugins.
        text: 'lib/requirejs-text/text',

        // Custom AMD modules.
        // utils: 'app/utils',

        // App folders.
        collections: 'app/collections',
        models: 'app/models',
        routers: 'app/routers',
        templates: 'app/templates',
        views: 'app/views',

        channel: 'app/channel',
        loader: 'app/general/loader',

        reqAniFramePolyfill: 'lib/reqAniFramePolyfill/reqAniFramePolyfill'
    },

    // Dependencies for scripts that are not wrapped as AMD modules.
    shim: {
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        },
        handlebars: {
            exports: 'Handlebars'
        },
        preloadjs: {
            exports: 'createjs.LoadQueue'
        },
        jqueryEasing: ['jquery'],

        'backbone.layoutmanager': ['backbone']
    }
});