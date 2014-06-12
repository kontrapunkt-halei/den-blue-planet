define([
        // Libraries.
        'jquery',

        'channel',

        'views/BackgroundSequenceView',
        'views/BackgroundVideoView',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel, BackgroundSequenceView, BackgroundVideoView) {
        var View = Backbone.LayoutView.extend({
            template: 'Background',
            isiPad: navigator.userAgent.match(/iPad/i) != null,

            initialize: function(attrs) {
                // console.log('BG: Init.');

                this.SequenceView = new BackgroundSequenceView({});

                if (!this.isiPad) {
                    this.VideoView = new BackgroundVideoView({});
                }
            },
            beforeRender: function(argument) {
                // Background sequence
                // console.log('before render!!');

                this.insertView(".sequence", this.SequenceView);
                if (!this.isiPad) {
                    this.insertView(".video", this.VideoView);
                }
            },
            afterRender: function() {
                var self = this;
                // console.log('BG: Rendered.');

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