/*
 * Router. Initializes the root-level View(s), and calls the render() method on Sub-View(s).
 */

define([
        'backbone',

        'APP_CONFIG',

        //Views
        'views/BackgroundView',
        'views/MenuView',
        'views/ProgressBarView',

        //General
        'channel',
        'layoutmanager',

        //Plugins
        'jqueryEasing'
    ],

    function(
        Backbone,

        APP_CONFIG,

        //Views
        BackgroundView,
        MenuView,
        ProgressBarView,

        //General
        Channel,
        LayoutManager
    ) {

        'use strict';

        var Router = Backbone.Router.extend({

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

                console.log(APP_CONFIG.slides);

                //Window resize
                $(window).resize(function() {
                    self.windowResize_handler();
                });

                LayoutManager.useLayout("app").setViews({
                    ".background": new BackgroundView({}),
                    ".menu": new MenuView({
                        slides: APP_CONFIG.slides
                    }),
                    ".progress": new ProgressBarView({})
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
                Backbone.history.navigate(APP_CONFIG.slides[0].url, {
                    trigger: true
                });
            },

            showSection: function(sectionUrl, callback) {
                Channel.on('Loader.SequenceProgress', function(attrs) {
                    // console.log('Progress: ' + attrs.progress * 100);
                }, this);

                if (this.firstLoad) {
                    setTimeout(function() {
                        Channel.trigger('Loader.LoadSequence', {
                            startFrame: 0,
                            endFrame: 0
                        });
                    }, 100);
                }
                this.firstLoad = false;
                $('body').on('click', '.node', function() {
                    Channel.trigger('Loader.LoadSequence', {
                        startFrame: 1600,
                        endFrame: 1900
                    });
                    Channel.on('Loader.SequenceReady', function() {}, this);
                });

                $('body').on('touchend', '.content', function() {
                    Channel.trigger('Loader.PlaySequence');
                });
            }
        });

        return Router;

    }
);