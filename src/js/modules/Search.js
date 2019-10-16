import axios from 'axios';
import { KEY } from '../config';

export default class Search {
	constructor(query) {
		this.query = query;

	}
	async getResults() {
		try {
			const result = await axios.get(`https://www.food2fork.com/api/search?key=${KEY}&q=${this.query}`);
			this.results = result.data.recipes;

		} catch (error) {
			return error;
		}
	}
}
