define([
        // Libraries.
        'jquery',

        'channel',

        'views/ControlsLoaderView',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel, ControlsLoaderView) {
        var View = Backbone.LayoutView.extend({
            template: 'Controls',
            className: 'ControlsView first-section',

            events: {
                'click .prev': 'prev_clickHandler',
                'click .next': 'next_clickHandler'
            },

            initialize: function(attrs) {},

            afterRender: function() {
                this.controlsLoaderView = ControlsLoaderView;
                this.controlsLoaderView.initialize({
                    el: this.el
                });

                Channel.on('Background.PlaySequence', function() {
                    $(this.el).addClass('animating');
                    $('.btn-download-pdf').addClass('animating');
                }, this);
                Channel.on('Background.PlaybackComplete', function() {
                    $(this.el).removeClass('animating');
                    $('.btn-download-pdf').removeClass('animating');
                }, this);
            },
            prev_clickHandler: function() {
                Channel.trigger('Router.PrevSection');
            },
            next_clickHandler: function() {
                Channel.trigger('Router.NextSection');
            },
            serialize: function() {},
            cleanup: function() {}
        });
        return View;
    }
);