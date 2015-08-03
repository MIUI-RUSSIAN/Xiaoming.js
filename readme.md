## Xiaoming

> out-of-style mvc(seriously it's M & C) framework

### Xiaoming.Class

`create(include, extend)`

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| include | Object | 实例方法 |
| extend | Object | 构造函数方法 |

返回一个 Class 的新实例

``

`extend(options)`

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| options | Object | 实例方法 |

可以传入键为 extended 的函数, 将在 extend 完成后调用

`include(options)`

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| options | Object | 实例方法 |

可以传入键为 included 的函数, 将在 extend 完成后调用

`proxy(func)`

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| func | function | 需要显式设置作用域的函数 |

`func` 的作用域将被设置到当前的 this

### Xiaoming.Events

`listenTo(event, callback)`

`stopListenTo(event, callback)`

`trigger(event)`

`one(event, callback)`

### Xiaoming.Model

`setup(name, attrs)`

`create(attrs)`

`update(id, attrs)`

`destroy(id)`

`refresh()`

`find(id)`

`sync(callback)`

`fetch(callback)`

### Xiaomng.Controller

好像没有什么卵用，纯粹堆业务代码的地方

### Demos
[Demos](!http://klamtlne.github.io/Xiaoming.Examples/)
