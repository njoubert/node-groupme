var Q               = require('q');



/************************************************************************
 * Helper function for wrapping callback into promise
 ***********************************************************************/

// Since we standarize on the node.js style callback,
// we can use Q's nfapply functionality to create promises for callbacks.
var qfunc = function() {
    var args = Array.prototype.slice.call(arguments);
    return Q.nfapply(this, args);
}

/************************************************************************
 * API to deep-cycle through an object, turning all its functions 
 * into promise-generating functions
 ***********************************************************************/

var promisify = function(obj) {
  for (i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (typeof obj[i] == 'object') {
        promisify(obj[i]);
      } else if (typeof obj[i] == 'function') {
        obj[i].Q = qfunc;
      }
    }
  }
}

exports.promisify = promisify;