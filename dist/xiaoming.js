'use strict';

void (function () {
  var Xiaoming = {};

  Xiaoming.version = '0.0.1';
  Xiaoming.noop = function () {};

  // Object.create 兼容 < IE9
  if (!Object.create) {
    Object.create = function (klass) {
      function f() {}
      f.prototype = klass;
      return new f();
    };
  }

  // Array.isArray 兼容 < IE9
  if (!Array.isArray) {
    Array.isArray = function (array) {
      return Object.prototype.toString.call(array) === '[object Array]';
    };
  }

  Xiaoming.copy = function (source) {
    if (typeof source !== 'object' && !Array.isArray(source)) return source;

    var result = {};

    for (var key in source) {
      if (isArray(source[key])) {
        result[key] = [];
        source[key].forEach(function (value) {
          result[key].push(value);
        });
      } else if (typeof source[key] === 'object') {
        result[key] = Xiaoming.copy(source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  };

  Xiaoming.isElement = function (element) {
    return element.tagName && ~element.nodeType;
  };

  // 生成随机的guid
  Xiaoming.guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    }).toUpperCase();
  };

  var Class = Xiaoming.Class = {
    // 通过 create 创建实例后，在 Class 实例上触发 inherited 方法
    inherited: function inherited() {},

    // 通过 create 创建实例后，在新的实例上触发 created 方法
    created: function created() {},

    prototype: {
      constructor: Xiaoming.Class,
      initializer: function initializer() {},
      init: function init() {}
    },

    create: function create(include, extend) {
      var klass = Object.create(this);

      klass.parent = this;
      klass.prototype = klass.fn = Object.create(this.prototype);

      // 添加实例 属性/方法
      if (include) klass.include(include);
      // 添加类 属性/方法
      if (extend) klass.extend(extend);

      klass.created();
      this.inherited(klass);

      return klass;
    },

    // 生成继承原型的实例
    init: function init() {
      var instance = Object.create(this.prototype);

      instance.parent = this;

      // 初始化新实例
      instance.initializer.apply(instance, arguments);
      instance.init.apply(instance, arguments);

      return instance;
    },

    // 为实例添加方法
    include: function include(obj) {
      if (typeof obj !== 'object' && Object.prototype.toString.call(obj) !== '[object Array]') return new Error('Include paramater');

      for (var key in obj) {
        if (obj.hasOwnProperty(key) && key !== 'included') this.fn[key] = obj[key];
      }

      if (obj.included) obj.included.apply(this);

      return this;
    },

    // 为构造函数添加方法
    extend: function extend(obj) {
      // TODO: 检查循环引用
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && key !== 'extended') this[key] = obj[key];
      }

      if (obj.extended) obj.extended.apply(this);

      return this;
    },

    proxy: function proxy(func) {
      var self = this;

      return function () {
        return func.apply(self, arguments);
      };
    }
  };

  Class.prototype.proxy = Class.proxy;
  Class._create = Class.create;
  Class._init = Class.init;

  // Events
  var Events = Xiaoming.Events = {
    // events 的格式：'click mouseenter mouseleave...'
    // callback 为函数
    listenTo: function listenTo(events, callback) {
      var eventList = events.split(' ');
      var cbs = this._callbacks || (this._callbacks = {});

      for (var i = 0, len = eventList.length; i < len; i++) {
        (this._callbacks[eventList[i]] || (this._callbacks[eventList[i]] = [])).push(callback);
      }

      return this;
    },

    one: function one(events, callback) {
      this.listenTo(events, this.proxy(function () {
        this.stopListenTo(events, callback);
        callback.apply(this, arguments);
      }));
    },

    // 可通过额外的参数传递数据
    // a.trigger('click', record, 100)
    trigger: function trigger() {
      var args = Array.prototype.slice.call(arguments, 0);
      var event = args.shift();

      if (!this._callbacks || !this._callbacks[event]) return this;

      for (var i = 0, len = this._callbacks[event].length; i < len; i++) {
        this._callbacks[event][i].apply(this, args);
      }

      return this;
    },

    // event 参数为 "假值" 时，将注销所有事件
    // callback 同注册时的全等时，才可以注销（注意函数为引用类型）
    stopListenTo: function stopListenTo(event, callback) {
      if (!event) {
        this._callbacks = {};
        return this;
      }

      for (var i = 0, len = this._callbacks[event].length; i < len; i++) {
        if (callback === this._callbacks[i]) {
          list.splice(0, 1);
          break;
        }
      }

      return this;
    }
  };

  // Model
  var Model = Xiaoming.Model = Class.create();

  Model.extend(Events);
  Model.extend({
    // 初始化 model 的名字和属性
    setup: function setup(name, attrs) {
      var model = this._create();

      model.name = name || '';
      model.attributes = attrs || '';

      return model;
    },

    create: function create(attrs) {
      var record = this.init(attrs);
      record.save();
      return record;
    },

    update: function update(id, attrs) {
      this.find(id).load(attrs).save();
    },

    destroy: function destroy(id) {
      this.find(id).destroy();
    },

    created: function created() {
      // 初始化 records 和 attributes
      // 避免多个类共享同一个 records 或 attributes
      this.records = {};
      this.attributes = [];

      this.listenTo('create', this.proxy(function (record) {
        this.trigger('change', 'create', record);
      }));

      this.listenTo('update', this.proxy(function (record) {
        this.trigger('change', 'update', record);
      }));

      this.listenTo('destroy', this.proxy(function (record) {
        this.trigger('change', 'destroy', record);
      }));
    },

    refresh: function refresh(values) {
      this.records = {};

      for (var i = 0, len = values.length; i < len; i++) {
        var record = values[i];
        record.isNew = false;
        this.records[record.id] = record;
      }

      this.trigger('refresh');
    },

    find: function find(id) {
      var record = this.records[id];
      return record ? record.clone() : null;
    },

    sync: function sync(callback) {
      this.listenTo('change', callback);
    },

    fetch: function fetch(callback) {
      void (callback ? this.listenTo('fetch', callback) : this.trigger('fetch'));
    }
  });

  Model.include({
    isNew: true,

    init: function init(attrs) {
      if (!attrs) return;

      for (var attr in attrs) {
        this[attr] = attrs[attr];
      }
    },

    dup: function dup() {
      var record = this.parent.init(this.getAttr());
      record.isNew = this.isNew;
      return record;
    },

    equal: function equal(record) {
      return record && record.id === this.id && record.parent === this.parent;
    },

    load: function load(attrs) {
      for (var name in attrs) {
        this[name] = attrs[name];
      }
    },

    toJSON: function toJSON() {
      return this.getAttr();
    },

    getAttr: function getAttr() {
      var attrs = {};

      for (var i = 0, len = this.parent.attributes.length; i < len; i++) {
        attrs[this.parent.attributes[i]] = this[this.parent.attributes[i]];
      }

      attrs.id = this.id;
      return attrs;
    },

    updateAttr: function updateAttr(name, value) {
      this[name] = value;
      return this.save();
    },

    updateAttrs: function updateAttrs(attrs) {
      this.load(attrs);
      return this.save();
    },

    save: function save() {
      void (this.isNew ? this.create() : this.update());
      this.trigger('save', this);

      return this;
    },

    clone: function clone() {
      return Object.create(this);
    },

    create: function create() {
      if (!this.id) this.id = Xiaoming.guid();

      this.isNew = false;

      var records = this.parent.records;
      records[this.id] = this.dup();
      this.trigger('create', records[this.id].clone());
    },

    update: function update() {
      var records = this.parent.records;
      records[this.id].load(this.getAttr());
      this.trigger('update', records[this.id].clone());
    },

    destroy: function destroy() {
      delete this.parent.records[this.id];
      this.trigger('destroy', this);
    },

    // 实例的监听者事件是挂在构造器（parent）上的
    // 当触发事件时需要用 equal 方法比对参数的 record 和自己的 record 是否一致
    listenTo: function listenTo(events, callback) {
      return this.parent.listenTo(events, this.proxy(function (record) {
        if (record && this.equal(record)) callback.apply(this, arguments);
      }));
    },

    trigger: function trigger() {
      return this.parent.trigger.apply(this.parent, arguments);
    }
  });

  // Controller
  var Controller = Xiaoming.Controller = Class.create({
    initializer: function initializer(options) {
      var _this = this;

      this.options = options;

      for (var option in options) {
        this[option] = options[option];
      }

      this.el = Xiaoming.isElement(this.el) ? this.el : document.createElement(this.el);

      var events = this.events;

      // 绑定 "事件" 同 "视图"
      for (var i in events) {
        var item = i.split(' ');
        var event = item.shift();
        var element = item.pop();

        this.el.addEventListener(event, function (e) {
          if (e.target.tagName.toLowerCase() === element) _this[events[i]];
        });
      }
    }
  });

  Controller.include(Events);

  Xiaoming.Http = Class.create({
    initializer: function initializer() {
      this.xhr = new XMLHttpRequest();
    },

    create: function create(options) {
      var _this2 = this;

      if (!options.method || !options.url) throw new Error('Request method and url can\'t be empty');
      if (options.success && typeof options.success !== 'function') throw new Error('Resolve Callback has to be a function');
      if (options.fail && typeof options.fail !== 'function') throw new Error('Reject Callback has to be a function');

      var data = options.data || {};

      this.xhr.open(options.method, options.url);
      this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      if (options.dataType && options.dataType.toLowerCase() === 'json') {
        this.xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        this.xhr.setRequestHeader('Accept', 'application/json');
        data = JSON.stringify(data);
      }

      if (options.withCredentials) this.xhr.withCredentials = true;

      this.xhr.send(data);
      this.xhr.onreadystatechange = function () {
        if (+_this2.xhr.readyState === 4) {
          var raw;

          try {
            raw = JSON.parse(_this2.xhr.responseText);
          } catch (e) {
            if (options.dataType && options.dataType.toLowerCase() === 'json') console.error('Response type is not valid JSON');
            raw = _this2.xhr.responseText;
          }

          void (/^[1-3]/.test(+_this2.xhr.status) ? opitons.success && options.success(raw.body) : options.fail && options.fail(raw.body));
        }
      };
    },

    get: function get(options) {
      options.method = 'get';
      return this.create(options);
    },

    post: function post(options) {
      options.method = 'post';
      return this.create(options);
    },

    update: function update(options) {
      options.method = 'update';
      return this.create(options);
    },

    patch: function patch(options) {
      options.method = 'patch';
      return this.create(options);
    },

    'delete': function _delete(options) {
      options.method = 'delete';
      return this.create(options);
    }
  });

  Xiaoming.Http = Xiaoming.Http.init();

  window.Xiaoming = Xiaoming;
})();