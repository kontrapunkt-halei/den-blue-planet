/*
 * Router. Initializes the root-level View(s), and calls the render() method on Sub-View(s).
 */

define([
        'backbone',

        'text!/data.json',

        //Views
        'views/BackgroundView',
        'views/MenuView',

        //General
        'channel',
        'layoutmanager',

        //Plugins
        'jqueryEasing'
    ],

    function(
        Backbone,

        dataJson,

        //Views
        BackgroundView,
        MenuView,

        //General
        Channel,
        LayoutManager
    ) {

        'use strict';

        var Router = Backbone.Router.extend({

            data: $.parseJSON(dataJson),
            firstLoad: true,
            currentSlideId: 0,

            routes: {
                '': 'index',
                ':sectionUrl': 'showSection',
            },

            //Attaching Backbone views to the DOM-elements.
            initViews: function() {
                var self = this;
            },

            //Handling resizing of elements.
            //-Changes the sections width/height
            //-Saves the sections positions in an array (for the snap function.)
            windowResize_handler: function(e, callback) {
                Channel.trigger('window.resize', {
                    width: $(window).width(),
                    height: $(window).height()
                });
            },

            //Initializing the application
            initialize: function() {
                var self = this;

                console.log(this.data.slides);

                //Window resize
                $(window).resize(function() {
                    self.windowResize_handler();
                });

                LayoutManager.useLayout("app").setViews({
                    ".background": new BackgroundView({}),
                    ".menu": new MenuView({
                        slides: this.data.slides
                    })
                }).render(function() {});

                //Dont call this until preoading done.
                Backbone.history.start({
                    pushState: false
                });

                //View init
                this.initViews();
            },

            //Default route.
            index: function() {
                Backbone.history.navigate(this.data.slides[0].url, {
                    trigger: true
                });
            },

            showSection: function(sectionUrl, callback) {
                Channel.on('Loader.SequenceProgress', function(attrs) {
                    console.log('Progress: ' + attrs.progress * 100);
                }, this);

                if (this.firstLoad) {
                    Channel.on('Loader.SequenceReady', function() {
                        console.log('Start with this.');
                    }, this);
                    setTimeout(function() {
                        Channel.trigger('Loader.LoadSequence', {
                            startFrame: 0,
                            endFrame: 0
                        });
                    }, 100);
                    setTimeout(function() {
                        Channel.trigger('Loader.LoadSequence', {
                            startFrame: 500,
                            endFrame: 800
                        });
                    }, 1500);
                }
                this.firstLoad = false;
            }
        });

        return Router;

    }
);