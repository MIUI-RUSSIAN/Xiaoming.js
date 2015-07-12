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

  it('set $$phase to $digest while digest', function() {
    scope.id = 1;

    scope.$watch(
      function(scope) {
        scope.phaseInWatch = scope.$$phase;
        return scope.id;
      },
      function() {
        scope.phaseInListener = scope.$$phase;
      }
    );

    scope.$apply(function() {
      scope.phaseInApply = scope.$$phase;
    });

    expect(scope.phaseInWatch).toBe('$digest');
    expect(scope.phaseInListener).toBe('$digest');
    expect(scope.phaseInApply).toBe('$apply');
  });

  it('schedules a digest in $evalAsync', function(done) {
    scope.id = 1;
    scope.counter = 0;

    scope.$watch(
      function(scope) { return scope.id; },
      function() {
        scope.counter++;
      }
    );

    scope.$evalAsync(function(scope) {});

    expect(scope.counter).toBe(0);
    setTimeout(function() {
      expect(scope.counter).toBe(1);
      done();
    }, 50);
  });

  it('$applyAsync runs async', function(done) {
    scope.counter = 0;

    scope.$watch(
      function(scope) { return scope.id; },
      function() { scope.counter++; }
    );

    scope.$digest();

    expect(scope.counter).toBe(1);

    scope.$applyAsync(function() {
      scope.id = 1;
    });

    expect(scope.counter).toBe(1);

    setTimeout(function() {
      expect(scope.counter).toBe(2);
      done();
    }, 50);
  });

  it('never run $applyAsync function in same cycle', function(done) {
    scope.id = 1;
    scope.asyncApplied = false;

    scope.$watch(
      function(scope) { return scope.id; },
      function() {
        scope.$applyAsync(function(scope) {
          scope.asyncApplied = true;
        });
      }
    );

    scope.$digest();
    expect(scope.asyncApplied).toBe(false);
    setTimeout(function() {
      expect(scope.asyncApplied).toBe(true);
      done();
    }, 0);
  });

  it('batch calls to $applyAsync', function(done) {
    scope.counter = 0;

    scope.$watch(
      function() {
        scope.counter++;
        return scope.id;
      },
      function() {}
    );

    scope.$applyAsync(function(scope) {
      scope.id = 1;
    });
    scope.$applyAsync(function(scope) {
      scope.id = 2;
    });

    setTimeout(function() {
      expect(scope.counter).toBe(2);
      done();
    }, 50);
  });

  it('cancel and flush $applyAsync if digest', function(done) {
    scope.counter = 0;

    scope.$watch(
      function(scope) {
        scope.counter++;
        return scope.id;
      },
      function() {}
    );

    scope.$applyAsync(function(scope) {
      scope.id = 1;
    });

    scope.$applyAsync(function(scope) {
      scope.id = 2;
    });

    scope.$digest();

    expect(scope.counter).toBe(2);
    expect(scope.id).toBe(2);

    setTimeout(function() {
      expect(scope.counter).toBe(2);
      done();
    }, 50);
  });

  it('run $$postDigest after $digest', function() {
    scope.counter = 0;

    scope.$$postDigest(function() {
      scope.counter++;
    });

    scope.$digest();
    expect(scope.counter).toBe(1);

    scope.$digest();
    expect(scope.counter).toBe(1);
  });

  it('will not run $$postDigest during current $digest', function() {
    scope.id = 1;

    scope.$$postDigest(function() {
      scope.id = 2;
    });

    scope.$watch(
      function(scope) {
        return scope.id;
      },
      function(newValue) {
        scope.variable = newValue;
      }
    );

    scope.$digest();
    expect(scope.variable).toBe(1);

    scope.$digest();
    expect(scope.variable).toBe(2);
  });

  it('catch exception in watch function', function() {
    scope.id = 1;
    scope.counter = 0;

    scope.$watch(
      function(scope) { throw 'error'; },
      function() {
        scope.counter++;
      }
    );

    scope.$watch(
      function(scope) { return scope.id; },
      function() {
        scope.counter++;
      }
    );

    scope.$digest();
    expect(scope.counter).toBe(1);
  });

  it('catch exception in listener function', function() {
    scope.id = 1;
    scope.counter = 0;

    scope.$watch(
      function(scope) { return scope.id; },
      function() {
        throw 'error';
      }
    );

    scope.$watch(
      function(scope) { return scope.id },
      function() {
        scope.counter++;
      }
    );

    scope.$digest();
    expect(scope.counter).toBe(1);
  });

  it('catch exception in $evalAsync', function(done) {
    scope.id = 1;
    scope.counter = 0;

    scope.$watch(
      function(scope) { return scope.id; },
      function() {
        scope.counter++;
      }
    );

    scope.$evalAsync(function(scope) {
      throw 'error';
    });

    setTimeout(function() {
      expect(scope.counter).toBe(1);
      done();
    }, 0); 
  });

  it('catch exception in $applyAsync', function(done) {
    scope.counter = 0;

    scope.$applyAsync(function() {
      throw 'error';
    });

    scope.$applyAsync(function() {
      throw 'error';
    });

    scope.$applyAsync(function() {
      scope.counter++;
    });

    setTimeout(function() {
      expect(scope.counter).toBe(1);
      done();
    }, 0);
  });

  it('catch exception in $$postDigest', function() {
    scope.counter = 0;

    scope.$$postDigest(function() {
      throw 'error';
    });

    scope.$$postDigest(function() {
      scope.counter++;
    });

    scope.$digest();

    expect(scope.counter).toBe(1);
  });

  it('destroy a watch', function() {
    scope.id = 1;
    scope.counter = 0;

    var watcher = scope.$watch(
      function (scope) { return scope.id; },
      function() {
        scope.counter++;
      }
    );

    scope.$digest();
    expect(scope.counter).toBe(1);

    scope.id = 2;
    scope.$digest();
    expect(scope.counter).toBe(2);

    scope.id = 3;
    watcher();
    scope.$digest();
    expect(scope.counter).toBe(2);
  });

  it('destroy a watch during $digest', function() {
    scope.id = 1;

    var watchCalls = [];

    scope.$watch(
      function(scope) {
        watchCalls.push(1);
        return scope.id;
      }
    );

    var watcher = scope.$watch(
      function(scope) {
        watchCalls.push(2);
        watcher();
      }
    );

    scope.$watch(
      function(scope) {
        watchCalls.push(3);
        return scope.id;
      }
    );

    scope.$digest();
    expect(watchCalls).toEqual([1, 2, 3, 1, 3]);
  });

  it('allows a $watch destroy another watch during $digest', function() {
    scope.id = 1;
    scope.counter = 0;

    scope.$watch(
      function(scope) {
        return scope.id; 
      },
      function() {
        watcher(); 
      }   
    ) 

    var watcher = scope.$watch(
      function(scope) {},
      function() {}  
    );

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
  });


});






