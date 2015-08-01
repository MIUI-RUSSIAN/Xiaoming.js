~function (Xiaoming) {
	Xiaoming.Model.Local = {
		extended: function () {
			this.sync(this.proxy(this.setItem));
			this.fetch(this.proxy(this.getItem));
		},

		setItem: function () {
			var item = JSON.stringify(this);
			localStorage.setItem(this.name, item);
		},

		getItem: function () {
			var item = localStorage.getItem(this.name);
			if (!item) return;

			item = JSON.parse(item);
			this.refresh(item);
		}
	}
}(Xiaoming);