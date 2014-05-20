define([
        // Libraries.
        'jquery',
        'channel',
        'views/ButtonView',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel, ButtonView) {
        var View = Backbone.LayoutView.extend({
            initialize: function(attrs) {
                //
                console.log('--------Initted-----:: ' + this.model.title);
            },
            beforeRender: function() {
                if (this.model.buttons) {
                    for (var i = 0; i < this.model.buttons.length; i++) {
                        this.insertView(new ButtonView({
                            model: this.model.buttons[i]
                        })).render();
                    }
                }
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