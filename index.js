
var extend = require('extend');
var google = require('google')();
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
    var domainarr = email.split('@')[1].split('.');
    var domain = domainarr.slice(-2).join('.');
    if (domainarr.length > 2 && domainarr.slice(-1).length < 3 && domainarr.slice(-2).length < 4){
      domain = domainarr.slice(-3).join('.');
    }
    // want a site specific search for domain
    // e.g. site:stacklead.com stacklead.com
    google.query('info:' + domain, function (err, nextPage, results) {
      results = results.links;
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
