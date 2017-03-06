import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import Twit from 'twit';
import Future from 'fibers/future';

import { Posts } from '../imports/api/posts.js';

Meteor.methods({
    // ==========================================
    // Post actions methods
    // ==========================================

    'commentFacebook': function (postId, comment) {

        let user = Meteor.users.findOne(this.userId);

        HTTP.post(
            'https://graph.facebook.com/' + postId + '/comments/?message=' + comment,
            {
                headers: {
                    'Authorization': 'Bearer ' + user.services.facebook.accessToken
                }
            },
            function (error, response) {
                if (error) {
                    console.log(error);
                }
                console.log(response);
            }
        );

    },

    'postFacebook': function (comment) {
        let user = Meteor.users.findOne(this.userId);

        HTTP.post(
            'https://graph.facebook.com/feed/?message=' + comment,
            {
                headers: {
                    'Authorization': 'Bearer ' + user.services.facebook.accessToken
                }
            },
            function (error, response) {
                if (error) {
                    console.log(error);
                }
                console.log(response);
            }
        );

    },

    'likeCrodity': function (postId, name, type) {
        let reaction = {
            name: name,
            type: type
        }
        let post = Posts.findOne({ id: postId });
        Posts.update({ id: postId }, { $push: { crodity_reactions: reaction } });
        console.log(post);
    },

    'searchYoutube': function (string) {
      let user = Meteor.users.findOne(this.userId);
        HTTP.get(
            'https://www.googleapis.com/youtube/v3/search?part=snippet',
            {
                  headers: {
                    'Authorization': 'Bearer ' + user.services.google.accessToken
                  }
            },
            function (error, response) {
              console.log('Aquiii',response);
                if (!error) {
                    return response;
                }else{
                  console.log(error);
                }
            }
        );
    },

    'postTwitter': function (message) {
        let user = Meteor.users.findOne(this.userId);

        // Connecting to the Twiter API using the twit module
        let Twitter = new Twit({
            consumer_key: '1Scmykinx39JgSGgAm8CxapEw',
            consumer_secret: 'CTYqmRkMC09urf61haguPnU7MPWyw97AXaDWDXMiZgoK5T90m8',
            access_token: user.services.twitter.accessToken,
            access_token_secret: user.services.twitter.accessTokenSecret
        });

        // Getting the user timeline that will be returned
        Twitter.post('statuses/update', { status: message }, function (err, data, response) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(data);
                console.log(response);
            }
        });
    },

});
