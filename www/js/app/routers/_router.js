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
            currentSection: null,
            currentSectionView: null,
            newSection: null,
            newSectionView: null,
            playbackComplete: false,

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

                //Playback complete
                Channel.on('Background.PlaySequence', function() {
                    self.playbackComplete = false;
                });
                Channel.on('Background.PlaybackComplete', function() {
                    self.playbackComplete = true;
                });

                //Animate out complete - change view
                Channel.on('Section.AnimateOutComplete', this.sectionAnimateOutCompleteHandler, this);
                Channel.on('Background.PlaybackComplete', this.sectionAnimateOutCompleteHandler, this);

                //Next prev
                Channel.on('Router.PrevSection', function(argument) {
                    Backbone.history.navigate('/' + self.getPreviousSection().url, {
                        trigger: true
                    });
                });
                Channel.on('Router.NextSection', function(argument) {
                    Backbone.history.navigate('/' + self.getNextSection().url, {
                        trigger: true
                    });
                });

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
                for (var i = 0; i < APP_CONFIG.slides.length; i++) {
                    if (String(APP_CONFIG.slides[i].url) === String(url)) {
                        return APP_CONFIG.slides[i];
                    }
                }
            },

            getNextSection: function() {
                return this.getSectionByIndex(this.currentSection.index + 1) ||  false;
            },

            getPreviousSection: function(index) {
                return this.getSectionByIndex(this.currentSection.index - 1) ||  false;
            },

            getSectionByIndex: function(index) {
                for (var i = 0; i < APP_CONFIG.slides.length; i++) {
                    if (String(APP_CONFIG.slides[i].index) === String(index)) {
                        return APP_CONFIG.slides[i];
                    }
                }
            },

            setSection: function(section) {
                var self = this;

                console.log('Set section called for: ' + section.title);


                if (this.currentSection) {
                    this.newSection = section;
                    this.newSectionView = new SectionBigGraphicView({
                        model: section
                    });

                    this.currentSectionView.animateOut();
                } else {
                    this.currentSection = section;
                    this.currentSectionView = new SectionBigGraphicView({
                        model: section
                    });
                    LayoutManager.layout.setView(".content", this.currentSectionView).render();

                    Channel.trigger('Loader.LoadSequence', {
                        startFrame: this.currentSection.frame + 1,
                        endFrame: this.getNextSection().frame
                    });
                }
            },

            sectionAnimateOutCompleteHandler: function() {
                if (this.playbackComplete && this.newSection) {
                    this.currentSection = this.newSection;
                    this.currentSectionView = this.newSectionView;
                    LayoutManager.layout.setView(".content", this.newSectionView).render();

                    Channel.trigger('Loader.LoadSequence', {
                        startFrame: this.currentSection.frame + 1,
                        endFrame: this.getNextSection().frame
                    });
                }
            },

            showSection: function(sectionURL, callback) {
                if (!this.playbackComplete && !this.firstLoad) {
                    return false;
                }

                var self = this;
                var section = this.getSectionByURL(sectionURL);


                if (section === this.currentSection) {
                    return false;
                }

                //First load - special case
                if (this.firstLoad) {
                    this.firstLoad = false;

                    Channel.on('Loader.SequenceReady', function(attrs) {
                        if (attrs.autoplay) {
                            setTimeout(function() {
                                Channel.trigger('Background.PlaySequence');
                                setTimeout(function() {
                                    self.setSection(section);
                                }, 500);
                            }, 0);
                        }
                    }, this);
                    Channel.trigger('Loader.LoadSequence', {
                        startFrame: section.frame,
                        endFrame: section.frame,
                        autoplay: true
                    });
                } else {
                    //Other laods
                    if (Math.abs(this.currentSection.index - section.index) > 1) {
                        Channel.on('Loader.SequenceReady', function(attrs) {
                            if (attrs.autoplay) {
                                setTimeout(function() {
                                    Channel.trigger('Background.PlaySequence');
                                    self.setSection(section);
                                }, 0);
                            }
                        }, this);
                        Channel.trigger('Loader.LoadSequence', {
                            startFrame: section.frame,
                            endFrame: section.frame,
                            autoplay: true
                        });
                    } else {
                        Channel.on('Loader.SequenceReady', function(attrs) {
                            if (attrs.autoplay) {
                                setTimeout(function() {
                                    Channel.trigger('Background.PlaySequence');
                                    self.setSection(section);
                                }, 0);
                            }
                        }, this);

                        var startFrame = this.currentSection.frame + 1,
                            endFrame = section.frame;

                        if (startFrame > endFrame) {
                            startFrame = this.currentSection.frame;
                            endFrame = section.frame + 1;
                        }

                        Channel.trigger('Loader.LoadSequence', {
                            startFrame: startFrame,
                            endFrame: endFrame,
                            autoplay: true
                        });
                    }
                }

            }
        });

        return Router;

    }
);