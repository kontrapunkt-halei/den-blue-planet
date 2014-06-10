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

                // console.log('backgroundvideoview afterRender');

                Channel.on('Background.PlaySequence', this.playSequence_handler, this);
                Channel.on('Section.SectionSelected', this.sectionSelected_handler, this);
                Channel.on('Background.SetSingleImage', function(attrs) {
                    if (attrs.sectionIndex > 2 && attrs.sectionIndex < 16) {
                        $('.video').css('opacity', '0');
                    }
                }, this);

                $('.video').css('opacity', '0');

                // initialize BigVideo
                this.BV = new $.BigVideo({
                    forceAutoplay: this.isTouch,
                    useFlashForFirefox: false,
                    container: $(this.el),
                    controls: false
                });
                this.BV.init();

                var isSafari = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;

                this.BV.getPlayer().on(isSafari ? 'canplaythrough' : 'loadeddata', function() {
                    self.onVideoLoaded();
                });

                //Expose videoEl to access it on Ipad to start video + add class to iPad video styling
                if (navigator.platform === 'iPad') {
                    window.videoEl = self.BV.getPlayer();
                    $('body').addClass('isIpad');
                }
            },

            playSequence_handler: function(attrs) {
                // console.log('playSequence_handler');
                var self = this;
                $('.video').animate({
                    'opacity': '0'
                }, 300, function() {
                    self.BV.getPlayer().pause();
                });
            },

            sectionSelected_handler: function(attrs) {
                // console.log('sectionSelected_handler');
                var self = this;
                if (this.currentVideo !== attrs.section.loop) {
                    this.currentVideo = attrs.section.loop;
                    self.BV.show(attrs.section.loop + '.mp4', {
                        ambient: true,
                        altSource: attrs.section.loop + '.webm'
                    });
                } else {
                    self.BV.getPlayer().play();
                    $('.video').css('opacity', '1');
                }
            },

            playVideo: function() {},

            onVideoLoaded: function() {
                $('.video').animate({
                    'opacity': '1'
                }, 1500, function() {});
            },

            serialize: function() {
                return {};
            },
            cleanup: function() {}
        });
        return View;
    });