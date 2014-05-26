define([
        // Libraries.
        'jquery',

        'views/SectionView',

        'jqueryColumnizer',
        'backbone',
        'backbone.layoutmanager'
    ],

    function($, Section) {
        var View = Section.extend({
            template: 'SectionGraphicWProfile',
            className: 'SectionGraphicWProfileView',

            initialize: function(attrs) {
                Section.prototype.initialize.apply(this);
            },
            afterRender: function() {
                Section.prototype.afterRender.apply(this);
                if (!$('html').hasClass('csscolumns')) {
                    $('.text-holder').columnize({
                        columns: 2
                    });
                }
            },
            serialize: function() {
                return this.model;
            },
            cleanup: function() {}
        });
        return View;
    }
);