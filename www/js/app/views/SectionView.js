define([
        // Libraries.
        'jquery',
        'channel',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel) {
        var View = Backbone.LayoutView.extend({
            initialize: function(attrs) {
                //
                console.log('--------Initted-----:: ' + this.model.title);
            },
            afterRender: function() {
                //
            },
            animateIn: function() {
                console.log('animateIn');
            },
            animateOut: function(newSection) {
                var self = this;
                $(this.el).fadeOut('slow', function() {
                    Channel.trigger('Section.AnimateOutComplete');
                    self.cleanup();
                });
            },
            serialize: function() {
                return this.model;
            },
            cleanup: function() {}
        });
        return View;
    }
);