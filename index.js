
var extend = require('extend');
var google = require('google');
var objCase = require('obj-case');

/**
 * Create a new leader plugin.
 *
 * @returns {Object}
 */

module.exports = function () {
  return { fn: plugin(), wait: wait };
};

/**
 * Create a domain googling leader plugin.
 *
 * @return {Function}
 */

function plugin () {
  return function domainPlugin (person, context, next) {
    var email = getEmail(person, context);
    if (!email) return next();
    var domain = email.split('@')[1].split('.').slice(-2).join('.');
    // want a site specific search for domain
    // e.g. site:stacklead.com stacklead.com
    google('info:' + domain, function (err, nextPage, results) {
      if (err) return next(err);
      if (results.length > 0) {
        var result = results[0];
        var googleDomain = {
            description: result.description,
            google: {
              link: result.link
            }
        };
        extend(true, person, {
          domain: googleDomain
        });
        extend(true, context, {
          domain: {
            google: googleDomain
          }
        });
      }
      next();
    });
  };
}

/**
 * Wait until we have an email.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {Boolean}
 */

function wait (person, context) {
  return getEmail(person, context);
}

/**
 * Get the persons email.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {String}
 */

function getEmail (person, context) {
  return objCase(person, 'email');
}
