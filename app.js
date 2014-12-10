var TodoModel = Xiaoming.Model.setup('todo', ['name', 'done']);

var todo = TodoModel.create({name: 'eat lunch'});

console.log(TodoModel)

var Todos = Xiaoming.Controller.create({
    el: '#view',

    template: function () {
        return juicer($('#todoTmpl').html());
    },

    render: function (data) {
        return this.template.render(data);
    },

    init: function () {
        TodoModel.listenTo('create', this.addOne);
    },

    events: {
        '.remove click': 'destory'
    },

    addOne: function (item) {
        console.log('aaa')
    },

    destory: function () {
        console.log('remove')
    }
});

Todos.init()