# minify is https://github.com/tdewolff/minify

dist-all:
	@make dist-js
	@make dist-css
	@make dist-wasm

dist-js:
	minify --bundle \
		--output dist/zoomable.image.webcomponent.bundle.js \
		lib/leaflet.js \
		lib/leaflet-image.js \
		lib/leaflet.image.control.js \
		lib/leaflet-iiif.js \
		lib/FileSaver.min.js \
		lib/sfomuseum.golang.wasm.bundle.js \
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

dist-wasm:
	cp src/update_exif.wasm dist/update_exif.wasm

# As in: https://github.com/aaronland/go-http-fileserver

debug:
	fileserver -root .
