function transform_tweet(json_tweet) {
  return json_tweet;
}

var pollstate = 0;
var poll_wait = 3000;
var last_id_str = 354479612845236225;

function render(tweets) {

  // tweets array is from older to most recent
    tweets.forEach(function(tweet) {
    var $tweet_span = $('<span>').addClass('tweet').text(tweet.text);    
    $tweet_span.appendTo('#tweets-container');

    var $tweet_span2 = $('<span>').text(' ');
    $tweet_span2.appendTo('#tweets-container');

  });

$(document).ready(function(){

  // simple typewriter

  $('#tweets-container').aciTypewriter({
    autoInit: true, // or true to auto-init typewriter
    autoStart: true, // or true to auto-start typewriter
    callbacks: {
        beforeInit: function(object){
            // alert('before init: ' + object.attr('id'));
        },
        afterInit: function(object){
            // alert('after init: ' + object.attr('id'));
        },
        beforeStart: function(object){
            // alert('before start: ' + object.attr('id'));
        },
        afterFinish: function(object){
            // alert('after finish: ' + object.attr('id'));
        }
    }


  });


});


}



function periodic_poll() {
  if (pollstate === 0) {
    pollstate = 1;

    since_id = "354858981384138752";
    if (last_id_str) {
      since_id = 'since_id=' + last_id_str + '&';
    }
    // console.log('since_id=' + since_id);

    // var fetch = $.getJSON('http://localhost:3000/api/v1/timeline/artupfest?callback=?');
    var fetch = $.getJSON('http://ec2-54-225-55-169.compute-1.amazonaws.com/api/v1/timeline/scarle.json?author=scarle&order=asc&' + since_id + 'callback=?');


    fetch.fail(function(error) {
      throw("could not fetch tweets");
    });

    fetch.done(function(json) {
      if (json) {
        tweets = json.tweets.map(function(tweet){ return transform_tweet(tweet); });
        if (tweets.length > 0) {
          console.log("retrieved " + tweets.length + ", most recent=", tweets[0]);
          // last_id_str = tweets[0].id_str;
          last_id_str = tweets[0].id_str > tweets[tweets.length -1].id_str ? tweets[0].id_str : tweets[tweets.length -1].id_str;
          render(tweets);
          
        } else {
          console.log("no more tweets");
        }
      }
    });

    fetch.always(function() {
      pollstate = 0;
      setTimeout(periodic_poll, poll_wait);
    });
  } else {
    setTimeout(periodic_poll, poll_wait);
  }
}

$(function() { periodic_poll(); });





