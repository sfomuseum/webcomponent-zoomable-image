# webcomponent-zoomable-image

A Web Component to extend the HTML `picture` element to enable fullscreen, interactive, IIIF Level 0 "zoomable" image tiles.

## Documentation

Documentation is incomplete at this time. Consult the [www](www) folder for working examples.

Source files for the Web Components, and related CSS, are stored in the [src](src) folder. External libraries are kept in the [lib](lib) folder. Bundled distribution files are kept in the [dist](dist) folder and generated using the `dist-all` Makefile target (which depends on [minify](https://github.com/tdewolff/minify) being installed).

```
$> make dist-all
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
(11.81425ms, 187 kB, 166 kB,  88.6%,  16 MB/s) - (lib/leaflet.js + lib/leaflet-image.js + lib/leaflet.image.control.js + lib/leaflet.fullscreen.js + lib/leaflet-iiif.js + lib/FileSaver.min.js + src/zoomable.images.js + src/zoomable-image.js) to dist/zoomable.image.webcomponent.bundle.js
minify --bundle \
		--output dist/zoomable.image.webcomponent.bundle.css \
		lib/leaflet.css \
		lib/leaflet.fullscreen.css \
		lib/leaflet.image.control.css \
		src/zoomable.images.css
(757.625µs,  49 kB,  42 kB,  85.4%,  64 MB/s) - (lib/leaflet.css + lib/leaflet.fullscreen.css + lib/leaflet.image.control.css + src/zoomable.images.css) to dist/zoomable.image.webcomponent.bundle.css
```

## picture@is="zoomable-image"

Extend `picture` elements to behave like a `zoomable-image` component. This will decorate the `picture` element (and all its children) with markup to display a "fullscreen" button control that, when pressed, will display interactive IIIF Level 0 tiles in fullscreen mode.

### Attributes

| Name | Value | Required | Notes |
| --- | --- | --- | --- |
| is | "zoomable-image" | yes | Declares that the `picture` should behave like a `zoomable-image` Web Component |
| zoomable-image-id | string | yes | A unique identifier for the image. |
| zoomable-tiles-url | string | yes | The parent URI where IIIF (Level 0) tiles for the image are stored. |

```
<picture is="zoomable-image" zoomable-image-id="1729566517" zoomable-tiles-url="https://static.sfomuseum.org/media/172/956/651/7/tiles/">
    <img src="https://static.sfomuseum.org/media/172/956/651/7/1729566517_NCqPczZgLHRnZGn6W782an2aK1pOPg6I_c.jpg" />
</picture>

<template id="zoomable-image-template">
    <link rel="stylesheet" type="text/css" href="../../dist/zoomable.image.webcomponent.bundle.css" />	    	    
</template>

<script type="text/javascript" src="../../dist/zoomable.image.webcomponent.bundle.js"></script>
```

![](docs/images/zoomable-normal.png)

![](docs/images/zoomable-webcomponent.png)

![](docs/images/zoomable-fullscreen.png)

## See also

* https://leafletjs.com/
* https://github.com/Leaflet/Leaflet.fullscreen
* https://github.com/mejackreed/Leaflet-IIIF
* https://github.com/sfomuseum/leaflet-image-control
* https://github.com/mapbox/leaflet-image
* https://github.com/eligrey/FileSaver.js