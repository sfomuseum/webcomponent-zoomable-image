# minify is https://github.com/tdewolff/minify

dist-all:
	@make dist-js
	@make dist-css

dist-js:
	minify --bundle \
		--output dist/zoomable.image.webcomponent.bundle.js \
		lib/leaflet.js \
		lib/leaflet-image.js \
		lib/leaflet.image.control.js \
		lib/leaflet.fullscreen.js \
		lib/leaflet-iiif.js \
		lib/FileSaver.min.js \
		src/zoomable.images.js \
		src/zoomable-image.js

dist-css:
	minify --bundle \
		--output dist/zoomable.image.webcomponent.bundle.css \
		lib/leaflet.css \
		lib/leaflet.fullscreen.css \
		lib/leaflet.image.control.css \
		src/zoomable.images.css
