var TodoModel = Xiaoming.Model.setup('todo', ['name', 'done']);

var Todos = Xiaoming.Controller.create({
    el: '#view',

    template: function () {
        return juicer($('#todoTmpl').html());
    },

    render: function (data) {
        return this.template().render(data);
    },

    init: function () {
        this.$list = $('.items');
        this.$input = $('#todoName');

        TodoModel.listenTo('create', this.proxy(this.addOne));
        TodoModel.listenTo('destory', this.proxy(this.destory));
    },

    create: function () {
        var name = this.$input.val().trim();
        var newTodo = {name: name, done: false};

        TodoModel.create(newTodo);
    },

    destory: function (item) {
        console.log(this)
    },

    events: {
        '.create click': 'create',
        '.remove click': 'destory'
    },

    addOne: function (item) {
        var $view = this.render(item);
        this.$list.append($view);
    },
});

Todos.init()

var todo = TodoModel.create({name: 'eat lunch', done: false});