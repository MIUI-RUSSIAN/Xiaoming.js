var Model = Xiaoming.Model.setup('TodoModel', ['content', 'done']);

Model.fetch(function() {
  [{content: 123, done: false}].forEach(function(todo) {
    Model.create(todo);
  });
});

var Todos = Xiaoming.Controller.create({
  el: 'li',
  template: function(data) {
    return juicer(document.getElementById('tmpl-todo').innerHTML, data);
  },
  render: function() {
    this.el.innerHTML = this.template(this.item);
    return this;
  }
});

var TodoList = Xiaoming.Controller.create({
  el: document.getElementsByClassName('todo-list')[0],
  init: function() {
    Model.listenTo('create', this.proxy(this.addOne));
    Model.fetch();
  },
  addOne: function(todo) {
    var view = Todos.init({item: todo});
    this.el.appendChild(view.render().el);
  }
});

TodoList.init();
