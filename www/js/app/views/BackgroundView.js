define([
        // Libraries.
        'jquery',

        'views/BackgroundSequenceView',

        'backbone',
        'backbone.layoutmanager'
    ],

    function($, BackgroundSequenceView) {
        var View = Backbone.LayoutView.extend({
            template: 'Background',

            initialize: function(attrs) {
                console.log('BG: Init.');

                this.SequenceView = new BackgroundSequenceView({});
            },
            afterRender: function() {
                console.log('BG: Rendered.');

                // Background sequence
                this.insertView(".sequence", this.SequenceView).render(function() {});
            },
            serialize: function() {
                return {};
            },
            cleanup: function() {}
        });
        return View;
    }
);