"use strict";
// Generated by CoffeeScript 1.8.0
(typeof exports !== "undefined" && exports !== null ? exports : window).Sync = {
  debug: window._DEBUG,
  storage: chrome.storage.sync,
  doNotSync: ["settingsVersion", "previousVersion"],
  init: function() {
    chrome.storage.onChanged.addListener(this.handleStorageUpdate.bind(this));
    this.fetchAsync();
  },
  fetchAsync: function() {
    var _this = this;
    return this.storage.get(null, function(items) {
      var key, value;
      if (chrome.runtime.lastError === undefined) {
        for (key in items) {
          if (!Object.prototype.hasOwnProperty.call(items, key)) continue;
          value = items[key];
          _this.log("fetchAsync: " + key + " <- " + value);
          _this.storeAndPropagate(key, value);
        }
      } else {
        console.log("callback for Sync.fetchAsync() indicates error");
        console.log(chrome.runtime.lastError);
      }
    });
  },
  handleStorageUpdate: function(changes, area) {
    var change, key;
    for (key in changes) {
      if (!Object.prototype.hasOwnProperty.call(changes, key)) continue;
      change = changes[key];
      this.log("handleStorageUpdate: " + key + " <- " + change.newValue);
      this.storeAndPropagate(key, change != null ? change.newValue : undefined);
    }
  },
  storeAndPropagate: function(key, value) {
    var defaultValue, defaultValueJSON;
    if (!key in Settings.defaults) {
      return;
    }
    if (!this.shouldSyncKey(key)) {
      return;
    }
    if (value && key in localStorage && localStorage[key] === value) {
      return;
    }
    defaultValue = Settings.defaults[key];
    defaultValueJSON = JSON.stringify(defaultValue);
    if (value && value !== defaultValueJSON) {
      this.log("storeAndPropagate update: " + key + "=" + value);
      value = JSON.parse(value);
    } else {
      this.log("storeAndPropagate clear: " + key);
      value = defaultValue;
    }
    Settings.set(key, value);
  },
  set: function(key, value) {
    var key_value;
    if (this.shouldSyncKey(key)) {
      this.log("set scheduled: " + key + "=" + value);
      key_value = {};
      key_value[key] = value;
      return this.storage.set(key_value, (function(_this) {
        return function() {
          if (chrome.runtime.lastError) {
            console.log("callback for Sync.set() indicates error: " + key + " <- " + value);
            return console.log(chrome.runtime.lastError);
          }
        };
      })(this));
    }
  },
  clear: function(key) {
    if (this.shouldSyncKey(key)) {
      this.log("clear scheduled: " + key);
      return this.storage.remove(key, (function(_this) {
        return function() {
          if (chrome.runtime.lastError) {
            console.log("for Sync.clear() indicates error: " + key);
            return console.log(chrome.runtime.lastError);
          }
        };
      })(this));
    }
  },
  shouldSyncKey: function(key) {
    return this.doNotSync.index(key) < 0;
  },
  log: function(msg) {
    if (this.debug) {
      return console.log("Sync: " + msg);
    }
  }
};
