(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['leaflet'], factory);
    } else if (typeof module !== 'undefined') {
        // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
        // Browser globals
        if (typeof window.L === 'undefined') {
            throw new Error('Leaflet must be loaded first');
        }
        factory(window.L);
    }
}(function (L) {

    L.Control.Image = L.Control.extend({
        options: {
            position: 'topright',
	    on_success: function(map, canvas) {
	    
		var dt = new Date();
		var iso = dt.toISOString();
		var iso = iso.split('T');
		var ymd = iso[0];
		ymd = ymd.replace("-", "", "g");
		
		var bounds = map.getPixelBounds();
		var zoom = map.getZoom();
	    
		var pos = [
		    bounds.min.x,
		    bounds.min.y,
		    bounds.max.x,
		    bounds.max.y,
		    zoom
		];
		
		pos = pos.join("-");
		
		var name = ymd + "-" + pos + ".png";

    		canvas.toBlob(function(blob) {
    		    saveAs(blob, name);
		});
	    },
	    on_error: function(err){
		console.log(err);
	    },
        },

	onAdd: function (map) {

            var container = L.DomUtil.create('div', 'leaflet-control-image leaflet-bar leaflet-control');

            var link = L.DomUtil.create('a', 'leaflet-control-image-button leaflet-bar-part', container);
            link.href = '#';
	    
	    var icon= L.DomUtil.create('div', 'leaflet-control-image-icon', link);

	    var spinner_wrapper = L.DomUtil.create('div', 'leaflet-control-image-spinner-wrapper', link);
	    var spinner = L.DomUtil.create('div', 'leaflet-control-image-spinner', spinner_wrapper);

	    this.link = link;
	    this.icon = icon;
	    this.spinner = spinner_wrapper;

	    this._map = map;

            L.DomEvent.on(this.link, 'click', this._click, this);
	    return container;
	},

	onRemove: function(map) {
	    // 
	},

	_click: function (e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            this._renderImage();
        },

	_renderImage: function(){

	    var map = this._map;
	    var on_success = this.options.on_success;
	    var on_error = this.options.on_error;

	    var _icon = this.icon;
	    var _spinner = this.spinner;

	    _icon.style.display = "none";
	    _spinner.style.display = "block";

	    leafletImage(map, function(err, canvas){
		
		_icon.style.display = "block";
		_spinner.style.display = "none";

		if (err){
		    on_error(err);
		} else {
		    on_success(map, canvas);
		}
	    });
	},
    });

}));


	
