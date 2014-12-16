var exports = this;

~function ($) {
    var Xiaoming = {};

    // 生成随机的guid
    Xiaoming.guid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        }).toUpperCase();
    }

    var Class = Xiaoming.Class = {
        inherited: function () {},
        created: function () {},

        prototype: {
            initializer: function () {},
            init: function () {}
        },

        create: function (include, extend) {
            var klass;

            // 兼容 IE9 以下
            if (Object.create) {
                klass = Object.create(this)
            } else {
                function f() {};
                f.prototype = this;
                klass = new f();
            }

            klass.parent = this;
            klass.prototype = klass.fn = Object.create(this.prototype);

            if (include) klass.include(include);
            if (extend) klass.extend(extend);

            klass.created();
            this.inherited(klass);

            return klass;
        },

        // 生成实例
        init: function () {
            var instance;

            if (Object.create) {
                instance = Object.create(this.prototype);
            } else {
                function f() {};
                f.prototype = this.prototype;
                instance = new f();
            }

            instance.parent = this;
            instance.initializer.apply(instance, arguments);
            instance.init.apply(instance, arguments);

            return instance;
        },

        // 为实例添加方法
        include: function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) this.fn[key] = obj[key];
            }

            if (obj.included) obj.included.apply(this);

            return this;
        },

        // 为构造函数添加方法
        extend: function (obj) {
            for (var key in obj)
                if (obj.hasOwnProperty(key)) this[key] = obj[key];

            if (obj.extended) obj.extended.apply(this);

            return this;
        },

        proxy: function (func) {
            var self = this;

            return (function () {
                return func.apply(self, arguments);
            });
        }
    }

    Class.prototype.proxy = Class.proxy;
    Class._create = Class.create;
    Class._init = Class.init;

    // Events
    var Events = Xiaoming.Events = {
        listenTo: function (events, callback) {
            var eventList = events.split(' ');
            var cbs = this._callbacks || (this._callbacks = {});

            for (var i = 0, len = eventList.length; i < len; i++)
                (this._callbacks[eventList[i]] || (this._callbacks[eventList[i]] = [])).push(callback);

            return this;
        },

        trigger: function () {
            var args = Array.prototype.slice.call(arguments, 0);
            var event = args.shift();
            
            if (!this._callbacks || !this._callbacks[event]) return this;

            for (var i = 0, len = this._callbacks[event].length; i < len; i++) {
                this._callbacks[event][i].apply(this, args);
            }

            return this;
        },

        stopListenTo: function (event, callback) {
            if (!event) 
                this._callbacks = {};
                return this;

            for (var i = 0, len = this._callbacks[event].length; i < len; i++)
                if (callback === this._callbacks[i]) {
                    list.splice(0, 1);
                    break;
                }

            return this;
        }
    }

    // Model
    var Model = Xiaoming.Model = Class.create();

    Model.extend(Events);
    Model.extend({
        setup: function (name, attrs) {
            var model = Model._create();

            model.name = name || '';
            model.attributes = attrs || '';

            return model;
        },

        create: function (attrs) {
            var record = this.init(attrs);
            record.save();
            return record;
        },

        update: function (id, attrs) {
            this.find(id).load(attrs).save();
        },

        destroy: function (id) {
            this.find(id).destroy();
        },

        created: function () {
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

        find: function (id) {
            var record = this.records[id];

            return (record ? record.clone() : null);
        }
    });

    Model.include({
        isNew: true,

        init: function (attrs) {
            if (!attrs) return;

            for (var attr in attrs)
                this[attr] = attrs[attr];
        },

        dup: function () {
            var result = this.parent.init(this.getAttr());
            result.isNew = this.isNew;
            return result;
        },

        load: function (attrs) {
            for (var name in attrs)
                this[name] = attrs[name];
        },

        toJSON: function () {
            return this.getAttr();
        },

        getAttr: function () {
            var attrs = {};

            for (var i = 0, len = this.parent.attributes.length; i < len; i++) {
                attrs[this.parent.attributes[i]] = this[this.parent.attributes[i]]
            }

            attrs.id = this.id;
            return attrs;
        },

        updateAttr: function (name, value) {
            this[name] = value;
            return this.save();
        },

        updateAttrs: function (attrs) {
            this.load(attrs);
            return this.save();
        },

        save: function () {
            this.isNew ? this.create() : this.update();
            this.trigger('save', this);

            return this;
        },

        clone: function () {
            if (Object.create) {
                klass = Object.create(this)
            } else {
                function f() {};
                f.prototype = this;
                klass = new f();
            }

            return klass;
        },

        create: function () {
            if (!this.id) this.id = Xiaoming.guid();

            var records = this.parent.records;
            records[this.id] = this.dup();

            this.isNew = false;
            this.trigger('create', records[this.id].clone());
        },

        destroy: function () {
            this.parent.destroy(this.id);
            this.trigger('destroy', this);
        },

        listenTo: function (events, callback) {
            return this.parent.listenTo(events, this.proxy(function (record) {
                callback.apply(this, arguments);
            }));
        },

        trigger: function () {
            return this.parent.trigger.apply(this.parent, arguments);
        }
    });

    // Controller
    var Controller = Xiaoming.Controller = Class.create({
        initializer: function (options) {
            this.options = options;

            for (var option in options) {
                this[option] = options[option];
            }

            this.el = this.el || document.createElement('div');
            this.el = $(this.el);

            var events = this.events;

            // 绑定 "事件" 同 "视图"
            for (var i in events) {
                if (events.hasOwnProperty(i)) {
                    var item = i.split(' ');
                    var element = item.shift();
                    var event = item.pop();

                    this.el.on(event, element, this.proxy(this[events[i]]))
                }
            }
        }
    });

    Controller.include(Events);

    exports.Xiaoming = Xiaoming;
}(jQuery);

