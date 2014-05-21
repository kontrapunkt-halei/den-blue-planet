define([
        // Libraries.
        'jquery',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel) {
        var View = Backbone.LayoutView.extend({
            template: 'ModalVideo',
            className: 'ModalVideoView',

            events: {},

            initialize: function(attrs) {},

            afterRender: function() {},
            prev_clickHandler: function() {},
            next_clickHandler: function() {},
            serialize: function() {
                return this.model;
            },
            cleanup: function() {}
        });
        return View;
    }
);