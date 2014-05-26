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

            afterRender: function() {
                var self = this;
                setTimeout(function() {
                    if (self.el) {
                        $(self.el).addClass('showVideo');
                    }
                }, 900);
            },
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