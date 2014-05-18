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
            playbackComplete: true,

            routes: {
                '': 'index'
                // ':sectionUrl': 'showSection',
            },

            initViews: function() {
                var self = this;
            },

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
                    var prevSection = self.getPreviousSection();
                    if (prevSection) {
                        Channel.trigger('Section.GoToSection', {
                            index: prevSection.url
                        });
                    }
                }, this);
                Channel.on('Router.NextSection', function(argument) {
                    var nextSection = self.getNextSection();
                    if (nextSection) {
                        Channel.trigger('Section.GoToSection', {
                            index: nextSection.url
                        });
                    }
                }, this);
                Channel.on('Section.GoToSection', function(attrs) {
                    if (!this.playbackComplete) {
                        console.log('Ignore that go to selection because we are animating.');
                        return false;
                    }
                    var section = this.getSectionByIndex(attrs.index);
                    if (section) {
                        this.showSection(section);
                    }
                }, this);

                //Sequence loaded
                Channel.on('Loader.SequenceReady', function(attrs) {
                    if (attrs.autoplay) {
                        setTimeout(function() {
                            if (attrs.loadedImages.length === 1) {
                                Channel.trigger('Background.SetSingleImage', {
                                    stillImage: attrs.loadedImages[0]
                                });
                            } else {
                                Channel.trigger('Background.PlaySequence', {
                                    loadedImages: attrs.loadedImages
                                });
                            }
                        }, 0);
                        this.setSection();
                    }
                }, this);

                //Dont call this until preoading done.
                Backbone.history.start({
                    pushState: false
                });

                //View init
                this.initViews();
            },

            //Default route.
            index: function() {
                Channel.trigger('Section.GoToSection', {
                    index: 0
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

            setSection: function() {
                var self = this;

                console.log('this.newSection');
                console.log(this.newSection);
                console.log('this.newSection');

                var section = this.newSection;

                console.log('set section');

                if (this.currentSection) {
                    console.log('section 0');
                    this.newSection = section;
                    this.newSectionView = new SectionBigGraphicView({
                        model: section
                    });

                    this.currentSectionView.animateOut();
                } else {
                    console.log('section 1');
                    this.currentSection = this.newSection;
                    this.currentSectionView = this.newSectionView = new SectionBigGraphicView({
                        model: section
                    });
                    LayoutManager.layout.setView(".content", this.currentSectionView).render();
                }
            },

            sectionAnimateOutCompleteHandler: function() {
                console.log('0 called 1232112');
                if (this.playbackComplete && this.newSection) {
                    this.currentSection = this.newSection;
                    this.currentSectionView = this.newSectionView;

                    Channel.trigger('Section.SectionSelected', {
                        index: this.currentSection.index
                    });

                    if (!this.firstLoad) {
                        LayoutManager.layout.setView(".content", this.newSectionView).render();
                    } else {
                        this.firstLoad = false;
                    }

                    Channel.trigger('Loader.LoadSequence', {
                        startFrame: this.currentSection.frame + 1,
                        endFrame: this.getNextSection().frame
                    });
                }
            },

            showSection: function(section) {
                var self = this;

                if (!this.playbackComplete) {
                    return false;
                }
                if (section === this.currentSection) {
                    return false;
                }

                this.newSection = section;

                //First load - special case
                if (this.firstLoad) {
                    Channel.trigger('Loader.LoadSequence', {
                        startFrame: section.frame,
                        endFrame: section.frame,
                        autoplay: true
                    });
                } else {
                    //Other laods
                    if (Math.abs(this.currentSection.index - section.index) > 1) {
                        Channel.trigger('Loader.LoadSequence', {
                            startFrame: section.frame,
                            endFrame: section.frame,
                            autoplay: true
                        });
                    } else {

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