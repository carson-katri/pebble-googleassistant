'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '_gideon+hosted' });
});

/* GIDEON BULK */
const https = require('https');
const lame = require('lame');
const googleTTS = require('google-tts-api');
// const Speaker = require('speaker');
const GoogleAssistant = require('google-assistant');

const config = {
  auth: {
    keyFilePath: '/Users/carson/Desktop/_gideon/_gideon+hosted/client_secret.json',
    savedTokensPath: '/Users/carson/Desktop/_gideon/_gideon+hosted/tokens.js', // where you want the tokens to be saved
  },
  audio: {
    encodingIn: 'LINEAR16', // supported are LINEAR16 / FLAC (defaults to LINEAR16)
    sampleRateOut: 24000, // supported are 16000 / 24000 (defaults to 24000)
  },
};

const startConversation = (conversation, ttsResponse, type, res, encoded) => {
  var encoder = new lame.Encoder({
  	// INPUT
  	channels: 2,
  	bitDepth: 16,
  	sampleRate: 24000,

  	// OUTPUT
  	bitRate: 128,
  	outSampleRate: 24000,
  	mode: lame.STEREO
  });
  // setup the conversation
  conversation
    // send the audio buffer to the speaker
    .on('audio-data', (data) => {
      const now = new Date().getTime();
      encoder.write(data);
      /*
      speaker.write(data);

      // kill the speaker after enough data has been sent to it and then let it flush out
      spokenResponseLength += data.length;
      const audioTime = spokenResponseLength / (config.audio.sampleRateOut * 16 / 8) * 1000;
      clearTimeout(speakerTimer);
      speakerTimer = setTimeout(() => {
        speaker.end();
      }, audioTime - Math.max(0, now - speakerOpenTime));
      */

      console.log('Data: ' + data);
    })
    // done speaking (since we aren't speaking, let's just console log)
    .on('end-of-utterance', () => {
      console.log('TTS playback complete');
    })
    // just to spit out to the console what was said
    .on('transcription', text => {
      console.log('Transcription:', text);
      if (type == 1) {
      	// Send the transcription:
      	console.log("Got Transcription");
      	res.send(text);
      }
    })
    // once the conversation is ended, see if we need to follow up
    .on('ended', (error, continueConversation) => {
      if (error) {
        console.log('Conversation Ended Error:', error);
      } else {
        console.log('Conversation Complete');
        conversation.end();

        if (type == 0) {
	      	// Transcribe the message
	      	console.log("Starting transcription.");
	      	assistant.start((converse) => {
				startConversation(converse, null, 1, res, encoder);
				console.log("Transcription started");
				console.log("Using data: " + encoder);
			});
	    } else {
	      	// We got the transcription!
	      	console.log("DONE");
	    }
      }
    })
    // catch any errors
    .on('error', (error) => {
      console.log('Conversation Error:', error);
    });

  // decode the mp3 and send it off
  if (type == 0) {
  	// TTS the text request
	  const decoder = new lame.Decoder();
	  ttsResponse.pipe(decoder).on('format', (format) => {
	    decoder.pipe(conversation);
	  });
  } else if (type == 1) {
  	// We're sending the response from the Google Assistant
  	console.log("Sending data to Google Assistant");
  	const decoder = new lame.Decoder();
  	encoded.pipe(decoder).on('format', (format) => {
  		decoder.pipe(conversation);
  	})
  }

  /* setup the speaker
  const speaker = new Speaker({
    channels: 1,
    sampleRate: config.audio.sampleRateOut,
  });
  speaker
    .on('open', () => {
      console.log('Assistant Speaking');
      speakerOpenTime = new Date().getTime();
    })
    .on('close', () => {
      console.log('Assistant Finished Speaking');
      conversation.end();
    });
  */

  // Turn the audio into text
};

const assistant = new GoogleAssistant(config);
	assistant
    .on('ready', () => {
      // Ready for requests
    })
    // .on('started', promptForInput)
    .on('error', (error) => {
      console.log('Assistant Error:', error);
    });

/* GIDEON API */
router.get('/ask', function(req, res, next) {
	var request = req.query.query;
	googleTTS(request)
		.then((url) => {
			console.log('Grabbing TTS file...');

			// go snag the file
			https.get(url, (response) => {
			  if (!response || response.statusCode !== 200) {
			    console.error('Failed to download TTS file from', url, response.statusMessage);
			    return;
			  }

			  // start the conversation
			  assistant.start((conversation) => {
			    startConversation(conversation, response, 0, res);
			  });
			});
		})
		.catch(error => console.error);
});



module.exports = router;