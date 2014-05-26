define([
        // Libraries.
        'jquery',

        'views/SectionView',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Section) {
        var View = Section.extend({
            template: 'SectionIntro',
            className: 'SectionIntroView',

            initialize: function(attrs) {
                Section.prototype.initialize.apply(this);
            },
            afterRender: function() {
                Section.prototype.afterRender.apply(this);
            },
            serialize: function() {
                return this.model;
            },
            cleanup: function() {}
        });
        return View;
    }
);