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
		lib/leaflet-iiif.js \
		lib/FileSaver.min.js \
		src/zoomable.leaflet.fullscreen.js \
		src/zoomable.images.js \
		src/zoomable-image.js \
		src/zoomable-image-carousel.js

dist-css:
	minify --bundle \
		--output dist/zoomable.image.webcomponent.bundle.css \
		lib/leaflet.css \
		lib/leaflet.fullscreen.css \
		lib/leaflet.image.control.css \
		src/zoomable.images.css \
		src/zoomable.carousel.css

# As in: https://github.com/aaronland/go-http-fileserver

debug:
	fileserver -root .
