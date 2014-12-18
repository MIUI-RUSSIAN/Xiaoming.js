var exports = this;

jQuery(function ($) {
    exports.Url = Xiaoming.Model.setup('url', ['short_url', 'long_url']);

    Url.include({
        fetchUrl: function () {
            if (!this.short_url) {
                $.bitly(this.long_url, this.proxy(function (result) {
                    this.updateAttr('short_url', result);
                }));
            }
        }
    });

    Url.listenTo('create', function (record) {
        record.fetchUrl();
    });

    exports.Urls = Xiaoming.Controller.create({
        init: function () {
            // this.item.listenTo('update', this.render);
            // this.item.listenTo('destroy', this.remove);
        },

        events: {
            'click .destroy': 'destroy'
        },

        template: function (urls) {
            return juicer($('#urlTpl').html(), urls);
        },

        render: function () {
            this.el.html(this.template(this.item));
            return this;
        },

        remove: function () {
            this.el.remove();
        },

        destroy: function () {
            this.item.destroy();
        }
    });

    exports.UrlsList = Xiaoming.Controller.create({
        init: function () {
            this.$items = $('#items');
            this.$form = $('form');
            this.$input = $('input');

            Url.listenTo('create', this.proxy(this.addOne));
            Url.listenTo('refresh', this.proxy(this.addAll));
        },

        addOne: function (url) {
            var view = Urls.init({item: url.toJSON()});
            this.$items.append(view.render().el);
        },

        events: {
            'form submit': 'create'
        },

        create: function (e) {
            e.preventDefault();

            var longUrl = this.$input.val().trim();

            if (!longUrl) return;

            Url.create({long_url: longUrl});

            this.$input.val('').focus();
        }
    });

    exports.App = Xiaoming.Controller.create({
        el: $('body'),

        init: function () {
            UrlsList.init({el: $('#view')});
        }
    });

    App.init()
});

