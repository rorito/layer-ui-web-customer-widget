/* global layer */
'use strict';

// Synchronous load of the configuration
var config;
var request = new XMLHttpRequest();
request.onload = function() {
  config = JSON.parse(this.responseText);
};
request.open('GET', 'LayerConfiguration.json', false);
request.send();

if (!config[0].app_id) throw new Error("No app_id key found in LayerConfiguration.json");


/**
 * layerSample global utility
 *
 * @param {String}    userId - User ID to log in as
 * @param {Function}  getIdentityToken - Layer Client getIdentityToken function
 * @param {Function}  dateFormat - Get a nice date string
 */
window.layerSample = {
  appId: config[0].app_id,
  identityProviderUrl: config[0].identity_provider_url + '/authenticate',
  userId: null,
  getIdentityToken: function(appId, userId, pass, nonce, callback) {
    Layer.Core.xhr({
      url: window.layerSample.identityProviderUrl,
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      },
      method: 'POST',
      data: {
        nonce: nonce,
        email: userId,
        password: pass
      }
    }, function(res) {
      if (res.success && res.data.identity_token) {
        console.log('challenge: ok');

        callback(res.data.identity_token);

        // Cleanup identity dialog
        var node = document.getElementById('identity');
        if (node) node.parentNode.removeChild(node);
      } else {
        console.error('challenge error: ', res.data);
      }
    });
  }
};
