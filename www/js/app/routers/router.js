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
        'views/SectionBigGraphicView',
        'views/ControlsView',

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
        SectionBigGraphicView,
        ControlsView,

        //General
        Channel,
        LayoutManager
    ) {

        'use strict';

        var Router = Backbone.Router.extend({

            firstLoad: true,
            currentSection: {},

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
                    ".progress": new ProgressBarView({}),
                    ".controls": new ControlsView({})
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

            getSectionByURL: function(url) {
                var returnSlide;
                for (var i = 0; i < APP_CONFIG.slides.length; i++) {
                    if (String(APP_CONFIG.slides[i].url) === String(url)) {
                        returnSlide = APP_CONFIG.slides[i];
                        return returnSlide;
                    }
                }
            },

            setSection: function(section) {
                this.currentSection = section;
                LayoutManager.layout.setView(".content", new SectionBigGraphicView({
                    model: section
                })).render();
            },

            showSection: function(sectionURL, callback) {
                var self = this;
                var section = this.getSectionByURL(sectionURL);

                if (section === this.currentSection) {
                    return false;
                }

                //First load - special case
                if (this.firstLoad) {
                    this.firstLoad = false;

                    Channel.on('Loader.SequenceReady', function() {
                        setTimeout(function() {
                            Channel.trigger('Background.PlaySequence');
                            self.setSection(section);
                        }, 0);
                    }, this);
                    Channel.trigger('Loader.LoadSequence', {
                        startFrame: section.frame,
                        endFrame: section.frame
                    });
                } else {
                    //Other laods
                    if (Math.abs(this.currentSection.id - section.id) > 1) {
                        Channel.on('Loader.SequenceReady', function() {
                            setTimeout(function() {
                                Channel.trigger('Background.PlaySequence');
                                self.setSection(section);
                            }, 0);
                        }, this);
                        Channel.trigger('Loader.LoadSequence', {
                            startFrame: section.frame,
                            endFrame: section.frame
                        });
                    } else {
                        console.log('ANIIIMATE matemate');
                        console.log('frame current: ' + this.currentSection.frame);
                        console.log('frame section: ' + section.frame);
                        console.log('----');
                        Channel.on('Loader.SequenceReady', function() {
                            setTimeout(function() {
                                Channel.trigger('Background.PlaySequence');
                                self.setSection(section);
                            }, 0);
                        }, this);

                        var startFrame = this.currentSection.frame + 1,
                            endFrame = section.frame;

                        if (startFrame > endFrame) {
                            startFrame = this.currentSection.frame;
                            endFrame = section.frame + 1;
                        }

                        Channel.trigger('Loader.LoadSequence', {
                            startFrame: startFrame,
                            endFrame: endFrame
                        });
                    }
                }

            }
        });

        return Router;

    }
);