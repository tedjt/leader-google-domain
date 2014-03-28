
var extend = require('extend');
var Google = require('google');
var objCase = require('obj-case');

/**
 * Create a new leader plugin.
 *
 * @returns {Object}
 */

module.exports = function (proxyManager) {
  return { fn: plugin(proxyManager), wait: wait };
};

/**
 * Create a domain googling leader plugin.
 *
 * @return {Function}
 */

function plugin (proxyManager) {
  var google = proxyManager ? Google({proxyManager: proxyManager}) : Google();
  return function googleDomainPlugin (person, context, next) {
    var interesting = getInterestingDomain(person, context);
    if (!interesting) return next();
    var domainarr = interesting.split('.');
    var domain = domainarr.slice(-2).join('.');
    if (domainarr.length > 2 && domainarr.slice(-1).length < 3 && domainarr.slice(-2).length < 4){
      domain = domainarr.slice(-3).join('.');
    }
    // want a site specific search for domain
    // e.g. site:stacklead.com stacklead.com
    google.query('info:' + domain, function (err, nextPage, results) {
      if (err) return next(err);
      results = results.links;
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
  return getInterestingDomain(person, context);
}

/**
 * Get an interesting domain.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {String}
 */

function getInterestingDomain (person, context) {
  if (person.domain && !person.domain.disposable && !person.domain.personal)
    return person.domain.name;
  else
    return null;
}
