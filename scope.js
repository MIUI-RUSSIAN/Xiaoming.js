/**
 * Scope
 *
 */

'use strict';

function deepCopy(target, child) {
  deepCopy.cached = deepCopy.cached || [];
  child = child || {};

  for (var i in target) {
    if (target.hasOwnProperty(i)) {
      var type = Object.prototype.toString.call(i);

      if (type === '[object Array]' || type === '[object Object]') {
        if (deepCopy.cached.indexOf(i) === -1) {
          deepCopy.cached.push(i);
          deepCopy(target, child);
        } else {
          throw error('Object contains cycle reference');
        }
      } else {
        child[i] = target[i];
      }
    }
  }

  return child;
}

function Scope() {
  this.$$watchers = [];
}

// 处理 watchFn 返回 undefined 的情况
// function 按引用比较
//
// Note: 酱紫的话，我觉得 object 也可以哦
function initWatchVal() {};

Scope.prototype.$watch = function(watchFn, listenerFn, isDeep) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn || function() {},
    last: initWatchVal,
    isDeep: !!isDeep
  };

  this.$$lastDirtyWatch = null;
  this.$$watchers.push(watcher);
};

Scope.prototype.$digest = function() {
  var TTL = 10;
  var dirty;

  // performance optimization
  this.$$lastDirtyWatch = null;

  do {
    dirty = this.$$digestOnce();
    if (dirty && !TTL--) {
      throw '10 digest iteration reached';
    }
  } while (dirty);
};

Scope.prototype.$$digestOnce = function() {
  var self = this;
  var newValue, oldValue, dirty, isLast, isDeep;

  this.$$watchers.some(function(watcher) {
    newValue = watcher.watchFn(self);
    oldValue = watcher.last;
    isDeep = watcher.isDeep;

    if (!self.$$areEqual(newValue, oldValue, isDeep)) {
      self.$$lastDirtyWatch = watcher;
      watcher.last = (isDeep ? deepCopy(newValue) : newValue);
      // 初始化时，newValue 应当也是 oldValue
      watcher.listenerFn(newValue, 
        oldValue === initWatchVal ? newValue : oldValue,
        self);

      dirty = true;
    } else if (watcher === self.$$lastDirtyWatch) {
      dirty = false;
      isLast = true;
    }

    return isLast;
  });

  return dirty;
};

Scope.prototype.$eval = function(func, param) {
  return func(this, param);
};

Scope.prototype.$$areEqual = function(newValue, oldValue, isDeep) {
  var result = true;

  if (isDeep) {
    if (Object.prototype.toString.call(newValue) === '[object Array]') {
      newValue.some(function(value, index) {
        if (oldValue[index] !== value) {
          result = false;
          return true;
        }
      });
    } else {
      for (var i in newValue) {
        if (newValue[i] !== oldValue[i]) result = false;
      }
    }
  } else {
    result = (newValue === oldValue || 
      (typeof newValue === 'number' && typeof oldValue === 'number' && isNaN(newValue) && isNaN(oldValue))
    );
  }

  return result;
};

module.exports = Scope;
