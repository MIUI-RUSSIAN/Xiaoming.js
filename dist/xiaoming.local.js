"use strict";

void (function () {
  Xiaoming.Model.Local = {
    extended: function extended() {
      this.sync(this.proxy(this.setItem));
      this.fetch(this.proxy(this.getItem));
    },

    setItem: function setItem() {
      var item = JSON.stringify(this);
      localStorage.setItem(this.name, item);
    },

    getItem: function getItem() {
      var item = localStorage.getItem(this.name);
      if (!item) return;

      item = JSON.parse(item);
      this.refresh(item);
    }
  };
})();