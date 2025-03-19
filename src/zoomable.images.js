var zoomable = zoomable || {}

zoomable.images = (function(){

    var map;
    var _id;	// for the window.resize event below

    var has_iiif;
    var iiif_quality = 'default';

    var wasm_check;
    
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

	    // START OF replace with fetch() promise
	    
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

		    } catch(err) {
			console.error("Unable to determine (IIIF) quality", err);
		    }
		    
		} else {
		    console.error("Failed to derive IIIF tiles, status code returned was", rsp.status)
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

	    // END OF replace with fetch() promise	    
	},
	
	'show_static': function(e){
	    
	    var el = e.target;
	    var id = el.getAttribute("zoomable-image-id");
	    
	    if (! id){
		console.error("Element is missing zoomable-image-id attribute")
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
		console.error("Element is missing zoomable-image-id attribute")
		return false;
	    }

	    self.show_tiles_with_id(id);

	    // https://github.com/Leaflet/Leaflet/issues/690
	    map.invalidateSize();
	},
	
	'show_tiles_with_id': function(id, zoom){
	    
	    if (! zoom){
		zoom = 1;
	    }

	    console.debug("Show tiles with ID", id, zoom);
	    
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
		zoom: zoom,
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

	    if (typeof(map.fullscreenControl.setDocumentRoot) == "function"){
		map.fullscreenControl.setDocumentRoot(self.document_root);
	    }
	    
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
		    self.show_static_with_id(id);
		    return;
		}

		// See this? It's important. If we try to do this _outside_ of
		// fullscreen callback then all kinds of weirdness happens including
		// things like the map not actually zooming...
		map.setZoom(zoom);
	    });

	    map.toggleFullscreen();

	    if ((L.Control.Image) && (static_el.hasAttribute("zoomable-image-control"))){

		console.debug("Enable L.Control.Image");
		
		var _this = self;
		
		var image_opts = {
		    'position': 'topright',
		    
		    on_success: function(map, canvas) {

			var id = _this.get_attribute("zoomable-image-id")
			var tiles_url = _this.get_attribute("zoomable-tiles-url");
			var exif_description = _this.get_attribute("zoomable-exif-description");
			var exif_copyright = _this.get_attribute("zoomable-exif-copyright");									

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
			
			const str_parts = parts.join("-");		    
			const name = str_parts + ".jpg";

			// START OF write EXIF data
			// 'update_exif' WASM function is set up in init()
			
			// https://github.com/sfomuseum/go-exif-update?tab=readme-ov-file#supported-tags
			// https://exiv2.org/tags.html
			// https://exiftool.org/TagNames/EXIF.html

			var updates = {
			    "ImageID": id,
			};

			if (tiles_url){
			    updates["DocumentName"] = tiles_url;
			}

			if (exif_description){
			    updates["ImageDescription"] = exif_description;
			}

			if (exif_copyright){
			    updates["Copyright"] = exif_copyright;
			}
			
			// Copyright...?

			if ((update_exif) && (typeof(update_exif) == "function")){

			    console.debug("update EXIF", updates);
			    
			    enc_updates = JSON.stringify(updates);
			    
			    var data_url = canvas.toDataURL("image/jpeg", 1.0);

			    update_exif(data_url, enc_updates).then(data => {

				console.debug("EXIF data successfully updated");
				
				const blob = _this.dataURLToBlob(data);

				if (! blob){
				    throw new Error("Failed to derive blob from (EXIF) data URL.");
				}

				saveAs(blob, name);
				
			    }).catch((err) => {
				
				console.error("Failed to update EXIF data", err);

				// Write crop without EXIF data.
				
				var data_url = canvas.toDataURL("image/jpeg", 1.0);
				data_url = data_url.replace("data:image/jpeg;base64,", "");
				
				canvas.toBlob(function(blob) {
				    saveAs(blob, name);
				});
				
			    });
			    
			    return;
			}

			// END OF write EXIF data
			
			// Do not write EXIF data
			
			var data_url = canvas.toDataURL("image/jpeg", 1.0);
			data_url = data_url.replace("data:image/jpeg;base64,", "");
			
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
	
	'get_attribute': function(attr){

	    var ot = self.document_root.querySelectorAll(".zoomable-image");

	    if ((! ot) || (ot.length == 0)){
		console.warn("Invalid count for .zoomable-image", ot.length);
		return;
	    }
	    
	    ot = ot[0];
	    
	    if (! ot.hasAttribute(attr)){
		console.warn("Missing attribute for .zoomable-image", attr);
		return;
	    }
	    
	    return ot.getAttribute(attr);	    
	},

	dataURLToBlob: function(dataURL){

	    var BASE64_MARKER = ";base64,";
	    
	    if (dataURL.indexOf(BASE64_MARKER) == -1){
		
		var parts = dataURL.split(",");
		var contentType = parts[0].split(":")[1];
		var raw = decodeURIComponent(parts[1]);
		
		return new Blob([raw], {type: contentType});
	    }
	    
	    var parts = dataURL.split(BASE64_MARKER);
	    var contentType = parts[0].split(":")[1];
	    var raw = window.atob(parts[1]);
	    var rawLength = raw.length;
	    
	    var uInt8Array = new Uint8Array(rawLength);
	    
	    for (var i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	    }
	    
	    return new Blob([uInt8Array], {type: contentType});
	},
	
	'init': function(el, root){

	    if (! el){
		return;
	    }

	    // Because WebComponents and Safari...
	    self.document_root = (root) ? root : document;
	    
	    var id = el.getAttribute("zoomable-image-id");

	    if (! id){
		console.error("Image is missing zoomable-image-id attribute");
		return;
	    }

	    var tiles_id = "#zoomable-tiles-" +id;
	    var tiles_el = self.document_root.querySelector(tiles_id);

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

	    if ((typeof(update_exif) != "function") && (! wasm_check)){

		wasm_check = true;

		// derive from document.scripts...
		    
		sfomuseum.golang.wasm.fetch("wasm/update_exif.wasm").then((rsp) => {
		    console.debug("Initialized update_exif WASM binary");
		}).catch((err) => {
		    console.error("Failed to load update_exif WASM binary, skipping EXIF updates");
		});
	    }
	    
	    self.onload_image(id);
	},
    };

    return self;
    
})();
