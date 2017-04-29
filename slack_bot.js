/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it is running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();


controller.hears(['hello', '\bhi\b'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['food', 'hungry', 'lunch'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'hamburger',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        var Twit = require('twit')
        var returnedData
        var T = new Twit({
          consumer_key:         process.env.CONSUMER_KEY
        , consumer_secret:      process.env.CONSUMER_SECRET
        , access_token:         process.env.ACCESS_TOKEN
        , access_token_secret:  process.env.ACCESS_TOKEN_SECRET
        })
        T.get('statuses/user_timeline', { count:20, since_id: todaysDate(), trim_user: true, exclude_replies: true, user_id: 2295568387 }, function(err, data, response) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].text.indexOf('@bLAckwelder_LA') != -1){
                    console.log(data[i].text)
                    returnedData = data[i].text
                    if (user && user.name) {
                        bot.reply(message, 'Hello ' + user.name + ', today\'s food truck tweet is: ' + returnedData);
                    } else {
                        bot.reply(message, 'Hello, today\'s food truck tweet is: ' + returnedData);
                    }
                }
            }
        })
    });
});

controller.hears(['donut'], 'direct_message,direct_mention,mention', function(bot, message) {

  people = ['dex', 'dmitriy', 'ethan', 'graysonnull', 'jorgeolivero', 'shailie', 'winston'];
  tuesday = nearestTuesday();
  name = people[(tuesday.date.getDate() - 1) % people.length];
  bot.reply(message, '@' + name + ' is bringing donuts in ' + tuesday.days + ' days.');

});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + '.');

    });

controller.hears(['expensive', 'how much', 'cost', 'price'],
    'direct_message,direct_mention,mention', function(bot, message) {

        bot.reply(message,'If you have to ask, you can\'t afford it');

    });

controller.hears('winston',['direct_message,direct_mention,mention'], function(bot, message) {

        bot.reply(message,':heart_eyes:');

    });

controller.on(['direct_message', 'direct_mention', 'mention'], function(bot,message) {
    if (/[а-яА-ЯЁё]/.test(message.text)) {
        bot.reply(message, 'Здравствуйте Дмитрий')
    } else {
        bot.reply(message, 'Submit a PR')
        bot.reply(message, 'https://github.com/wlaoh/botkit')
    }

})

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = Number((uptime).toFixed(1)) + ' ' + unit;
    return uptime;
}

function todaysDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
      dd='0'+dd
    }

    if(mm<10) {
      mm='0'+mm
    }

    today = yyyy+'-'+mm+'-'+dd;
    return today;
}

function nearestTuesday() {
    today = new Date();
    curDay = today.getDay();
    // 2 is this week's Tuesday
    // 9 is next week's Tuesday
    if (curDay <= 2) {
      diffDays = 2 - curDay;
    } else {
      diffDays = 9 - curDay;
    }

    var result = new Date(today);
    result.setDate(result.getDate() + diffDays);

    return {
        date: new Date(result),
        days: diffDays
    };
}
