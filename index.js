'use strict';

const fs = require('fs');
const request = require('downcache');
const _async = require('async');
const jaaaaaaaaaaaade = require('jade');
const config = require('./config.json');
const util = require('util');
const mkdirp = require('mkdirp');

_async.series([
	(cb) => {
		_async.eachSeries(config.features.concat(config.plugins), (item, done) => {
			request('https://api.npmjs.org/downloads/point/last-month/' + item.package, (error, response, body) => {
				let data = JSON.parse(body);
				item.downloads = data.downloads
				done();
			});
		}, cb);
	},
	() => {
		const maxDownloads = Math.max(config.features.map(f => f.downloads));

		console.log('Downloads: ' + maxDownloads);

		const locals = {
			plugins: config.plugins.map(plugin => ({
				name: plugin.name,
				package: plugin.package,
				features: plugin
					.includedFeatures
					.map(included => config.features.find(f => f.package == included))
					.map(feature => Object.assign(feature, {
						percentage: Math.max((feature.downloads / maxDownloads) * 100)
					}))
			}))
		};

		const html = jaaaaaaaaaaaade.compileFile('./index.jade', { pretty: true })(locals);
		mkdirp('./build');
		fs.writeFileSync('./build/index.html', html, 'utf-8');

		//console.log(util.inspect(locals, {showHidden: false, depth: null}));
	}
]);
