define(['jquery', 'channel', 'APP_CONFIG', 'preloadjs'],
    function($, Channel, APP_CONFIG) {
        var instance = null;

        function LoaderInstance() {
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one LoaderInstance, use LoaderInstance.getInstance()");
            }

            this.initialize();
        }
        LoaderInstance.prototype = {
            singleQueue: new createjs.LoadQueue(),
            largeQueue: new createjs.LoadQueue(),
            loadedImages: [],
            autoplay: false,

            initialize: function() {
                var self = this;

                this.singleQueue.addEventListener('complete', function(event) {
                    self.singleQueue_completeHandler(event);
                });
                this.singleQueue.addEventListener('progress', function(event) {
                    self.singleQueue_progressHandler(event);
                });
                this.singleQueue.addEventListener('fileload', function(event) {
                    self.singleQueue_fileLoadHandler(event);
                });

                this.initLargeQueue();

                this.singleQueue.setMaxConnections(30);

                Channel.on('Loader.LoadSequence', this.loadSequence, this);
            },
            initLargeQueue: function(attrs) {
                //Touch devices can't handle pre-fetching/caching of images in the background, so it's turned off for them.
                if (!Modernizr.touch) {
                    var startFrame = 0,
                        endFrame = APP_CONFIG.slides[APP_CONFIG.slides.length - 1].frame,
                        manifest = [],
                        index = 0;

                    this.largeQueue.setMaxConnections(30);

                    for (var i = startFrame; i <= endFrame; i++) {
                        var pad = "0000";
                        var str = String(i);

                        manifest.push({
                            id: index,
                            src: "img/bg/" + pad.slice(str.length) + str + ".jpg"
                        });

                        index++;
                    }

                    this.largeQueue.loadManifest(manifest, false);
                }
            },
            setPausedLargeQueue: function(paused) {
                if (!Modernizr.touch) {
                    // this.largeQueue.setPaused(paused);
                }
            },
            loadSequence: function(attrs) {
                var self = this;
                this.setPausedLargeQueue(true);

                this.autoplay = attrs.autoplay ||  false;

                if (attrs.startFrame === this.startFrame && attrs.endFrame === this.endFrame && this.loadedImages.length === Math.abs(this.startFrame - this.endFrame)) {
                    // console.log('------------ALREADY THERE??---');
                    Channel.trigger('Loader.SequenceReady', {
                        autoplay: this.autoplay,
                        loadedImages: this.loadedImages
                    });
                    return false;
                }

                this.stopSequenceLoad(function() {

                    var startFrame = self.startFrame = attrs.startFrame,
                        endFrame = self.endFrame = attrs.endFrame,
                        manifest = [],
                        index = 0;

                    if (startFrame <= endFrame) {
                        for (var i = startFrame; i <= endFrame; i++) {
                            var pad = "0000";
                            var str = String(i);

                            manifest.push({
                                id: index,
                                src: "img/bg/" + pad.slice(str.length) + str + ".jpg"
                            });

                            index++;
                        }
                    } else {
                        for (var j = startFrame; j >= endFrame; j--) {
                            var pad2 = "0000";
                            var str2 = String(j);

                            manifest.push({
                                id: index,
                                src: "img/bg/" + pad2.slice(str2.length) + str2 + ".jpg"
                            });

                            index++;
                        }
                    }

                    if (attrs.image) {
                        manifest.push({
                            id: 'illu-image',
                            src: attrs.image
                        });
                    }
                    if (attrs.personImage) {
                        manifest.push({
                            id: 'illu-personImage',
                            src: attrs.personImage
                        });
                    }

                    self.singleQueue.loadManifest(manifest);
                });
            },
            stopSequenceLoad: function(callback) {
                this.singleQueue.removeAll();
                this.singleQueue.close();
                this.clearArray(this.loadedImages, function() {
                    callback();
                });
            },
            singleQueue_fileLoadHandler: function(event) {
                if (String(event.item.id) !== 'illu-image' ||  String(event.item.id) !== 'illu-personImage') {
                    this.loadedImages[Number(event.item.id)] = event.result;
                }
            },
            singleQueue_completeHandler: function(event) {
                // console.log('Loader: Complete loading.');


                Channel.trigger('Loader.SequenceReady', {
                    autoplay: this.autoplay,
                    loadedImages: this.loadedImages
                });
                this.setPausedLargeQueue(false);
            },
            singleQueue_progressHandler: function(event) {
                Channel.trigger('Loader.SequenceProgress', {
                    progress: event.progress,
                    autoplay: this.autoplay
                });
            },
            singleQueue_errorHandler: function() {},

            clearArray: function(arr, callback) {
                while (arr.length > 0) {
                    arr.pop();
                }
                callback();
            }
        };
        LoaderInstance.getInstance = function() {
            // summary:
            //      Gets an instance of the singleton. It is better to use 
            if (instance === null) {
                instance = new LoaderInstance();
            }
            return instance;
        };

        return LoaderInstance.getInstance();
    });