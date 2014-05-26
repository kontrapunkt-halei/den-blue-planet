define([
        // Libraries.
        'jquery',

        'channel',

        'bigvideo',
        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel) {
        var View = Backbone.LayoutView.extend({

            currentVideo: '',

            initialize: function(attrs) {},

            afterRender: function() {
                var self = this;

                Channel.on('Background.PlaySequence', this.playSequence_handler, this);
                Channel.on('Section.SectionSelected', this.sectionSelected_handler, this);

                // initialize BigVideo
                this.BV = new $.BigVideo({
                    forceAutoplay: this.isTouch,
                    container: $(this.el),
                    controls: false,
                    useFlashForFirefox: true
                });
                this.BV.init();
                // this.playVideo();

                this.BV.getPlayer().on('loadeddata', function() {
                    self.onVideoLoaded();
                });
            },

            playSequence_handler: function(attrs) {
                var self = this;
                $('.video').animate({
                    'opacity': '0'
                }, 300, function() {
                    self.BV.getPlayer().pause();
                });
            },

            sectionSelected_handler: function(attrs) {
                var self = this;
                if (this.currentVideo !== attrs.section.loop) {
                    this.currentVideo = attrs.section.loop;
                    self.BV.show(attrs.section.loop, {
                        ambient: true
                    });
                } else {
                    self.BV.getPlayer().play();
                }
            },

            playVideo: function() {},

            onVideoLoaded: function() {
                $('.video').animate({
                    'opacity': '1'
                }, 1500, function() {

                });
            },

            serialize: function() {
                return {};
            },
            cleanup: function() {}
        });
        return View;
    });