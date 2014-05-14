define([
        // Libraries.
        'jquery',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, BackgroundSequenceView) {
        var View = Backbone.LayoutView.extend({
            template: 'Menu',

            MenuNodeView: Backbone.LayoutView.extend({
                template: 'MenuNode',
                events: {
                    'click': 'this_clickHandler'
                },
                initialize: function() {},
                afterRender: function() {},
                this_clickHandler: function(argument) {
                    console.log(this.model.url);
                    Backbone.history.navigate('/' + this.model.url, {
                        trigger: true
                    });
                },
                serialize: function() {
                    return {
                        slide: this.model
                    };
                }
            }),

            initialize: function(attrs) {
                this.slides = attrs.slides;
                console.log(attrs.slides);
                console.log('Menu: Init.');
            },
            afterRender: function() {
                console.log('Menu: Rendered.');
            },
            beforeRender: function() {
                this.slides.forEach(function(slide) {
                    console.log(this.slide);
                    this.insertView(".nodes", new this.MenuNodeView({
                        model: slide
                    })).render();
                }, this);
            },
            serialize: function() {
                return {};
            },
            cleanup: function() {}
        });
        return View;
    }
);