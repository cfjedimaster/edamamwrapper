
const axios = require('axios');


function recipeSearch(args) {


	/*
	Do basic validation on the search for our minimum required args: query, app_id, and app_key 
	*/
	if(!args.query || !args.app_id || !args.app_key) {
		throw('Search requires the query, app_id, and app_key arguments.');
	}

	// Construct our query based on the various search options
	let url = `https://api.edamam.com/search?app_id=${args.app_id}&app_key=${args.app_key}&q=${encodeURIComponent(args.query)}`;

	if(!args.start) args.start = 0;
	url += `&from=${args.start}`;

	// Support either a max (i want 99 results!) or to (im passing start and go to TO)
	if(args.max) {
		url += `&to=${args.start+args.max}`;
	} else if(args.to) {
		url += `&to=${args.to}`;
	}

	//max_ingredients lets you ask for simpler recipes
	if(args.max_ingredients) url += `&ingr=${args.max_ingredients}`;

	//diet and health are enums but too many to validate here so we'll let the back end handle it
	if(args.diet) url += `&diet=${args.diet}`;
	if(args.health) url += `&health=${args.health}`;

	// calories are of the form: X+ (min of X), X-Y, or Y (max of X)
	if(!args.min_calories) args.min_calories = 0;
	if(args.max_calories) {
		url += `&calories=${args.min_calories}-${args.max_calories}`;
	} else {
		url += `&calories=${args.min_calories}`+encodeURIComponent('+');
	}

	// time is of the form: X+ (min of X), X-Y, or Y (max of X)
	if(!args.min_time) args.min_time = 0;
	if(args.max_time) {
		url += `&time=${args.min_time}-${args.max_time}`;
	} else {
		url += `&time=${args.min_time}`+encodeURIComponent('+');
	}

	if(args.excluded) {
		args.excluded.forEach(i => url += '&excluded='+encodeURIComponent(i));
	}

	return new Promise((resolve, reject) => {

		axios.get(url)
		.then(res => {

			let recipes = res.data.hits.map(r => r.recipe);
			let result = {
				count: res.data.count,
				results: recipes,
				from: res.data.from, 
				to: res.data.to, 
				more: res.data.more
			};

			resolve(result);
		}).catch(e => {
			reject(`API returned error status code ${e.response.status}. Access the full response at ${url}.`);
		});

	});

}

module.exports = {
	recipeSearch
};