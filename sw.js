var CACHE_NAME = 'seeing-theory-v1';

// Paths are relative to sw.js (which lives at the site root)
var ASSETS_TO_CACHE = [
    './',
    './index.html',
    './cn.html',
    './es.html',
    './manifest.json',
    './css/chapter-style.css',
    './css/home.css',
    './css/jquery.fullpage.css',
    './css/jquery-ui.css',
    './css/jssocials.css',
    './css/jssocials-theme-flat.css',
    './js/chapter.js',
    './js/d3.min.js',
    './js/jstat.min.js',
    './js/d3.tip.v0.6.3.js',
    './js/home.js',
    './js/jquery.fullpage.js',
    './img/favicon.png',
    './img/icons/icon-192.png',
    './img/icons/icon-512.png',
    './img/button/bottom-arrow.svg',
    // Chapter pages
    './basic-probability/index.html',
    './basic-probability/cn.html',
    './basic-probability/es.html',
    './basic-probability/basic-probability.css',
    './basic-probability/basic-probability.js',
    './compound-probability/index.html',
    './compound-probability/cn.html',
    './compound-probability/es.html',
    './compound-probability/compound-probability.css',
    './compound-probability/compound-probability.js',
    './probability-distributions/index.html',
    './probability-distributions/cn.html',
    './probability-distributions/es.html',
    './probability-distributions/distributions.css',
    './probability-distributions/distributions.js',
    './bayesian-inference/index.html',
    './bayesian-inference/cn.html',
    './bayesian-inference/es.html',
    './bayesian-inference/bayesian-inference.css',
    './bayesian-inference/bayesian-inference.js',
    './frequentist-inference/index.html',
    './frequentist-inference/cn.html',
    './frequentist-inference/es.html',
    './frequentist-inference/frequentist-inference.css',
    './frequentist-inference/frequentist-inference.js',
    './regression-analysis/index.html',
    './regression-analysis/cn.html',
    './regression-analysis/es.html',
    './regression-analysis/regression.css',
    './regression-analysis/regression.js',
    './regression-analysis/data/iris.csv',
    './regression-analysis/data/anscombe.csv',
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(function(url) {
                    return cache.add(new Request(url, { cache: 'reload' }))
                        .catch(function() { /* ignore missing files */ });
                })
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) { return key !== CACHE_NAME; })
                    .map(function(key) { return caches.delete(key); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    var url = new URL(event.request.url);

    // Skip cross-origin requests (CDN fonts, MathJax, jQuery CDN)
    if (url.origin !== location.origin) return;

    event.respondWith(
        caches.match(event.request).then(function(cached) {
            if (cached) return cached;

            return fetch(event.request).then(function(response) {
                if (event.request.method === 'GET' && response.status === 200) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            }).catch(function() {
                if (event.request.headers.get('accept') &&
                    event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
