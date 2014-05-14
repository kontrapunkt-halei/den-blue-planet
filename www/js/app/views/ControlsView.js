define([
        // Libraries.
        'jquery',

        'channel',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel) {
        var View = Backbone.LayoutView.extend({
            template: 'Controls',
            className: 'ControlsView',

            initialize: function(attrs) {},
            afterRender: function() {
                Channel.on('Loader.SequenceProgress', this.setProgress, this);
                Channel.on('Loader.SequenceReady', this.hideProgress, this);
                Channel.on('Loader.LoadSequence', this.showProgress, this);
            },
            setProgress: function(attrs) {
                $(this.el).find('.procentage').text(Math.round(attrs.progress * 100));
            },
            hideProgress: function(argument) {},
            showProgress: function(argument) {},
            serialize: function() {},
            cleanup: function() {}
        });
        return View;
    }
);