Xiaoming.query = (selector) => {
  if (typeof selector !== 'string') return new Error('Selector has to be string');

  var dom;

  // id 选择器
  if (/^#/.test(selector)) {
    dom = document.getElementById(selector.replace(/^#/, ''));
  // class 选择器
  } else if (/^\./.test(selector)) {
    dom = document.getElementsByClassName(selector.replace(/^\./, ''));
  // 标签选择器
  } else {
    dom = document.getElementsByTagName(selector);
  }

  return Xiaoming.Element.create(null, {
    dom: dom
  });
};

Xiaoming.Element = Xiaoming.Class.create();

Xiaoming.Element.extend(Xiaoming.Events);

Xiaoming.Element.include({
  on: function(event, callback, data) {
    var self = this;

    this.listenTo(event, callback, data);
    void (this.dom.length ?
      Array.prototype.slice.call(this.dom).forEach(function(element) {
        element.addEventListener(event, function() {
          self.trigger(event, data);
        });
      }) :
      this.dom.addEventListener(event, this.proxy(this.trigger(event))));
  },

  off: function(event, callback) {
    var self = this;

    this.stopListenTo(event, callback);
    void (this.dom.length ?
      Array.prototype.slice.call(this.dom).forEach(function(element) {
        // TODO: 坑啊，回调函数要用具名函数
        element.removeEventListener(event);
      }) :
      this.dom.removeEventListener(event, this.proxy(this.trigger(event))));
  }
});
