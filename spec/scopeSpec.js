'use strict';

var Scope = require('./../scope');

describe('Behave like an object', function() {
  var scope = new Scope();
  scope.$id = 1;

  it('should return 1', function() {
    expect(scope.$id).toBe(1);
  });
}); 

describe('digest', function() {
  var scope;

  beforeEach(function() {
    scope = new Scope();
  });

  it('call listener when digest', function() {
    var watchFn = function() {
      return 1;
    };
    var listenerFn = jasmine.createSpy();

    scope.$watch(watchFn, listenerFn);
    scope.$digest();

    expect(listenerFn).toHaveBeenCalled();
  });

  it('call watch function with scope as argument', function() {
    var watchFn = jasmine.createSpy();
    var listenerFn = function() {};

    scope.$watch(watchFn, listenerFn);
    scope.$digest();

    expect(watchFn).toHaveBeenCalledWith(scope);
  });

  it('calls the listener function when the watched value change', function() {
    scope.id = 1;
    scope.counter = 0;

    scope.$watch(
      function(scope) { return scope.id; },
      function(newValue, oldValue, scope) { scope.counter++ }
    );

    expect(scope.counter).toBe(0);

    // 至少执行一次
    scope.$digest();
    expect(scope.counter).toBe(1);

    scope.$digest();
    expect(scope.counter).toBe(1);

    scope.id = 2;
    scope.$digest();
    expect(scope.counter).toBe(2);
  });

  it('calls listener with new value as old value first time', function() {
    scope.id = 1;
    var old;

    scope.$watch(
      function(scope) { return scope.id },
      function(newValue, oldValue, scope) { old = oldValue }
    );

    scope.$digest();
    expect(old).toBe(1);
  });

  it('triggers digest while dirty', function() {
    scope.name = 'klam';

    scope.$watch(
      function(scope) { return scope.nameUpper },
      function(newValue, oldValue, scope) {
        if (newValue) {
          scope.initial = newValue.substring(0, 1) + '.';
        }
      }
    );

    scope.$watch(
      function(scope) { return scope.name },
      function(newValue, oldValue, scope) {
        if (newValue) {
          scope.nameUpper = newValue.toUpperCase();
        }
      }
    );

    scope.$digest();
    expect(scope.initial).toBe('K.');

    scope.name = 'gold';
    scope.$digest();
    expect(scope.initial).toBe('G.');
  });

  it('give up watches after 10 iterations', function() {
    scope.a = 0;
    scope.b = 0;

    scope.$watch(
      function(scope) { return scope.a },
      function(newValue, oldValue, scope) {
        scope.b++;
      }
    );

    scope.$watch(
      function(scope) { return scope.b },
      function(newValue, oldValue, scope) {
        scope.a++;
      }
    );

    expect(function() {
      $scope.$digest()
    }).toThrow();
  });

  it('ends digest when last watch is clean', function() {
    scope.array = [1, 2, 3, 4, 5, 6, 7, 8];

    var watchExecutions = 0;

    scope.array.forEach(function(num, index) {
      scope.$watch(
        function(scope) {
          watchExecutions++;
          return scope.array[index];
        },
        function() {}
      );
    });

    scope.$digest();
    expect(watchExecutions).toBe(16);

    scope.array[0] = 9;
    scope.$digest();
    expect(watchExecutions).toBe(25);
  });

  it('does not end digest so that new watches wouldn\'t run', function() {
    scope.id = 1;
    scope.counter = 0;

    scope.$watch(
      function(scope) { return scope.id; },
      function(newValue, oldValue, scope) {
        scope.$watch(
          function(scope) { return scope.id },
          function(newValue, oldValue, scope) {
            scope.counter++;
          }
        );
      }
    );

    scope.$digest();
    expect(scope.counter).toBe(1);
  });

  it('compares based on value if enabled', function() {
    scope.values = [1, 2, 3];
    scope.counter = 0;

    scope.$watch(
      function(scope) { return scope.values },
      function(newValue, oldValue, scope) {
        scope.counter++;
      },
      true
    );

    scope.$digest();
    expect(scope.counter).toBe(1);

    scope.values.push(4);
    scope.$digest();
    expect(scope.counter).toBe(2);
  });

  it('handle NAN', function() {
    scope.number = 0/0;
    scope.counter = 0;

    scope.$watch(
      function(scope) { return scope.number; },
      function(newValue, oldValue, scope) {
        scope.counter++;
      }
    );

    scope.$digest();
    expect(scope.counter).toBe(1);

    scope.$digest();
    expect(scope.counter).toBe(1);
  });

  it('execute $eval function and return value', function() {
    scope.id = 1;

    var result = scope.$eval(function(scope) {
      return scope.id;
    });

    expect(result).toBe(1);
  });

  it('pass $eval second paramater', function() {
    scope.id = 1;

    var result = scope.$eval(function(scope, arg) {
      return scope.id + arg;
    }, 2);

    expect(result).toBe(3);
  });

  it('execute $apply function', function() {
    scope.id = 1;
    scope.counter = 0;

    scope.$watch(
      function() {
        return scope.id;
      },
      function() {
        scope.counter++;
      }
    );

    scope.$digest();
    expect(scope.counter).toBe(1);

    scope.$apply(function() {
      scope.id = 2;
    });
    expect(scope.counter).toBe(2);
  });

  it('evalAsync function', function() {
    scope.id = 1;
    scope.async = false;
    scope.immediate = false;

    scope.$watch(
      function(scope) { return scope.id; },
      function() {
        scope.$evalAsync(function() {
          scope.async = true;
        });
        scope.immediate = scope.async;
      }
    );

    scope.$digest();
    expect(scope.immediate).toBe(false);
    expect(scope.async).toBe(true);
  });

  it('execute evalAsync function in watch', function() {
    scope.isAsync = false;
    scope.id = 1;

    scope.$watch(
      function() {
        if (!scope.isAsync) {
          scope.$evalAsync(function(scope) {
            scope.isAsync = true;
          });
        }

        return scope.id;
      },
      function() {}
    );

    scope.$digest();

    expect(scope.isAsync).toBe(true);
  });

  it('execute evalAsync event not dirty', function() {
    scope.id = 1;
    scope.counter = 0;

    scope.$watch(
      function() {
        if (scope.counter < 2) {
          scope.$evalAsync(function() {
            scope.counter++;
          });
        }

        return scope.id;
      },
      function() {}
    );

    scope.$digest();

    expect(scope.counter).toBe(2);
  });

  it('prevent infinite evalAsync', function() {
    scope.id = 1;

    scope.$watch(
      function(scope) {
        scope.$evalAsync(function(scope) {});
        return scope.id;
      },
      function() {}
    );

    expect(function() { scope.$digest() }).toThrow();
  });
});






