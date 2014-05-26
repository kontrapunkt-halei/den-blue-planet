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
            template: 'SectionBigGraphic',
            className: 'SectionBigGraphicView',

            initialize: function(attrs) {
                Section.prototype.initialize.apply(this);
            },
            afterRender: function(argument) {
                Section.prototype.afterRender.apply(this);
                if (!$('html').hasClass('csscolumns')) {
                    $('.text-holder').columnize({
                        columns: 3
                    });
                }
            },
            afterRasdender: function() {
                //
            },
            serialize: function() {
                return this.model;
            },
            cleanup: function() {}
        });
        return View;
    }
);