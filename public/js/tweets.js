function transform_tweet(json_tweet) {
  return json_tweet;
}

var pollstate = 0;
var poll_wait = 3000;

function render(tweets) {
  tweets.forEach(function(tweet) {
    console.log(tweet);
    var $tweet_div = $('<div>').addClass('tweet').text(tweet.text);
    $tweet_div.appendTo('#tweets-container');
  });
}

function periodic_poll() {
  if (pollstate === 0) {
    pollstate = 1;

    var fetch = $.getJSON('http://localhost:3000/api/v1/timeline/artupfest?callback=?');

    fetch.fail(function(error) {
      throw("could not fetch tweets");
    });

    fetch.done(function(json) {
      if (json) {
        tweets = json.tweets.map(function(tweet){ return transform_tweet(tweet); });
        render(tweets);
      }
    });

    // fetch.always(function() {
    //   pollstate = 0;
    //   setTimeout(periodic_poll, poll_wait);
    // });
  } else {
    // setTimeout(periodic_poll, poll_wait);
  }
}

$(function() { periodic_poll(); });
