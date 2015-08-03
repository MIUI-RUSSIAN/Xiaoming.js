# Promsie

## 方法

+ Promise(resolver)

`Promise` 构造函数接受一个 `resolver{function}` ，resolver 会获得两个参数：resolve 和 reject，用法如下

```javascript
  Promise(function(resolve, reject) {
    resolve('123');
  }).then(function(value) {
    assert.equal(value, '123');
  });
```

+ Promise.defer

创建一个 defer 对象，具有两个方法：resolve 和 reject，可以通过返回 promise 属性供后面的流程使用

```javascript
  var deferred = Promise.defer();

  deferred.resolve(123);
  deferred.promise.then(function(value) {
    assert.equal(value, 123);
  });
```

+ Promise.all

传入一个由 promise 组成的数组，当数组内所有 promise 执行完后，会创建一个按 promise 索引排列的 value 数组。如果任何一个 promise 执行的过程中出错，会立刻中断后面的 promise，onRejected 函数的参数是 被 reject 的 promise 的 reason

```javascript
  Promise.all([promise1, promise2, promise3]).then(function(values) {
    // handle success
  }, function(reason) {
    // handle error
  });
```

+ Promise.when

传入一个由 promise 组成的数组，数组内第一个 promise 执行完后，会调用 onFufilled 函数(余下的 promise 依然会继续执行)。任何一个 promsie 执行过程中出错都会调用 onRejected 函数，参数是被 reject 的 promise 的 reason

```javascript
  Promise.when([promise1, promise2, promise3]).then(function(value) {
    // handle success
  }, function(reason) {
    // handle error
  });
```

+ promise.then

```javascript
  promise.then(function(value) {
    // handle success
  }, function(reason) {
    // handle error
  });
```

+ promise.success

```javascript
  promise.success(function(value) {
    // handle success
  });
```

+ promise.fail

```javascript
  promsie.fail(function(reason) {
    // handle error
  });
```

+ promise.done

```javascript
  promise.done(function(result) {
    // handle whatever success or error
  });
```
