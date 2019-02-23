'use strict'


 var crypto = require('crypto');
  function makePasswordEntry(clearTextPassword) {
      var hash = crypto.createHash('sha1');
      var salt = crypto.randomBytes(8).toString('hex');
      hash.update(clearTextPassword + salt);
      return {
          salt: salt,
          hash: hash.digest('hex')
      };
  }

  function doesPasswordMatch(hash, salt, clearTextPassword) {
      var hash2 = crypto.createHash('sha1');
      hash2.update(clearTextPassword + salt);
      var password = hash2.digest('hex');
      return password === hash;
  }

  module.exports = {
      makePasswordEntry:makePasswordEntry,
      doesPasswordMatch:doesPasswordMatch
  };