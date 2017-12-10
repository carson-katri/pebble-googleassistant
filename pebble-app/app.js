/**
 * Copyright 2017 Carson Katri
 */

var UI = require('ui');
var Voice = require('ui/voice');

var Assistant = require('assistant.js');

var main = new UI.Card({
  title: 'Hello',
  body: 'Press select to ask me something...',
  titleColor: 'vivid-cerulean' // Gideon Teal
});

main.show();
main.on('click', 'select', function(e) {
  Voice.dictate('start', false, function(e) {
    if (e.err) {
      console.log('Error: ' + e.err);
      return;
    }
    
    Voice.dictate('stop');
    
    var loading = new UI.Card({
      title: 'Asking Google:',
      body: e.transcription
    });
    loading.show();
    
    Assistant.ask(e.transcription, function(response) {
      loading.hide();
      /*
      var card = new UI.Card({
        body: response
      });
      card.show();
      */
      
      Pebble.showSimpleNotificationOnPebble('Google', response);
    });
  });
});
