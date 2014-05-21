define([
        // Libraries.
        'jquery',

        'channel',
        'swipe',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel) {
        var View = Backbone.LayoutView.extend({
            template: 'ModalGallery',
            className: 'ModalGalleryView',

            events: {
                'click .next-btn': 'nextBtn_clickHandler',
                'click .prev-btn': 'prevBtn_clickHandler'
            },

            initialize: function(attrs) {},

            afterRender: function() {
                var self = this;

                this.$sliderBottom = $('.slider-bottom');

                this.slider = new Swipe($(this.el).find('.slider')[0], {
                    speed: 400,
                    auto: false,
                    continuous: true,
                    disableScroll: false,
                    stopPropagation: false,
                    keyboard: true,
                    callback: function(index, elem) {
                        self.setNavigation(index, $(elem));
                    }
                });

                this.setNavigation(0, $(this.el).find('.slider .slide').first());

                Channel.on('window.resize', this.window_resizeHandler, this);
                this.window_resizeHandler({
                    height: $(window).height()
                });

                if (this.model.images.length === 1) {
                    $(this.el).find('.next-btn,.prev-btn').hide();
                }
            },
            window_resizeHandler: function(attrs) {
                $(this.el).find('.slider .slide, .slider .slide > div').height(attrs.height);
            },
            setNavigation: function(index, elem) {
                console.log('--------set navigation--------');
                var self = this;
                elem.find('img').load(function() {
                    console.log('IMAGE ____LOADED');
                    self.$sliderBottom.find('.text').text(elem.attr('data-title'));
                    self.$sliderBottom.find('.number .current').text(index + 1);

                    self.$sliderBottom.css({
                        width: elem.find('img').width(),
                        top: $(window).height() / 2 + elem.find('img').height() / 2 + 7,
                        'margin-left': -elem.find('img').width() / 2,
                    });
                }).each(function() {
                    if (this.complete) {
                        $(this).load();
                    }
                });
            },
            prevBtn_clickHandler: function() {
                this.slider.prev();
            },
            nextBtn_clickHandler: function() {
                this.slider.next();
            },
            serialize: function() {
                return this.model;
            },
            cleanup: function() {
                Channel.off('window.resize', this.window_resizeHandler);
            }
        });
        return View;
    }
);