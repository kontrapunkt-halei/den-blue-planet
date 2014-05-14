define([
        // Libraries.
        'jquery',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($) {
        var View = Backbone.LayoutView.extend({
            template: 'SectionBigGraphic',
            className: 'SectionBigGraphicView',

            initialize: function(attrs) {
                //
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