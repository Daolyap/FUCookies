(function(){
  var rejectConsent = {
    purpose: { consents: {}, legitimateInterests: {} },
    vendor: { consents: {}, legitimateInterests: {} },
    specialFeatureOptins: {}
  };
  function createHandler() {
    return function(cmd, version, callback) {
      if (typeof callback === 'function') {
        callback(Object.assign({ gdprApplies: true, cmpStatus: 'loaded', eventStatus: 'useractioncomplete', isLoaded: true, tcfPolicyVersion: 2 }, rejectConsent), true);
      }
    };
  }
  var _tcfapi;
  Object.defineProperty(window, '__tcfapi', {
    get: function() { return _tcfapi; },
    set: function() { _tcfapi = createHandler(); },
    configurable: true
  });
  var _cmp;
  Object.defineProperty(window, '__cmp', {
    get: function() { return _cmp; },
    set: function() { _cmp = createHandler(); },
    configurable: true
  });
})();
