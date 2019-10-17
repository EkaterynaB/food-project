import Search from './modules/Search';
import Recipe from './modules/Recipe';
import List from './modules/List';
import Likes from './modules/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesVliew';
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
			
			recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
			
		} catch (error) {
			console.log(error);
		}
	}
	
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
window.addEventListener('load', () => {
	state.likes = new Likes();
	
	// Restore likes
	state.likes.readStorage();
	//
	// // Toggle like menu button
	likesView.toggleLikeMenu(state.likes.getNumLikes());
	//
	// // Render the existing likes
	state.likes.likes.forEach(like => likesView.renderLike(like));
});

const controlList = () => {
	if (!state.list) state.list = new List();

	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient);
		listView.renderItem(item);
	})
};


const controlLike = () => {
	if (!state.likes) state.likes = new Likes();
	const currentID = state.recipe.id;
	
	if (!state.likes.isLiked(currentID)) {
		
		const newLike = state.likes.addLike(
			currentID,
			state.recipe.title,
			state.recipe.author,
			state.recipe.img
		);
		
		likesView.toggleLikeBtn(true);
		likesView.renderLike(newLike);
	} else {
		state.likes.deleteLike(currentID);
		
		likesView.toggleLikeBtn(false);
		
		likesView.deleteLike(currentID);
	}
	likesView.toggleLikeMenu(state.likes.getNumLikes());
};

elements.shopping.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;

	// Handle the delete button
	if (e.target.matches('.shopping__delete, .shopping__delete *')) {
		// Delete from state
		state.list.deleteItem(id);

		// Delete from UI
		listView.deleteItem(id);

		// Handle the count update
	} else if (e.target.matches('.shopping__count-value')) {
		const val = parseFloat(e.target.value, 10);
		state.list.updateCount(id, val);
	}
});

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
		controlList();
	} else if (e.target.matches('.recipe__love, .recipe__love *')) {
		// Like controller
		controlLike();
	}
	
});


