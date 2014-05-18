define([
        // Libraries.
        'jquery',
        'channel',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel, BackgroundSequenceView) {
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
                    // Backbone.history.navigate('/' + this.model.url, {
                    //     trigger: true
                    // });
                    Channel.trigger('Section.GoToSection', {
                        index: this.model.index
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
                console.log('Menu: Init.');
            },
            afterRender: function() {
                console.log('Menu: Rendered.');
                Channel.on('Section.SectionSelected', this.sectionSelected_handler, this);
            },
            sectionSelected_handler: function(attrs) {
                console.log('SELECTED!');
                $(this.el).find('.node').removeClass('selected');
                $(this.el).find('.node:eq(' + (attrs.index) + ')').addClass('selected');
            },
            beforeRender: function() {
                this.slides.forEach(function(slide) {
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