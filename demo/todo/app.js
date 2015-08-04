var exports = this;

  var TodoModel = Xiaoming.Model.setup('todo', ['content', 'done']);

  exports.Todos = Xiaoming.Controller.create({
    init: function () {
      this.item.listenTo('destroy', this.proxy(this.remove));
    },

    events: {
      'click .remove': 'destroy'
    },

    template: function (data) {
      return juicer(document.getElementById('todo-tmpl').innerHTML, data);
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

  exports.TodoList = Xiaoming.Controller.create({
    init: function () {
      this.$items = document.querySelectorAll('.items');
      this.$input = document.querySelectorAll('.input');

      TodoModel.listenTo('create', this.proxy(this.addOne))
    },

    events: {
      'submit form': 'create'
    },

    create: function (e) {
      e.preventDefault();

      var content = this.$input.val().trim();

      if (!content) return;

      TodoModel.create({content: content, done: false});

      this.$input.setAttribute('value', '');
    },

    addOne: function (record) {
      var view = Todos.init({item: record});
      this.$items.append(view.render().el);
    }
  });

  exports.App = Xiaoming.Controller.create({
    el: 'body',
    init: function () {
      TodoList.init({el: '#view'});
    }
  });

  App.init();
