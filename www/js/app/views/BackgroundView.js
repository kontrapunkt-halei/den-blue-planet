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
            afterRender: function() {
                console.log('BG: Rendered.');
                var self = this;
                var $overlay = $(self.el).find('.overlay');

                // Background sequence
                this.insertView(".sequence", this.SequenceView).render(function() {});

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