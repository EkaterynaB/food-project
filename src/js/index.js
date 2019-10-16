import * as listView from "../../../final/src/js/views/listView";
import Search from './modules/Search';
import Recipe from './modules/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base'

/*
*  - Search
*  - Currentrecipe object
*  - Shopping list object
*  - Like recipes
* */
const state = {};

const controlSearch = async () => {
	const query = searchView.getInput();
	console.log(query);
	if (query) {
		state.search = new Search(query);

		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchRes);
		
		try {
			await state.search.getResults();
			clearLoader();
			searchView.renderResults(state.search.results);
		} catch (error) {
			console.log(error);
			clearLoader();
		}
	}
};

elements.searchForm.addEventListener('submit', event => {
	event.preventDefault();
	controlSearch();
});

elements.searchResPages.addEventListener('click', event => {
	
	const btn = event.target.closest('.btn-inline');
	if (btn) {
		const goToPage = parseInt(btn.dataset.goto, 10);
		searchView.clearResults();
		searchView.renderResults(state.search.results, goToPage);
	}
});

const controlRecipe = async () => {
	const id = window.location.hash.replace('#', '');
	
	if (id) {
		recipeView.clearRecipe();
		renderLoader(elements.recipe);
		
		if (state.search) searchView.highlightSelected(id);
		state.recipe = new Recipe(id);
		
		try {
			await state.recipe.getRecipe();
			state.recipe.parseIngredients();
			
			state.recipe.calcServings();
			state.recipe.calcTime();
			
			clearLoader();
			
			recipeView.renderRecipe(state.recipe);
		} catch (error) {
			console.log(error);
		}
	}
	
};

window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

elements.recipe.addEventListener('click', e => {
	if (e.target.matches('.btn-decrease, .btn-decrease *')) {
		// Decrease button is clicked
		if (state.recipe.servings > 1) {
			state.recipe.updateServings('dec');
			recipeView.updateServingsIngredients(state.recipe);
		}
	} else if (e.target.matches('.btn-increase, .btn-increase *')) {
		// Increase button is clicked
		state.recipe.updateServings('inc');
		recipeView.updateServingsIngredients(state.recipe);
	} else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
		// Add ingredients to shopping list
		// controlList();
	} else if (e.target.matches('.recipe__love, .recipe__love *')) {
		// Like controller
		// controlLike();
	}
	
});


