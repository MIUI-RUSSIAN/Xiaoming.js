/**
 * Scope
 *
 */

'use strict';

function Scope() {
  this.$$watchers = [];
}

// 处理 watchFn 返回 undefined 的情况
// function 按引用比较
//
// Note: 酱紫的话，我觉得 object 也可以哦
function initWatchVal() {};

Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn || function() {},
    last: initWatchVal
  };

  this.$$watchers.push(watcher);
};

Scope.prototype.$digest = function() {
  var dirty;
  do {
    dirty = this.$$digestOnce();
  } while (dirty);
}

Scope.prototype.$$digestOnce = function() {
  var self = this;
  var newValue, oldValue, dirty;

  this.$$watchers.forEach(function(watcher) {
    newValue = watcher.watchFn(self);
    oldValue = watcher.last;

    if (newValue !== oldValue) {
      watcher.last = newValue;
      // 初始化时，newValue 应当也是 oldValue
      watcher.listenerFn(newValue, 
        oldValue === initWatchVal ? newValue : oldValue,
        self);

      dirty = true;
    }
  });

  return dirty;
};

module.exports = Scope;
