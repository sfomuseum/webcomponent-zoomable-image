class ZoomableImageElement extends HTMLPictureElement {

    constructor() {
	super();
    }
    
    connectedCallback(){

	var tpl_id = "zoomable-image-template";
	
	var id = this.getAttribute("zoomable-image-id");
	var tiles_url = this.getAttribute("zoomable-tiles-url");

	var src_els = Array.from(this.querySelectorAll("source"));
	var count_src = src_els.length;
	
	var img_el = this.querySelector("img");

	var wrapper = document.createElement("div");
	wrapper.setAttribute("class", "zoomable-image");
	wrapper.setAttribute("id", "zoomable-image-" + id);
	wrapper.setAttribute("zoomable-image-id", id);
	
	var static_el = document.createElement("div");
	static_el.setAttribute("class", "zoomable-static");
	static_el.setAttribute("id", "zoomable-static-" + id);

	if (this.hasAttribute("zoomable-image-control")){
	    static_el.setAttribute("zoomable-image-control", "true");
	}
	
	var button = document.createElement("button");
	button.setAttribute("class", "btn btn-sm zoomable-button zoomable-toggle-tiles");
	button.setAttribute("id", "zoomable-toggle-tiles-" + id);
	button.setAttribute("zoomable-image-id", id);
	button.setAttribute("title", "View this image in full screen mode");

	var loading = document.createElement("p");
	loading.setAttribute("id", "zoomable-loading-" + id);
	loading.setAttribute("class", "zoomable-loading");

	if (this.hasAttribute("zoomable-loading-image")){
	    var src = this.getAttribute("zoomable-loading-image");
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
	picture_img.onload = function(){
	    var el = document.getElementById("zoomable-image-" + id);
	    zoomable.images.init(el);	    
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
	
	if (this.hasAttribute("template-id")){
	    tpl_id = this.getAttribute("template-id");
	}
	
	var tpl = document.getElementById(tpl_id);
	
	if (tpl){
	    let tpl_content = tpl.content;
	    wrapper.appendChild(tpl_content.cloneNode(true));
	}

	
	wrapper.appendChild(static_el);	
	wrapper.appendChild(tiles);

	this.parentNode.replaceChild(wrapper, this);
    }
}

customElements.define('zoomable-image', ZoomableImageElement, { extends: "picture" });
