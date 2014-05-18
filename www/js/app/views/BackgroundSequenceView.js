define([
        // Libraries.
        'jquery',

        'channel',
        'loader',
        'animationFrame',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel, Loader, AnimationFrame) {
        var View = Backbone.LayoutView.extend({
            template: 'BackgroundSequence',

            width: 0,
            height: 0,
            animating: false,
            stillImage: null,

            initialize: function(attrs) {
                console.log('BG Sequence: Init.');
            },

            drawFrame: function(image) {
                var imagePos = this.calcImagePos();

                if (image) {
                    this.ctx.drawImage(image, imagePos.left, imagePos.top, imagePos.width, imagePos.height);
                }
            },

            calcImagePos: function() {
                // get window size and aspect ratio
                var windowWidth = window.innerWidth,
                    windowHeight = window.innerHeight,
                    imgAspectRatio = 1344 / 2048,
                    windowAspectRatio = windowHeight / windowWidth,
                    imgWidth = 0,
                    imgHeight = 0,
                    imgTop = 0,
                    imgLeft = 0;

                if (windowAspectRatio < imgAspectRatio) {
                    imgWidth = windowWidth;
                    imgHeight = (windowWidth * imgAspectRatio);
                    imgLeft = "0";
                    imgTop = (windowHeight - (windowWidth * imgAspectRatio)) / 2;
                } else { // same thing as above but filling height instead
                    imgHeight = windowHeight;
                    imgWidth = (windowHeight / imgAspectRatio);
                    imgLeft = (windowWidth - (windowHeight / imgAspectRatio)) / 2;
                    imgTop = "0";
                }

                return {
                    width: imgWidth,
                    height: imgHeight,
                    top: imgTop,
                    left: imgLeft
                };
            },

            window_resizeHandler: function(args) {
                this.canvas = $(this.el).find('#bg-sequence');
                this.canvas[0].width = args.width;
                this.canvas[0].height = args.height;

                if (!this.animating) {
                    this.drawFrame(this.stillImage);
                }
            },

            afterRender: function() {
                var self = this;
                console.log('BG Sequence: Rendered.');

                Channel.on('window.resize', this.window_resizeHandler, this);

                this.width = $(window).width();
                this.height = $(window).height();

                this.canvas = $(this.el).find('#bg-sequence')[0];
                this.ctx = this.canvas.getContext("2d");
                this.canvas.width = this.width;
                this.canvas.height = this.height;

                self.animationFrame = new AnimationFrame(25);

                Channel.on('Background.SetSingleImage', function(attrs) {
                    if (attrs.stillImage) {
                        this.setSingleImage(attrs.stillImage);
                    }
                });

                Channel.on('Background.PlaySequence', function(attrs) {
                    self.animationFrame.cancel(self.requestID);

                    self.loadedImages = attrs.loadedImages;
                    self.stillImage = self.loadedImages[self.loadedImages.length - 1];

                    if (Loader.loadedImages.length === 1) {
                        self.drawFrame(self.stillImage);
                    } else {
                        self.currentFrame = 0;
                        self.animationFrame.cancel(self.requestID);
                        self.triggerAnimation();
                    }
                });
            },
            setSingleImage: function(stillImage) {
                if (stillImage) {
                    this.stillImage = stillImage;
                    this.drawFrame(this.stillImage);
                    Channel.trigger('Background.PlaybackComplete');
                }
            },
            triggerAnimation: function() {
                var self = this;

                self.requestID = this.animationFrame.request(function() {
                    self.animate();
                });
            },
            stopAnimation: function() {
                this.animationFrame.cancel(this.requestID);
                Channel.trigger('Background.PlaybackComplete');
            },
            animate: function() {
                var self = this;

                if (self.currentFrame < self.loadedImages.length - 1) {
                    self.drawFrame(self.loadedImages[self.currentFrame + 1]);
                    self.currentFrame++;
                    self.triggerAnimation();
                } else {
                    self.stopAnimation();
                }
            },
            serialize: function() {
                return {};
            },
            cleanup: function() {}
        });
        return View;
    });