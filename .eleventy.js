const { DateTime } = require('luxon');
const fs = require('fs');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function(eleventyConfig) {

  // Plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);

  // Merge mixed data sources (see https://is.gd/UgJsju)
  eleventyConfig.setDataDeepMerge(true);

  // Layouts
  eleventyConfig.addLayoutAlias('default', 'layouts/default.njk');
  eleventyConfig.addLayoutAlias('page', 'layouts/page.njk');
  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');
  eleventyConfig.addLayoutAlias('tags-page', 'layouts/tags-page.njk');

  eleventyConfig.addFilter('readableDate', dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('dd LLL yyyy');
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'cet'}).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Collections
  eleventyConfig.addCollection('tagList', require('./_11ty/getTagList'));

  // Copy static assets
  eleventyConfig.addPassthroughCopy('images');
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addPassthroughCopy('dist');

  // Markdown Plugins
  let markdownIt = require('markdown-it');
  let markdownItAnchor = require('markdown-it-anchor');
  let options = {
    html: true,
    breaks: true,
    linkify: true
  };
  let opts = {
    permalink: false,
  };

  eleventyConfig.setLibrary('md', markdownIt(options)
    .use(markdownItAnchor, opts)
  );

  return {
    templateFormats: [
      'md',
      'njk',
      'html',
      'liquid'
    ],

    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site'
    }
  };
};
