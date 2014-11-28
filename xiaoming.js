var exports = this;

~function ($) {
    var Xiaoming = {};

    var Class = Xiaoming.Class = {
        create: function (attrs) {
            var klass;

            if (Object.create) {
                klass = Object.create(this)
            } else {
                function f() {};
                f.prototype = this;
                klass = new f();
            }

            if (attrs) klass.attrs = attrs;

            return klass;
        },

        include: function (obj) {
            for (var key in obj)
                if (obj.hasOwnProperty(key)) this.fn[key] = obj[key];

            return this;
        },

        extend: function (obj) {
            for (var key in obj)
                if (obj.hasOwnProperty(key)) this[key] = obj[key];

            return this;
        },

        proxy: function (func) {
            var self = this;

            return (function () {
                return func.apply(self, arguments);
            });
        }
    }

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

            for (var i = 0, len = this._callbacks[event]; i < len; i++)
                this._callbacks[event].apply(this, args);

            return this;
        }
    }

    var Model = Xiaoming.Model = Class.create();

    Model.extend(Events);

    exports.Xiaoming = Xiaoming;
}(jQuery);

