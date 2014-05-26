define([
        // Libraries.
        'jquery',
        'channel',
        'views/ButtonView',
        'views/ClickAreaView',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel, ButtonView, ClickAreaView) {
        var View = Backbone.LayoutView.extend({
            initialize: function(attrs) {
                // console.log('--------Initted-----:: ' + this.model.title);
            },
            beforeRender: function() {
                if (this.model.buttons) {
                    for (var i = 0; i < this.model.buttons.length; i++) {
                        this.insertView(new ButtonView({
                            model: this.model.buttons[i]
                        }));
                    }
                }
                if (this.model.clickareas) {
                    for (var j = 0; j < this.model.clickareas.length; j++) {
                        this.insertView(new ClickAreaView({
                            model: this.model.clickareas[j]
                        }));
                    }
                }
            },
            afterRender: function() {
                $(this.el).find('img').load(function(event) {
                    $(event.target).addClass('show');
                }).each(function(event) {
                    if (this.complete) {
                        $(this).load();
                    }
                });
            },
            animateIn: function() {
                // console.log('animateIn');
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