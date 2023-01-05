const pluginRss = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const sanitizeHtml = require('sanitize-html');

module.exports = eleventyConfig => {
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(syntaxHighlight);
	eleventyConfig.addPassthroughCopy('./src/blog/css/*.css');
	
	eleventyConfig.addShortcode('excerpt', post => extractExcerpt(post));

	function extractExcerpt(post) {
		if(!post.templateContent) return '...';
		if(post.templateContent.length > 150) {
			return sanitizeHtml(post.templateContent.substring(0, 150).trimEnd(), {
				allowedTags: [],
				allowedAttributes: {}
			}) + '...';
		}
		return post.templateContent;
	}

	eleventyConfig.addCollection("categories", function(collectionApi) {
		let allCategories = new Set();
		let posts = collectionApi.getFilteredByTag('post');
		posts.forEach(p => {
			let categories = p.data.categories;
			categories.forEach(c => allCategories.add(c));
		});
		return Array.from(allCategories);
	});

	const english = new Intl.DateTimeFormat('en');
	eleventyConfig.addFilter("niceDate", function(d) {
		return english.format(d);
	});


	eleventyConfig.addFilter("filterByCategory", function(posts, category) {
		/*
		case matters, so let's lowercase the desired category, cat
		and we will lowercase our posts categories
		*/
		category = category.toLowerCase();
		let result = posts.filter(p => {
			let categories = p.data.categories.map(s => s.toLowerCase());
			return categories.includes(category);
		});
		return result;
	});

	return {
		dir: {
			input: 'src'
		},
		passthroughFileCopy: true,
		markdownTemplateEngine: "md"
	}
};
