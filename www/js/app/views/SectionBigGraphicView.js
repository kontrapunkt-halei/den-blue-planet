define([
        // Libraries.
        'jquery',

        'views/SectionView',

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
            afterRender: function() {
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