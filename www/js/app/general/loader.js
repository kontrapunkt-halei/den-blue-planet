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
                this.singleQueue.on('complete', this.singleQueue_completeHandler, this);
                this.singleQueue.on('progress', this.singleQueue_progressHandler, this);
                this.singleQueue.on('fileload', this.singleQueue_fileLoadHandler, this);

                this.initLargeQueue();

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
                            src: "/img/dev/" + pad.slice(str.length) + str + ".jpg"
                        });

                        index++;
                    }

                    this.largeQueue.loadManifest(manifest, false);
                }
            },
            setPausedLargeQueue: function(paused) {
                // this.largeQueue.setPaused(paused);
            },
            loadSequence: function(attrs) {
                this.setPausedLargeQueue(true);

                this.autoplay = attrs.autoplay ||  false;

                if (attrs.startFrame === this.startFrame && attrs.endFrame === this.endFrame && this.loadedImages) {
                    Channel.trigger('Loader.SequenceReady', {
                        autoplay: this.autoplay,
                        loadedImages: this.loadedImages
                    });
                    return false;
                }

                this.stopSequenceLoad();

                var startFrame = this.startFrame = attrs.startFrame,
                    endFrame = this.endFrame = attrs.endFrame,
                    manifest = [],
                    index = 1;

                if (startFrame <= endFrame) {
                    for (var i = startFrame; i <= endFrame; i++) {
                        var pad = "0000";
                        var str = String(i);

                        manifest.push({
                            id: index,
                            src: "/img/dev/" + pad.slice(str.length) + str + ".jpg"
                        });

                        index++;
                    }
                } else {
                    for (var j = startFrame; j >= endFrame; j--) {
                        var pad2 = "0000";
                        var str2 = String(j);

                        manifest.push({
                            id: index,
                            src: "/img/dev/" + pad2.slice(str2.length) + str2 + ".jpg"
                        });

                        index++;
                    }
                }

                // console.log(manifest);

                this.singleQueue.loadManifest(manifest);
            },
            stopSequenceLoad: function(argument) {
                this.singleQueue.setMaxConnections(50);
                this.singleQueue.removeAll();
                this.singleQueue.close();
                this.clearArray(this.loadedImages);
            },
            singleQueue_fileLoadHandler: function(event) {
                var item = event.item;

                this.largeQueue.remove(item.src);

                if (item.type === 'image') {
                    this.loadedImages[Number(item.id)] = event.result;
                }
            },
            singleQueue_completeHandler: function() {
                console.log('Loader: Complete loading.');
                Channel.trigger('Loader.SequenceReady', {
                    autoplay: this.autoplay,
                    loadedImages: this.loadedImages
                });

                this.setPausedLargeQueue(false);
            },
            singleQueue_progressHandler: function(event) {
                Channel.trigger('Loader.SequenceProgress', {
                    progress: event.progress
                });
            },
            singleQueue_errorHandler: function() {},

            clearArray: function(arr) {
                while (arr.length > 0) {
                    arr.pop();
                }
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