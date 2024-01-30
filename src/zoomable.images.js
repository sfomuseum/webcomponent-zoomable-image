var zoomable = zoomable || {}

zoomable.images = (function(){

    var map;
    var _id;	// for the window.resize event below

    var has_iiif;
    var iiif_quality = 'default';

    // Local variable referencing document root which might
    // be 'document' or a Web Component 'shadowRoot'.
    
    var document_root;
    
    var self = {
	
	'available_width': function(){
	    
	    var containers = self.document_root.querySelectorAll(".zoomable-image");	    
	    var container = containers[0];
	    
	    return container.offsetWidth;
	},
        
	'available_height': function() {
	    
	    var navbars = self.document_root.querySelectorAll(".navbar");	    
	    var count = navbars.length;
	    
	    var h = 0;
	    
	    for (var i=0; i < count; i++){
		h += navbars[i].offsetHeight;
	    }
	    
	    return window.innerHeight - (h * 1.75);
	},
	
	'resize_visible': function(){

	    var ot = self.document_root.querySelectorAll(".zoomable-image");
	    
	    if ((! ot) || (ot.length == 0)){
		return;
	    }
	
	    ot = ot[0];
	    
	    var id = ot.getAttribute("zoomable-image-id");
	    
	    if (! id){
		return;
	    }
	    
	    var picture_id = "#zoomable-picture-" +id;
	    var img_id = "#zoomable-picture-default-" +id;		
	    var tiles_id = "#zoomable-tiles-" +id;
	    var map_id = "#zoomable-map-" +id;	
	    
	    var picture_el = self.document_root.querySelector(picture_id);
	    var img_el = self.document_root.querySelector(img_id);		
	    var tiles_el = self.document_root.querySelector(tiles_id);
	    var map_el = self.document_root.querySelector(map_id);	
	    
	    if ((! picture_el) || (! img_el) || (! tiles_el)){
		return;
	    }
	    
	    var w = self.available_width();
	    var h = self.available_height();
	    
	    var max_w = w;
	    var max_h = h;
	    
	    var picture_style = window.getComputedStyle(picture_el);	
	    var tiles_style = window.getComputedStyle(tiles_el);
	    
	    if (tiles_style.display != "none"){
		
		tiles_el.style.height = max_h + "px";
		tiles_el.style.width = max_w + "px";
		
		map_el.style.height = (max_h - 20) + "px";
		
		
	    } else {
		
		if (h > 280) {
		    img_el.style.maxWidth = max_w + "px";
		    img_el.style.maxHeight = max_h + "px";
		}
	    }
	},
	
	'onload_image': function(id){
	    
	    var img_id = "#zoomable-picture-default-" + id;
	    var img = self.document_root.querySelector(img_id);
	    
	    if (! img){
		// console.log("Missing image", id);
		return;
	    }
	    
	    var static = self.document_root.querySelector("#zoomable-static-" + id);
	    
	    var loading = self.document_root.querySelector("#zoomable-loading-" + id);
	
	    if (loading){
		loading.style.display = "none";
	    }   
	    
	    var interval = 30;    
	    var opacity = 0.0;
	    
	    img.style.opacity = opacity;
	    img.style.display = "inline";
	    
	    window.onresize = self.resize_visible;
	    self.resize_visible();
	    
	    static.style.backgroundImage = "none";
	    
	    var update = function(){
		
		opacity += .1;
		
		img.style.opacity = opacity;
		
		if (opacity >= 1.0){
		    return;
		}
		
		setTimeout(update, interval);
	    };
	    
	    setTimeout(update, interval);   
	},
	
	'ensure_iiif': function(tiles_url, cb){
	    
	    if (has_iiif){
		
		if (cb){
		    cb();
		}
		
		return;
	    }
	    
	    var info_url = tiles_url + "info.json";

	    var on_success = function(e){
		
		var rsp = e.target;
		
		has_iiif = (rsp.status == 200) ? true : false;

		// console.log("HAS IIIF", info_url, has_iiif);
		
		// START OF custom code to account for level0 disconnect
		// when generating SFOM tiles. Once we've cleaned up all
		// the  existing tiles (and info.json files) then the code
		// pull directly from details["qualities"][0] below should
		// be enabled (20220307/thisisaaronland)

		if (has_iiif){

		    try {
			
			var info = JSON.parse(rsp.response);
			var profile = info["profile"];

			if (profile[0] == "https://iiif.io/api/image/2/level0.json"){
			    iiif_quality = "default";
			}

			/*
			var count = profile.length;

			if (count == 2){
			    var details = profile[1];
			    iiif_quality = details["qualities"][0];
			}
			*/

		    } catch(err) {
			console.log("Unable to determine (IIIF) quality", err);
		    }
		    
		} else {
		    console.log("Failed to derive IIIF tiles, status code returned was", rsp.status)
		}

		// END OF custom code to account for level0 disconnect

		if (cb){
		    cb();
		}
	    };
	    
	    var req = new XMLHttpRequest();
	    req.addEventListener("load", on_success);
	    req.open("GET", info_url);
	    req.send();
	    
	},
	
	'show_static': function(e){
	    
	    var el = e.target;
	    var id = el.getAttribute("zoomable-image-id");
	    
	    if (! id){
		console.log("Element is missing zoomable-image-id attribute")
		return false;
	    }
	    
	    _id = id;
	    
	    return self.show_static_with_id(id);
	},
	
	'show_static_with_id': function(id){
	    
	    var static_id = "#zoomable-static-" + id;
	    var tiles_id = "#zoomable-tiles-" +id;
	    
	    var static_el = self.document_root.querySelector(static_id);
	    var tiles_el = self.document_root.querySelector(tiles_id);
	    
	    var tiles_button = self.document_root.querySelector("#zoomable-toggle-tiles-" + id);
	    
	    static_el.style.display = "block";
	    tiles_el.style.display = "none";
	    
	    tiles_button.style.display = "block";
	    
	    return false;
	},
	
	'show_tiles': function(e){
	    
	    var el = e.target;
	    var id = el.getAttribute("zoomable-image-id");
	    
	    if (! id){
		console.log("Element is missing zoomable-image-id attribute")
		return false;
	    }

	    _id = id;
	    return self.show_tiles_with_id(id);
	},
	
	'show_tiles_with_id': function(id, zoom){
	    
	    if (! zoom){
		zoom = 3;
	    }
	    
	    if (! quality){
		quality = iiif_quality;
	    }
	    
	    var static_id = "#zoomable-static-" + id;
	    var picture_id = "#zoomable-picture-" + id;		
	    var tiles_id = "#zoomable-tiles-" +id;
	    var map_id = "#zoomable-map-" +id;		
	    
	    var static_el = self.document_root.querySelector(static_id);
	    var picture_el = self.document_root.querySelector(picture_id);	
	    var tiles_el = self.document_root.querySelector(tiles_id);
	    var map_el = self.document_root.querySelector(map_id);	
	    
	    var w = self.available_width();	
	    var h = self.available_height();
	    
	    tiles_el.style.height = h + "px";
	    tiles_el.style.width = w + "px";
	    
	    map_el.style.height = (h - 20) + "px";
	    
	    // it's important to call these before trying to load
	    // the map (20200425/thisisaaronland)
	    
	    static_el.style.display = "none";
	    tiles_el.style.display = "block";
	    
	    if (map){
		map.remove();
	    }

	    var center = [ 0, 0 ];

	    var map_args = {
		center: center,
		zoom: 1,
		crs: L.CRS.Simple,
		minZoom: 1,
		fullscreenControl: true,
		preferCanvas: true,
	    };

	    // Note that we are passing map_el rather than map_id because
	    // Leaflet will get document.getElementById which will confuse
	    // Safari in a custom element Web Component context.
	    
	    var map_el = self.document_root.querySelector(map_id);
	    map = L.map(map_el, map_args);
	    
	    map.fullscreenControl.setPosition('topright');
	    map.zoomControl.setPosition('bottomright');	   
	    
	    var quality = map_el.getAttribute("zoomable-iiif-quality");

	    if (! quality){
		quality = iiif_quality;
	    }

	    var tile_opts = {
		fitBounds: true,
		quality: quality,
	    };
	    
	    var tiles_url = tiles_el.getAttribute("zoomable-tiles-url");
	    tiles_url = tiles_url + "info.json";
	    
	    var tile_layer = L.tileLayer.iiif(tiles_url, tile_opts)
	    
	    tile_layer.addTo(map);
	    
	    map.on('fullscreenchange', function () {

		if (! map.isFullscreen()){
		    self.show_static_with_id(_id);
		    return;
		}

		// See this? It's important. If we try to do this _outside_ of
		// fullscreen callback then all kinds of weirdness happens including
		// things like the map not actually zooming...
		map.setZoom(zoom);
	    });

	    map.toggleFullscreen();

	    if ((L.Control.Image) && (static_el.hasAttribute("zoomable-image-control"))){

		var _this = self;
		
		var image_opts = {
		    'position': 'topright',
		    
		    on_success: function(map, canvas) {
			
			var id = _this.get_id();
			
			var dt = new Date();
			var iso = dt.toISOString();
			var iso = iso.split('T');
			var ymd = iso[0];
			ymd = ymd.replace(/-/g, "");
			
			var ot = self.document_root.querySelectorAll(".zoomable-image");
			ot = ot[0];
			
			var id = ot.getAttribute("zoomable-image-id");
			
			var parts = [
			    ymd,
			    id,
			];
			
			var str_parts = parts.join("-");		    
			var name = str_parts + ".png";

			// ADD EXIF HERE

			var data_url = canvas.toDataURL();
			data_url = data_url.replace("data:image/png;base64,", "");

			
			
			canvas.toBlob(function(blob) {
			    saveAs(blob, name);
			});
		    }
		    
		};
		
		var image_control = new L.Control.Image(image_opts);
		map.addControl(image_control);
	    }
	    
	    var tiles_button = self.document_root.querySelector("#zoomable-toggle-tiles-" + id);
	    tiles_button.style.display = "none";
	    
	    return false;
	},
	
	'get_id': function(){
	    
	    var ot = self.document_root.querySelectorAll(".zoomable-image");
	    
	    if ((! ot) || (ot.length == 0)){
		return;
	    }
	    
	    ot = ot[0];
	    
	    var id = ot.getAttribute("zoomable-image-id");
	    
	    if (! id){
		return;
	    }
	    
	    return id;
	},
	
	'init': function(el, root){

	    if (! el){
		return;
	    }

	    // Because WebComponents and Safari...
	    self.document_root = (root) ? root : document;
	    
	    var id = el.getAttribute("zoomable-image-id");

	    if (! id){
		console.log("Image is missing zoomable-image-id attribute");
		return;
	    }
	    
	    var tiles_id = "#zoomable-tiles-" +id;
	    var tiles_el = self.document_root.querySelector(tiles_id);

	    console.log("DOC ROOT", self.document_root);
	    var tiles_url = tiles_el.getAttribute("zoomable-tiles-url");
	    
	    var mk_tiles_func = function(id){
		
		var tiles_id = "#zoomable-tiles-" +id;
		var tiles_el = self.document_root.querySelector(tiles_id);
		var tiles_url = tiles_el.getAttribute("zoomable-tiles-url");
		
		var tiles_button = self.document_root.querySelector("#zoomable-toggle-tiles-" + id);
		
		return function(){

		    if (has_iiif){		
			tiles_button.setAttribute("zoomable-image-id", id);
			tiles_button.onclick = self.show_tiles;
			tiles_button.style.display = "block";
		    }
		};
	    };
	    
	    var tiles_func = mk_tiles_func(id);
	    self.ensure_iiif(tiles_url, tiles_func);
	    self.onload_image(id);

	    /*
	    self.document_root.addEventListener('keydown', function(e){
		
		// z
		
		if (e.keyCode == 90) {
		    
		    var id = self.get_id();
		    
		    if (! id){
			return;
		    }
		    
		    self.show_tiles_with_id(id);
		    
		    // https://github.com/Leaflet/Leaflet/issues/690
		    map.invalidateSize();
		}
		
	    });
	    */
	},
    };

    return self;
    
})();
