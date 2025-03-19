class ZoomableImage {

    document_root

    constructor(root) {
	this.document_root = (root) ? root : document;
    }

    make_zoomable_wrapper(ctx) {

	var _ctx = ctx;
	var _self = this;
	
	var id = ctx.getAttribute("zoomable-image-id");
	var tiles_url = ctx.getAttribute("zoomable-tiles-url");
	var exif_description = ctx.getAttribute("zoomable-exif-description");
	var exif_copyright = ctx.getAttribute("zoomable-exif-copyright");		

	var src_els = Array.from(ctx.querySelectorAll("source"));
	var count_src = src_els.length;
	
	var img_el = ctx.querySelector("img");

	var wrapper = document.createElement("div");
	wrapper.setAttribute("class", "zoomable-image");
	wrapper.setAttribute("id", "zoomable-image-" + id);
	wrapper.setAttribute("zoomable-image-id", id);

	// START OF EXIF things...
	
	wrapper.setAttribute("zoomable-tiles-url", tiles_url + "info.json");

	if (exif_description){
	    wrapper.setAttribute("zoomable-exif-description", exif_description);
	}

	if (exif_copyright){
	    wrapper.setAttribute("zoomable-exif-copyright", exif_copyright);	
	}
	
	// END OF EXIF things...
	
	var static_el = document.createElement("div");
	static_el.setAttribute("class", "zoomable-static");
	static_el.setAttribute("id", "zoomable-static-" + id);

	if (ctx.hasAttribute("zoomable-image-control")){
	    console.debug("Context enables image control, adding to static element");
	    static_el.setAttribute("zoomable-image-control", "true");
	}
	
	var button = document.createElement("button");
	button.setAttribute("class", "btn btn-sm zoomable-button zoomable-toggle-tiles");
	button.setAttribute("id", "zoomable-toggle-tiles-" + id);
	button.setAttribute("zoomable-image-id", id);
	button.setAttribute("title", "View ctx image in full screen mode");

	var loading = document.createElement("p");
	loading.setAttribute("id", "zoomable-loading-" + id);
	loading.setAttribute("class", "zoomable-loading");

	if (ctx.hasAttribute("zoomable-loading-image")){
	    var src = ctx.getAttribute("zoomable-loading-image");
	    loading.setAttribute("style", "background-image:url(" + src + ")");
	}
	
	loading.appendChild(document.createTextNode("loading"));

	var picture = document.createElement("picture");
	picture.setAttribute("class", "zoomable-picture");
	picture.setAttribute("id", "zoomable-picture-" + id);
	
	for (var i=0; i < count_src; i++){
	    picture.appendChild(src_els[i].cloneNode());
	}

	var picture_img = document.createElement("img");
	picture_img.setAttribute("src", img_el.getAttribute("src"));
	picture_img.setAttribute("alt", img_el.getAttribute("alt"));	
	    
	picture_img.setAttribute("id", "zoomable-picture-default-" + id);
	picture_img.setAttribute("class", "card-img-top zoomable-picture-default image-square image-zoomable");
	
	picture_img.onload = function(ev){
	    var el = _self.document_root.getElementById("zoomable-image-" + id);
	    zoomable.images.init(el, _self.document_root);	    
	};
	
	picture.appendChild(picture_img);

	static_el.appendChild(button);
	static_el.appendChild(loading);
	static_el.appendChild(picture);
	
	var tiles = document.createElement("div");
	tiles.setAttribute("class", "zoomable-tiles");
	tiles.setAttribute("id", "zoomable-tiles-" + id);
	tiles.setAttribute("zoomable-tiles-url", tiles_url);

	var tiles_map = document.createElement("div");
	tiles_map.setAttribute("class", "zoomable-map");
	tiles_map.setAttribute("id", "zoomable-map-" + id);

	tiles.appendChild(tiles_map);
	
	var tpl_id = "zoomable-image-template";

	if (ctx.hasAttribute("template-id")){
	    tpl_id = ctx.getAttribute("template-id");
	}
	
	var tpl = document.querySelector("#" + tpl_id);
	
	if (tpl){
	    let tpl_content = tpl.content;
	    wrapper.appendChild(tpl_content.cloneNode(true));
	}

	
	wrapper.appendChild(static_el);	
	wrapper.appendChild(tiles);

	return wrapper;
    }
}

class ZoomableImageElement extends HTMLPictureElement {

    constructor() {
	super();
    }
    
    connectedCallback(){
	var zi = new ZoomableImage();
	var wrapper = zi.make_zoomable_wrapper(this);
	this.parentNode.replaceChild(wrapper, this);
    }
}

customElements.define('zoomable-image', ZoomableImageElement, { extends: "picture" });

class ZoomableImageElementCustom extends HTMLElement {
    
    constructor() {
	super();
    }
    
    connectedCallback() {

	const shadow = this.attachShadow({ mode: "open" });	

	var zi = new ZoomableImage(shadow);
	var wrapper = zi.make_zoomable_wrapper(this);

	shadow.appendChild(wrapper);
  }
}

customElements.define("zoomable-image-custom", ZoomableImageElementCustom);
