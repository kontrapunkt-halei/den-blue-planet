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
        'views/SectionGraphicWProfileView',
        'views/SectionIntroView',
        'views/ControlsView',
        'views/ModalVideoView',
        'views/ModalGalleryView',
        'views/ModalTextView',

        //General
        'channel',
        'layoutmanager',
        'analytics'
    ],

    function(
        Backbone,

        APP_CONFIG,

        //Views
        BackgroundView,
        MenuView,
        ProgressBarView,
        SectionBigGraphicView,
        SectionGraphicWProfileView,
        SectionIntroView,
        ControlsView,
        ModalVideoView,
        ModalGalleryView,
        ModalTextView,

        //General
        Channel,
        LayoutManager,
        Analytics
    ) {

        'use strict';

        var Router = Backbone.Router.extend({

            firstLoad: true,
            currentSection: null,
            currentSectionView: null,
            newSection: null,
            newSectionView: null,
            playbackComplete: true,
            viewMappings: [],
            animateOutComplete: true,

            routes: {
                '': 'index'
                // ':sectionUrl': 'showSection',
            },

            //Adds the mappings between View names and the Views "classes".
            addMapping: function(sectionViewName, viewClass) {
                this.viewMappings[sectionViewName] = viewClass;
            },

            //Retrives the View Call based on data-view attr on the element
            createView: function(sectionViewName, attrs) {
                var ViewClass = this.viewMappings[sectionViewName];
                if (ViewClass) {
                    return new ViewClass(attrs);
                }
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

                // console.log('INIT!');

                //Window resize
                $(window).resize(function() {
                    self.windowResize_handler();
                });

                //Add view mapping
                this.addMapping('BigGraphic', SectionBigGraphicView);
                this.addMapping('GraphicWProfile', SectionGraphicWProfileView);
                this.addMapping('Intro', SectionIntroView);
                this.addMapping('modal-video', ModalVideoView);
                this.addMapping('modal-gallery', ModalGalleryView);
                this.addMapping('modal-text', ModalTextView);

                LayoutManager.useLayout("app").setViews({
                    ".background": new BackgroundView({}),
                    ".menu": new MenuView({
                        slides: APP_CONFIG.slides
                    }),
                    ".progress": new ProgressBarView({}),
                    ".controls": new ControlsView({})
                }).render(function() {
                    //Playback complete
                    Channel.on('Background.PlaySequence', function() {
                        // console.log('SET PLAY SEQUENCE FASLSE');
                        self.playbackComplete = false;
                    }, self);

                    Channel.on('Background.PlaybackComplete', function() {
                        // console.log('YEP YEP NOW ITS TRUE');
                        self.playbackComplete = true;
                        self.sectionAnimateOutCompleteHandler();
                    }, self);

                    //Animate out complete - change view
                    Channel.on('Section.AnimateOutComplete', function() {
                        self.animateOutComplete = true;
                        self.sectionAnimateOutCompleteHandler();
                    }, self);

                    //Next prev
                    Channel.on('Router.PrevSection', function(argument) {
                        var prevSection = self.getPreviousSection();
                        if (prevSection) {
                            Channel.trigger('Section.GoToSection', {
                                index: prevSection.index
                            });
                        }
                    }, self);
                    Channel.on('Router.NextSection', function(argument) {
                        var nextSection = self.getNextSection();
                        if (nextSection) {
                            Channel.trigger('Section.GoToSection', {
                                index: nextSection.index
                            });
                        }
                    }, self);
                    Channel.on('Section.GoToSection', function(attrs) {
                        if (!self.playbackComplete) {
                            // console.log('Ignore that go to selection because we are animating.');
                            return false;
                        }
                        var section = self.getSectionByIndex(attrs.index);
                        if (section) {
                            self.showSection(section);
                        }
                    }, self);

                    //Open modal
                    Channel.on('Modal.Open', self.openModal, self);
                    Channel.on('Modal.Close', self.closeModal, self);
                    $('.modal .close-btn').click(function() {
                        self.closeModal();
                    });

                    //Sequence loaded
                    Channel.on('Loader.SequenceReady', self.setSection, self);

                    //Dont call this until preoading done.
                    Backbone.history.start({
                        pushState: false
                    });
                });

            },

            //Default route.
            index: function() {
                Channel.trigger('Section.GoToSection', {
                    index: 0
                });
            },

            getModalById: function(id) {
                for (var i = 0; i < APP_CONFIG.modals.length; i++) {
                    if (String(APP_CONFIG.modals[i].id) === String(id)) {
                        return APP_CONFIG.modals[i];
                    }
                }
            },

            openModal: function(attrs) {
                if (this.modalView) {
                    $(this.modalView.el).remove();
                    this.modalView.cleanup();
                    this.modalView = null;
                }
                var modalData = this.getModalById(attrs.link);
                if (modalData) {
                    this.modalView = this.createView('modal-' + modalData.type, {
                        model: modalData
                    });
                    LayoutManager.layout.setView(".modal .inner", this.modalView).render(function() {
                        $('body').addClass('modalOpen');
                    });
                }
            },

            closeModal: function(attrs) {
                var self = this;
                $('body').removeClass('modalOpen');
                setTimeout(function() {
                    if (self.modalView) {
                        $(self.modalView.el).remove();
                        self.modalView.cleanup();
                        self.modalView = null;
                    }
                }, 1000);
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

            setSection: function(attrs) {
                var self = this;

                if (!attrs.autoplay) {
                    return false;
                }

                var section = this.newSection;

                // console.log('set section');

                if (this.currentSection) {
                    // console.log('section 0');
                    this.newSection = section;
                    this.newSectionView = this.createView(section.template, {
                        model: section
                    });

                    this.animateOutComplete = false;
                    this.currentSectionView.animateOut();
                } else {
                    // console.log('section 1');
                    this.currentSection = this.newSection;
                    this.currentSectionView = this.newSectionView = this.createView(section.template, {
                        model: section
                    });
                    LayoutManager.layout.setView(".content", this.currentSectionView).render();
                }

                // console.log(';;; :: ;; ::: LOASDED IMAGES ::: START');
                // console.log(attrs.loadedImages);
                // console.log(attrs.loadedImages.length);
                // console.log(';;; :: ;; ::: LOASDED IMAGES ::: END');

                if (attrs.loadedImages.length === 1 || attrs.loadedImages.length === 2) {
                    // console.log('loaded images length 1');
                    // console.log(attrs.loadedImages[1]);
                    setTimeout(function() {
                        Channel.trigger('Background.SetSingleImage', {
                            stillImage: attrs.loadedImages[0],
                            sectionIndex: section.index
                        });
                    }, 200);
                } else {
                    // console.log('loaded length bigger than 1');
                    setTimeout(function() {
                        Channel.trigger('Background.PlaySequence', {
                            loadedImages: attrs.loadedImages
                        });
                    }, 200);
                }
            },

            sectionAnimateOutCompleteHandler: function() {

                if (this.newSection === this.currentSection && !this.firstLoad) {
                    return false;
                }

                if (this.playbackComplete && this.newSection && this.animateOutComplete) {
                    var self = this;

                    // console.log('---SECTIONS: ' + this.newSection.title + ' - ' + this.currentSection.title);
                    this.currentSection = this.newSection;
                    this.currentSectionView = this.newSectionView;

                    Channel.trigger('Section.SectionSelected', {
                        index: this.currentSection.index,
                        maxIndex: APP_CONFIG.slides.length - 1,
                        section: this.currentSection
                    });

                    if (!this.firstLoad) {
                        LayoutManager.layout.setView(".content", this.newSectionView).render(function() {
                            //New view rendered

                            // Start loading animation-sequence to next section
                            Channel.trigger('Loader.LoadSequence', {
                                startFrame: self.currentSection.frame + 1,
                                endFrame: self.getNextSection().frame
                            });
                        });
                    } else {
                        this.firstLoad = false;
                        $('.background canvas').addClass('show');
                        //Start loading animation-sequence to next section
                        Channel.trigger('Loader.LoadSequence', {
                            startFrame: self.currentSection.frame + 1,
                            endFrame: self.getNextSection().frame
                        });
                    }

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
                    this.playbackComplete = false;
                    Channel.trigger('Loader.LoadSequence', {
                        startFrame: section.frame,
                        endFrame: section.frame,
                        image: section.image || false,
                        personImage: section.personImage || false,
                        autoplay: true
                    });
                } else {
                    this.playbackComplete = false;
                    //Other laods
                    if (Math.abs(this.currentSection.index - section.index) > 1) {
                        Channel.trigger('Loader.LoadSequence', {
                            startFrame: section.frame,
                            endFrame: section.frame,
                            image: section.image || false,
                            personImage: section.personImage || false,
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
                            image: this.currentSection.image || false,
                            personImage: this.currentSection.personImage || false,
                            autoplay: true
                        });
                    }
                }

            }
        });

        return Router;

    }
);