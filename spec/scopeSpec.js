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
});