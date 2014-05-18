define([
        // Libraries.
        'jquery',

        'channel',

        'views/BackgroundSequenceView',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel, BackgroundSequenceView) {
        var View = Backbone.LayoutView.extend({
            template: 'Background',

            initialize: function(attrs) {
                console.log('BG: Init.');

                this.SequenceView = new BackgroundSequenceView({});
            },
            beforeRender: function(argument) {

                // Background sequence
                this.insertView(".sequence", this.SequenceView).render(function() {});
            },
            afterRender: function() {
                var self = this;
                console.log('BG: Rendered.');

                var $overlay = $(self.el).find('.overlay');

                Channel.on('Background.PlaybackComplete', function() {
                    $overlay.removeClass('hide');
                });
                Channel.on('Background.PlaySequence', function() {
                    $overlay.addClass('hide');
                });
            },
            serialize: function() {
                return {};
            },
            cleanup: function() {}
        });
        return View;
    }
);