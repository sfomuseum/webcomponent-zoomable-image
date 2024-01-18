// package for building DOM elements for zoomable images
var zoomable = zoomable || {}

zoomable.builder = (function(){

    var self = {

	'make_zoomable_element': function(args){

	    var static_el = self.make_static_element(args);
	    var tiles_el = self.make_tiles_element(args);

	    var zoomable_el = document.createElement("div");
	    zoomable_el.setAttribute("class", "zoomable-image");
	    zoomable_el.setAttribute("id", "zoomable-image-" + args["image-id"]);
	    zoomable_el.setAttribute("zoomable-image-id", args["image-id"]);

	    zoomable_el.appendChild(static_el);
	    zoomable_el.appendChild(tiles_el);

	    return zoomable_el;
	},

	'make_static_element': function(args){
	    
	    var picture_el = self.make_picture_element(args);

	    var link_el = document.createElement("a");
	    link_el.setAttribute("class", "zoomable-image-link");
	    link_el.setAttribute("src", "#");
	    
	    link_el.appendChild(picture_el);

	    var button_el = document.createElement("button");
	    button_el.setAttribute("class", "btn btn-sm btn-light zoomable-button zoomable-toggle-tiles");
	    button_el.setAttribute("id", "zoomable-toggle-tiles-" + args["image-id"]);
	    button_el.setAttribute("zoomable-image-id", args["image-id"]);
	    button_el.setAttribute("title", "View this image in full screen mode");

	    var loading_el = document.createElement("p");
	    loading_el.setAttribute("id", "zoomable-loading-" + args["image-id"]);
	    loading_el.setAttribute("class", "zoomable-loading");
	    loading_el.setAttribute("style", "background-image:url(" + args["image-url-ds"] + ")");

	    var span_el = document.createElement("span");
	    span_el.setAttribute("class", "zoomable-loading-text");
	    span_el.appendChild(document.createTextNode("loading image"));

	    loading_el.appendChild(span_el);
	    
	    var static_el = document.createElement("div");
	    static_el.setAttribute("class", "zoomable-static");
	    static_el.setAttribute("id", "zoomable-static-" + args["image-id"]);	   

	    static_el.appendChild(button_el);
	    static_el.appendChild(loading_el);
	    static_el.appendChild(link_el);

	    return static_el;
	},

	'make_tiles_element': function(args){

	    var map_el = document.createElement("div");
	    map_el.setAttribute("class", "zoomable-map");
	    map_el.setAttribute("id", "zoomable-map-" + args["image-id"]);

	    var tiles_el = document.createElement("div");
	    tiles_el.setAttribute("class", "zoomable-tiles");
	    tiles_el.setAttribute("id", "zoomable-tiles-" + args["image-id"]);
	    tiles_el.setAttribute("zoomable-tiles-url", args["tiles-url"]);

	    tiles_el.appendChild(map_el);
	    return tiles_el;
	},

	'make_picture_element': function(args){

	    var p = document.createElement("picture");
	    p.setAttribute("class", "zoomable-picture");
	    p.setAttribute("id", "zoomable-picture-" + args["image-id"]);

	    /*
	    var source_map = {
		"k": "(min-width: 2048px)",
		"b": "(min-width: 1024px)",
		"c": "(min-width: 800px)",
		"z": "(min-width: 400px)",
		"n": "(min-width: 320px)",
	    };
	    
	    for (var k in source_map){

		var url_k = "image-url-" + k;
		var url = args[url_k];

		if (! url){
		    continue;
		}

		var source_el = document.createElement("source");
		source_el.setAttribute("srcset", url);
		source_el.setAttribute("media", source_map[k]);

		p.appendChild(source_el);
	    }
	    */
	    
	    var class_names = [
		"zoomable-picture-default",
	    ];

	    var i = document.createElement("img");
	    i.setAttribute("id", "zoomable-picture-default-" + args["image-id"]);
	    i.setAttribute("class", class_names.join(" "));
	    
	    i.setAttribute("src", args["image_src"]);

	    p.appendChild(i);
	    return p;
	}

    };

    return self;
    
})();
