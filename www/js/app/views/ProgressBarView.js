define([
        // Libraries.
        'jquery',

        'channel',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel) {
        var View = Backbone.LayoutView.extend({
            template: 'ProgressBar',

            initialize: function(attrs) {},
            afterRender: function() {
                Channel.on('Loader.SequenceProgress', this.setProgress, this);
                Channel.on('Loader.SequenceReady', this.hideProgress, this);
                Channel.on('Loader.LoadSequence', this.showProgress, this);
            },
            setProgress: function(attrs) {
                // console.log(attrs.progress);
                if (attrs.autoplay) {
                    $(this.el).find('.progress-bar').css('width', Math.round(attrs.progress * 100) + '%');
                }
            },
            hideProgress: function(attrs) {
                if (attrs.autoplay) {
                    $(this.el).find('.progress-bar').removeClass('loading');
                }
            },
            showProgress: function(attrs) {
                if (attrs.autoplay) {
                    $(this.el).find('.progress-bar').css('width', '0%');
                    $(this.el).find('.progress-bar').addClass('loading');
                }
            },
            serialize: function() {},
            cleanup: function() {}
        });
        return View;
    }
);