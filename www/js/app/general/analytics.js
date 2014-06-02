define(['backbone', 'channel'],
    function(Backbone, Channel) {
        Channel.on('Section.SectionSelected', function(attrs) {
            _gaq.push(['_trackPageview', '/' + attrs.section.title.split(' ').join('-')]);
        }, this);
        Channel.on('Modal.Open', function(attrs) {
            _gaq.push(['_trackEvent', 'ModalOpened', attrs.link]);
        }, this);
    }
);