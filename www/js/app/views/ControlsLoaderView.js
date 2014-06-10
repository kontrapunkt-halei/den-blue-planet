define(['backbone', 'channel', 'animationFrame'],

    function(Backbone, Channel, AnimationFrame) {

        'use strict';

        var View = {

            initialize: function(attrs) {
                //Bind channel events
                Channel.on('Loader.SequenceProgress', this.loading_setHandler, this);
                Channel.on('Loader.SequenceReady', this.loading_endHandler, this);
                Channel.on('Loader.LoadSequence', this.loading_startHandler, this);
                Channel.on('Section.SectionSelected', this.sectionSelected_handler, this);
                Channel.on('window.resize', this.window_resizeHandler, this);

                this.el = attrs.el;
                this.windowHeight = $(window).height();

                var self = this;

                this.animationFrame = new AnimationFrame(60);

                //Canvas properties
                this.canvas = $(this.el).find('.loading-circle')[0];

                if (window.devicePixelRatio > 1) {
                    this.canvas.width = this.canvas.width * window.devicePixelRatio;
                    this.canvas.height = this.canvas.height * window.devicePixelRatio;
                }

                this.lineWidth = window.devicePixelRatio > 1 ? 4 : 2,
                this.lineWidthBig = window.devicePixelRatio > 1 ? 12 : 6;

                this.context = this.canvas.getContext('2d');
                this.endPercent = 0;
                this.curPerc = 0;
                this.circ = Math.PI * 2;
                this.quart = Math.PI / 2;
                this.context.lineWidth = this.lineWidth;

                $(this.el).find('.next').on('mouseover', function() {
                    if ($('html').hasClass('no-touch')) {
                        self.context.lineWidth = self.lineWidthBig;
                        self.triggerAnimation();
                    }
                });
                $(this.el).find('.next').on('mouseout', function() {
                    if ($('html').hasClass('no-touch')) {
                        self.context.lineWidth = self.lineWidth;
                        self.triggerAnimation();
                    }
                });
                self.triggerAnimation();
            },

            window_resizeHandler: function(attrs) {
                this.windowHeight = attrs.height;
                this.triggerAnimation();
            },

            getCircleCY: function() {
                if (this.windowHeight < 696) {
                    return (window.devicePixelRatio > 1 ? 104 : 52);
                } else {
                    return this.canvas.height / 2;
                }
            },
            getCircleCX: function() {
                if (this.windowHeight < 696) {
                    return (window.devicePixelRatio > 1 ? 64 : 32);
                } else {
                    return this.canvas.width / 2;
                }
            },
            getCircleRadius: function() {
                if (this.windowHeight < 696) {
                    return (window.devicePixelRatio > 1 ? 64 : 32) - this.lineWidthBig;
                } else {
                    return this.canvas.width / 2 - this.lineWidthBig;
                }
            },

            sectionSelected_handler: function(attrs) {
                // console.log('----maxIndex!!!');
                // console.log(attrs.maxIndex);
                // console.log(attrs.index);
                if (attrs.index === 0) {
                    $(this.el).removeClass('last-section');
                    $(this.el).addClass('first-section');
                } else if (attrs.index === attrs.maxIndex) {

                    $(this.el).removeClass('first-section');
                    $(this.el).addClass('last-section');
                } else {
                    $(this.el).removeClass('last-section');
                    $(this.el).removeClass('first-section');
                }
            },

            triggerAnimation: function(procentage) {
                var self = this;
                self.procentage = procentage ||  self.procentage;
                self.requestID = this.animationFrame.request(function() {
                    self.animate(self.procentage);
                });
            },

            stopAnimation: function() {
                this.animationFrame.cancel(this.requestID);
            },

            animate: function(current) {
                var self = this;

                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.context.beginPath();
                this.context.arc(this.getCircleCX(), this.getCircleCY(), this.getCircleRadius(), 0, 2 * Math.PI, false);
                this.context.strokeStyle = 'rgba(255,255,255,0.4)';

                this.context.stroke();

                this.context.beginPath();
                this.context.arc(this.getCircleCX(), this.getCircleCY(), this.getCircleRadius(), -(this.quart) + (this.circ * current), -(this.quart), true);
                this.context.strokeStyle = '#fff';

                this.context.stroke();
            },

            loading_startHandler: function(attrs) {
                if (attrs.autoplay) {
                    this.curPerc = 0;
                    this.animate(0);
                }
            },

            loading_endHandler: function(attrs) {
                if (attrs.autoplay) {
                    this.endPercent = 100;
                    this.animate(1);
                }
            },

            loading_setHandler: function(attrs) {
                if (attrs.autoplay) {
                    this.triggerAnimation(attrs.progress);
                }
            }
        };

        return View;

    }
);