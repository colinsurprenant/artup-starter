var poll_wait = 3000;
var last_id_str = null;
var last_span = null;

var inter_tweet_delay = 500;
var text_delay = 50;

// debug stuff
var debug = false;
var debug_tweet = null;

function transform_tweet(json_tweet) {
  return json_tweet;
}

function render(tweets) {

  var render_next = function() {
    if (debug) { console.log('render_next tweets.length=' + tweets.length ); }

    // if no more tweets to render, back to polling
    if (tweets.length === 0) {
      setTimeout(poll_api, poll_wait);
      return;
    }

    if (last_span) {
      last_span.scrollIntoView();
    }

    // remove first tweet from tweets
    var tweet = tweets.shift();

    var $tweet_span = $('<span>').addClass('tweet').text(tweet.text + '  ').aciTypewriter({
      autoInit: true,
      autoStart: true,
      textDelay: text_delay,
      callbacks: {
        afterFinish: function(object) {
          setTimeout(function() {
            last_span = $tweet_span[0];
            render_next();
          }, inter_tweet_delay);
        }
      }
    });

    $tweet_span.appendTo('#tweets-container');
  };

  // start the render_next() callback dance
  render_next();
}

function poll_api() {
  var since_id = "";
  if (last_id_str) {
    since_id = 'since_id=' + last_id_str + '&';
  }

  var fetch = $.getJSON('http://ec2-54-225-55-169.compute-1.amazonaws.com/api/v1/timeline/artupfest?author=artupfest&order=asc&' + since_id + 'callback=?');
  // var fetch = $.getJSON('http://ec2-54-225-55-169.compute-1.amazonaws.com/api/v1/timeline/scarle.json?author=scarle&order=asc&' + since_id + 'callback=?');

  fetch.fail(function(error) {
    throw("could not fetch tweets");
  });

  fetch.done(function(json) {
    if (json) {
      tweets = json.tweets.map(function(tweet) { return transform_tweet(tweet); });
      if (tweets.length > 0) {
        console.log("retrieved " + tweets.length + ", most recent=", tweets[0]);
        // last_id_str = tweets[0].id_str;
        debug_tweet = tweets[0];
        last_id_str = tweets[0].id_str > tweets[tweets.length -1].id_str ? tweets[0].id_str : tweets[tweets.length -1].id_str;

        render(tweets);
      } else {
        if (debug && debug_tweet) {
          console.log("no more tweets");
          render([debug_tweet]);
        } else {
          setTimeout(poll_api, poll_wait);
        }
      }
    }
  });
}

// short notation for $(document).ready(function()...
$(function() { poll_api(); });




