import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { Accounts } from 'meteor/accounts-base';
import Twit from 'twit';
import Future from 'fibers/future';

Meteor.methods({

  // ================
  // Accounts Methods
  // ================
	/*
- Method to check the registered phones
*/
  'getUserRegisteredPhones': function () {
    let user = Meteor.users.findOne(this.userId);

    // let returnedPhones = [];
    let returnedPhones = new Array();
    // If the usr has at least one registered phone
    if (typeof user.registered_phones !== 'undefined') {

      for (let i = 0; i < user.registered_phones.length; i++) {
        returnedPhones.push(user.registered_phones[i].number);
      }
      // console.log(returnedPhones);
      // console.log("teste");
    }
    return returnedPhones;
  },


	/*
	- Method to add phones to account
	*/

  'addRegisteredPhone': function (phone) {
    // Get the logged user object
    let user = Meteor.users.findOne(this.userId);

    // Sets the initial state of the profile.phones array to
    // later be updated inside the user object
    let registered_phones = new Array();
    if (typeof user.registered_phones !== 'undefined') {
      registered_phones = user.registered_phones;
    }

    // Checks if the profile.phones is unique
    let isUnique = true;
    for (let i = 0; i < registered_phones.length; i++) {
      if (registered_phones[i].number == phone) {
        isUnique = false;
      }
    }

    // Adds the newly added phone to the registered_phones array
    // only if the phone was not already there.
    if (isUnique) {
      registered_phones.push({
        number: phone,
        verified: false
      });

      // Updates the user in the database
      Meteor.users.update({ '_id': this.userId }, { $set: { registered_phones: registered_phones } });
    }
  },

  'getUserRegisteredEmails': function () {

    // Setting the user
    // this.userId is already sent to the server when
    // there is a user logged in the client
    let user = Meteor.users.findOne(this.userId);

    let returnedEmails = new Array();

    // If the usr has at least one registered email
    if (typeof user.registered_emails !== 'undefined') {

      for (let i = 0; i < user.registered_emails.length; i++) {
        returnedEmails.push(user.registered_emails[i].address);
      }
      console.log(returnedEmails);
    }

    return returnedEmails;
  },

  'addRegisteredEmail': function (email) {

    // Get the logged user object
    let user = Meteor.users.findOne(this.userId);

    // Sets the initial state of the registered_emails array to
    // later be updated inside the user object
    let registered_emails = new Array();
    console.log(typeof user.registered_emails);
    if (typeof user.registered_emails !== 'undefined') {
      registered_emails = user.registered_emails;
    }

    // Checks if the email is unique
    // TODO: Check the entire database, not only the emails from the logged user
    let isUnique = true;
    for (let i = 0; i < registered_emails.length; i++) {
      if (registered_emails[i].address == email) {
        isUnique = false;
      }
    }

    // Adds the newly added email to the registered_emails array
    // only if the email was not already there.
    if (isUnique) {
      registered_emails.push({
        address: email,
        verified: true
      });

      // Updates the user in the database
      Meteor.users.update({ '_id': this.userId }, { $set: { registered_emails: registered_emails } });
    }
  },

});

// =======================
// Accounts.onCreateUser()
// =======================
// This function is called right after the user is created and before it is saved in the Database
Accounts.onCreateUser(function (options, user) {

  // Use provided profile in options, or create an empty object
  user.profile = options.profile || {};
  // Assigns first and last names to the newly created user object
  user.profile.firstName = options.firstName;
  user.profile.lastName = options.lastName;
  user.registered_phones = [];

  // //Checking what is the service the user connected, and defining the informations about the profile
  if (user.services.facebook) {
    user.profile.image = 'http://graph.facebook.com/' + user.services.facebook.id + '/picture?type=square&height=80&width=80';
    user.profile.name = user.services.facebook.name;
    user.profile.cover = 'https://graph.facebook.com/v2.8/me?fields=cover{source}&access_token=' + user.services.facebook.accessToken;
  } else {

  }

  // Returns the user object
  return user;
});


// ==========================================
// Meteor accounts-meld Package Configuration
// ==========================================

let meldUserCallback = function (src_user, dst_user) {
  console.log('meldUserCallback');

  if (src_user.createdAt < dst_user.createdAt)
    dst_user.createdAt = src_user.createdAt;

  // 'profile' field
  let profile = {};
  _.defaults(profile, dst_user.profile || {});
  _.defaults(profile, src_user.profile || {});

  if (!_.isEmpty(profile))
    dst_user.profile = profile;
};

let meldDBCallback = function (src_user_id, dst_user_id) {
  console.log('meldDBCallback');
};

let serviceAddedCallback = function (user_id, service_name) {
  console.log('serviceAddedCallback');
  if (service_name === 'twitter') {
    let user = Meteor.users.findOne(user_id);
    let link = user.services[service_name].link;

    if (link)
      Meteor.users.update(user_id, { $set: { "profile.fb_link": link } });
  }
};

AccountsMeld.configure({
  meldUserCallback: meldUserCallback,
  meldDBCallback: meldDBCallback,
  serviceAddedCallback: serviceAddedCallback
});