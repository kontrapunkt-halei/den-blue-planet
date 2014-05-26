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
            className: 'menu-inner',

            MenuNodeView: Backbone.LayoutView.extend({
                template: 'MenuNode',
                events: {
                    'click': 'this_clickHandler'
                },
                initialize: function() {},
                afterRender: function() {},
                this_clickHandler: function(argument) {
                    var self = this;

                    // console.log(this.model.url);

                    if ($('body').hasClass('menuOpen')) {
                        $('body').removeClass('menuOpen');
                        setTimeout(function() {
                            Channel.trigger('Section.GoToSection', {
                                index: self.model.index
                            });
                        }, 700);
                    } else {
                        Channel.trigger('Section.GoToSection', {
                            index: this.model.index
                        });
                    }
                },
                serialize: function() {
                    return {
                        slide: this.model
                    };
                }
            }),

            initialize: function(attrs) {
                this.slides = attrs.slides;
                // console.log('Menu: Init.');
            },
            afterRender: function() {
                var self = this;

                Channel.on('Section.SectionSelected', this.sectionSelected_handler, this);

                Channel.on('window.resize', this.window_resizeHandler, this);
                this.window_resizeHandler({
                    height: $(window).height()
                });

                $('.menu-toggle-btn').on('click touchend', function() {
                    if ($('body').hasClass('menuOpen')) {
                        self.closeMenu();
                    } else {
                        self.openMenu();
                    }
                });
            },
            openMenu: function() {
                var self = this;

                $('body').removeClass('modalOpen');
                $('body').addClass('menuOpen');

                // $('.push-wrapper').on('click touchend', function() {
                //     self.closeMenu();
                // });
            },
            closeMenu: function() {
                $('.push-wrapper').off('click touchend');
                $('body').removeClass('menuOpen');
            },
            window_resizeHandler: function() {
                // console.log('resiiize');
                // console.log($(this.el).height() / 2);
                $(this.el).css({
                    'margin-top': '-' + $(this.el).height() / 2 + 'px'
                });
            },
            sectionSelected_handler: function(attrs) {
                $(this.el).find('.node').removeClass('selected');
                $(this.el).find('.node').removeClass('last-selected');
                $(this.el).find('.node:lt(' + (attrs.index + 1) + ')').addClass('selected');
                $(this.el).find('.node:eq(' + (attrs.index) + ')').addClass('last-selected');

                $(this.el).find('.line .front').height(attrs.index / (this.slides.length - 1) * 100 + 0.1 + '%');
            },
            beforeRender: function() {
                this.slides.forEach(function(slide) {
                    this.insertView(".nodes", new this.MenuNodeView({
                        model: slide
                    }));
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