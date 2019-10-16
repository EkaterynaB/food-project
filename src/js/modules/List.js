import uniqid from 'uniqid';

export default class List {
	constructor() {
		this.items = [];
	}
	
	addItem (count, unit, ingredient) {
		const item = {
			count,
			unit,
			ingredient,
			id: uniqid()
		};
		this.items.push(item);
	}
	
	deleteItem(id) {
		const index = this.items.findIndex(el => el.id === id);
		this.items.splice(index, 1);
	}
	
	updateCount(id, newCount) {
	
	}
}
