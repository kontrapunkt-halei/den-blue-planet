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

                this.el = attrs.el;

                var self = this;

                this.animationFrame = new AnimationFrame(60);

                //Canvas properties
                this.canvas = $(this.el).find('.loading-circle')[0];

                if (window.devicePixelRatio) {
                    this.canvas.width = this.canvas.width * window.devicePixelRatio;
                    this.canvas.height = this.canvas.height * window.devicePixelRatio;
                }

                this.context = this.canvas.getContext('2d');
                this.cX = this.canvas.width / 2;
                this.cY = this.canvas.height / 2;
                this.radius = this.canvas.width / 2 - 5;
                this.endPercent = 0;
                this.curPerc = 0;
                this.circ = Math.PI * 2;
                this.quart = Math.PI / 2;
                this.context.lineWidth = 5;


                $(this.el).on('mouseover', function() {
                    self.context.lineWidth = 10;
                    self.triggerAnimation();
                });
                $(this.el).on('mouseout', function() {
                    self.context.lineWidth = 5;
                    self.triggerAnimation();
                });
            },

            sectionSelected_handler: function(attrs) {
                if (attrs.index === 0) {
                    $(this.el).addClass('first-section');
                } else {
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
                this.context.arc(this.cX, this.cY, this.radius, 0, 2 * Math.PI, false);
                this.context.strokeStyle = 'rgba(255,255,255,0.4)';

                this.context.stroke();

                this.context.beginPath();
                this.context.arc(this.cX, this.cY, this.radius, -(this.quart) + (this.circ * current), -(this.quart), true);
                this.context.strokeStyle = '#fff';

                this.context.stroke();
            },

            loading_startHandler: function(attrs) {
                if (!attrs.autoplay) {
                    this.curPerc = 0;
                    this.animate(0);
                }
            },

            loading_endHandler: function(attrs) {
                if (!attrs.autoplay) {
                    this.endPercent = 100;
                    this.animate(1);
                }
            },

            loading_setHandler: function(attrs) {
                if (!attrs.autoplay) {
                    this.triggerAnimation(attrs.progress);
                }
            }
        };

        return View;

    }
);