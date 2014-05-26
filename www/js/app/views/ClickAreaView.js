define([
        // Libraries.
        'jquery',
        'channel',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel) {
        var View = Backbone.LayoutView.extend({
            template: 'ClickArea',
            className: 'clickarea',
            tagName: 'a',

            events: {
                'click': 'this_clickHandler'
            },

            initialize: function(attrs) {},
            this_clickHandler: function() {
                Channel.trigger('Modal.Open', {
                    link: this.model.link
                });
            },
            beforeRender: function(argument) {
                $(this.el).css({
                    left: this.model.x,
                    top: this.model.y,
                    width: this.model.width,
                    height: this.model.height
                });
            },
            afterRender: function() {},
            serialize: function() {
                return this.model;
            },
            cleanup: function() {}
        });
        return View;
    }
);