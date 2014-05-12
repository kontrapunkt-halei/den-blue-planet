define(['jquery', 'channel', 'preloadjs'],
    function($, Channel) {
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

            initialize: function() {
                this.singleQueue.on('complete', this.singleQueue_completeHandler, this);
                this.singleQueue.on('progress', this.singleQueue_progressHandler, this);
                this.singleQueue.on('fileload', this.singleQueue_fileLoadHandler, this);

                Channel.on('Loader.LoadSequence', this.loadSequence, this);


                this.loadSequence(20, 80);
            },
            loadSequence: function(attrs) {
                console.log('!!');
                this.singleQueue.close();

                var startFrame = attrs.startFrame,
                    endFrame = attrs.endFrame,
                    manifest = [],
                    index = 1;

                this.clearArray(this.loadedImages);

                for (var i = startFrame; i <= endFrame; i++) {
                    var pad = "00000";
                    var str = String(i);

                    manifest.push({
                        id: index,
                        src: "/img/dev3/JPEG/samlet_dbp_002_" + pad.slice(str.length) + str + ".jpg"
                    });

                    index++;
                }

                this.singleQueue.loadManifest(manifest);
            },
            singleQueue_fileLoadHandler: function(event) {
                var item = event.item;
                // console.log(event);
                if (item.type === 'image') {
                    this.loadedImages[item.id] = event.result;
                }
            },
            singleQueue_completeHandler: function() {
                console.log('readh');
                Channel.trigger('Loader.SequenceReady');
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