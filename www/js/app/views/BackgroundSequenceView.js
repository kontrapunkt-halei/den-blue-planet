define([
        // Libraries.
        'jquery',

        'channel',
        'loader',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Channel, Loader) {
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

                //compare window ratio to image ratio so you know which way the image should fill
                if (windowAspectRatio < imgAspectRatio) {
                    // we are fill width
                    imgWidth = windowWidth;
                    // and applying the correct aspect to the height now
                    imgHeight = (windowWidth * imgAspectRatio);
                    // this can be margin if your element is not positioned relatively, absolutely or fixed
                    // make sure image is always centered
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

            rightNow: function(argument) {
                if (window['performance'] && window['performance']['now']) {
                    return window['performance']['now']();
                } else {
                    return +(new Date());
                }
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

                Channel.on('Loader.SequenceReady', function() {
                    self.stillImage = Loader.loadedImages[Loader.loadedImages.length - 1];

                    console.log('---as asdas');
                    console.log(self.stillImage);
                    console.log('---as asdasasdad');

                    if (Loader.loadedImages.length === 1) {
                        self.drawFrame(self.stillImage);
                    } else {
                        self.animating = true;
                        var fps = 24,
                            currentFrame = 0,
                            totalFrames = Loader.loadedImages.length - 1,
                            currentTime = self.rightNow();

                        (function animloop(time) {
                            var delta = (time - currentTime) / 1000;

                            currentFrame += (delta * fps);

                            var frameNum = Math.floor(currentFrame);

                            if (frameNum >= totalFrames) {
                                self.animating = false;
                                return false;
                            }

                            window.requestAnimationFrame(animloop);
                            self.drawFrame(Loader.loadedImages[frameNum + 1]);

                            currentTime = time;
                        })(currentTime);
                    }
                    // ctx.putImageData(imgData, 10, 70);
                });
            },
            serialize: function() {
                return {};
            },
            cleanup: function() {}
        });
        return View;
    }
);