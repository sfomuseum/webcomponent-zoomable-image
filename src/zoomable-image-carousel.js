class ZoomableImageCarouselElement extends HTMLUListElement {

    visible = 3
    
    constructor() {
	super();
    }
    
    connectedCallback(){

	if (this.hasAttribute("visible")){
	    var n = parseInt(this.getAttribute("visible"));

	    if (n){
		this.visible = n;
	    }

	}

	this._images = [];
	this._pictures = [];
	this._links = {};
	this._attrs = {};

	var _self = this;

	// Start by creating a new <ul> element that will eventually replace 'this'.
	
	var carousel = document.createElement("ul");
	carousel.setAttribute("class", "zoomable-carousel");
	
	var pictures = this.querySelectorAll("picture");
	var count_pictures = pictures.length;

	if (count_pictures < this.visible) {
	    this.setAttribute("class", "zoomable-carousel-" + count_imges);
	}

	for (var i=0; i < count_pictures; i++){

	    var pic_el = pictures[i];
	    this._pictures.push(pic_el);

	    var img_el = pic_el.querySelector("img");
	    var img_src = img_el.getAttribute("src");
	    
	    this._images.push(img_src);
	    
	    var data_attributes = {
		image_src: img_src,
	    };
	    
	    var attrs = img_el.attributes;
	    var count_attrs = attrs.length;
	    
	    for (var j=0; j< count_attrs; j++){
		
		var attr = attrs[j];
		var key = attr.name;
		
		if (! key.startsWith("zoomable-")){
		    continue;
		}
		
		var short_key = key.replace("zoomable-", "");
		data_attributes[short_key] = attr.value;
	    }
	    
	    this._attrs[img_src] = data_attributes;
	    
	    var parent = img_el.parentNode;
	    
	    if (parent.nodeName == "A"){
		var link = parent.getAttribute("href");
		this._links[ img_src ] = link
		parent = parent.parentNode;
	    }
	    
	    parent.style.display = "none";
	}
	
	var rewind_el = document.createElement("li");
	rewind_el.setAttribute("id", "zoomable-carousel-control-rewind");
	rewind_el.setAttribute("class", "zoomable-carousel-item zoomable-carousel-control");
	rewind_el.appendChild(document.createTextNode("<"));
	
	rewind_el.onclick = function(){
	    _self.rewind();
	};
	
	carousel.appendChild(rewind_el);
	
	var panes = this.visible;
	
	if (count_pictures < this.visible){
	    panes = count_imeags;
	}
	
	for (var i=0; i < panes; i++){
	    
	    var j = (i == 0) ? count_pictures - 1 : i - 1;
	    
	    var img_src = this._images[j];
	    var img_node = document.createElement("img");
	    
	    img_node.setAttribute("class", "zoomable-carousel-item zoomable-carousel-visible");
	    img_node.setAttribute("zoomable-carousel-index", j);		
	    img_node.setAttribute("src", img_src);
	    
	    if (link){
		
		img_node.onclick = function(e){
		    var el = e.target;
		    var src = el.getAttribute("src");
		    var attrs = this._attrs[src];
		    var id = attrs["image-id"];
		    this.assign(id);
		    return false;
		};
	    }
	    
	    var item_node = document.createElement("li");
	    item_node.setAttribute("class", "zoomable-carousel-item");
	    item_node.setAttribute("zoomable-carousel-index", i);	    
	    item_node.appendChild(img_node);
	    
	    carousel.appendChild(item_node);
	}
	
	var advance_el = document.createElement("li");
	advance_el.setAttribute("id", "zoomable-carousel-control-advance");
	advance_el.setAttribute("class", "zoomable-carousel-item zoomable-carousel-control");
	advance_el.appendChild(document.createTextNode(">"));
	
	advance_el.onclick = function(){
	    _self.advance();
	};
	
	carousel.appendChild(advance_el);

	var first_pic = this._pictures[0];
	
	/*
	   Note the way we are calling new ZoomableImageElement and not document.createElement("picture")
	   and then assigning an is="zoomable-image" property. When we do the latter the Web Component
	   constructor is not trigger. I don't know why.
	 */
	
	var z = new ZoomableImageElement();
	z.setAttribute("zoomable-image-id", first_pic.getAttribute("zoomable-image-id"));
	z.setAttribute("zoomable-tiles-url", first_pic.getAttribute("zoomable-tiles-url"));

	for (const c of first_pic.children){
	    z.appendChild(c);
	}

	var wrapper = document.createElement("div");
	wrapper.appendChild(z);
	wrapper.appendChild(carousel);

	this.parentNode.replaceChild(wrapper, this);	
    }

    assign(id) {

	var visible_images = document.getElementsByClassName("zoomable-carousel-visible");
	var count_visible = visible_images.length;
	
	var current_idx = Math.floor(count_visible / 2);
	
	var new_idx = this.index_for_id(id);
	
	if (new_idx == -1){
	    console.log("Can't determine new index");
	    return false;
	}
	
	var current_el = visible_imeags[current_idx];
	
	if (! current_el){
	    console.log("Can't get element for index " + current_idx);
	    return false;
	}
	
	var current_src = current_el.getAttribute("src");
	var current_attrs = this._attrs[current_src];
	
	var new_src = this._images[new_idx];
	var new_attrs = this._attrs[new_src];
	
	this.update(current_attrs, new_attrs);

	// now update the bookends
	
	var count_pictures = this._images.length;

	var center_el = visible_images[current_idx];
	center_el.setAttribute("src", new_src);
	center_el.setAttribute("zoomable-carousel-index", new_idx);
	
	for (var i=0; i < current_idx; i++){
	    
	    var j = i + 1;
	    
	    var prev_idx = (new_idx == 0) ? count_pictures - 1 : new_idx - j;
	    var prev_src = this._images[prev_idx];
	    
	    var prev_el = visible_images[i];
	    prev_el.setAttribute("src", prev_src);
	    prev_el.setAttribute("zoomable-carousel-index", prev_idx);
	}
	
	for (var i= (current_idx + 1); i < count_visible; i++){
	    
	    var next_idx = (new_idx == (count_pictures - 1)) ? 0 : new_idx + 1;
	    var next_src = this._images[next_idx];
	    
	    var next_el = visible_images[i];
	    next_el.setAttribute("src", next_src);
	    next_el.setAttribute("zoomable-carousel-index", next_idx);
	}
    }

    index_for_id(id){

	var idx = -1;
	var count = this._images.length;
	
	for (var i=0; i < count; i++){
	    
	    var src = this._images[i];
	    var attrs = this._attrs[src];
	    
	    if (attrs["image-id"] == id){
		idx = i;
		break;
	    }
	}
	
	return idx;
    }

    update(current_attrs, updated_attrs){
	
	location.hash = updated_attrs["image-id"];

	var idx = this.index_for_id(updated_attrs["image-id"]);
	console.log(idx, this._pictures[idx].children);

	console.log("WUT", current_attrs["image-id"]);
	
	var updated_zoomable = zoomable.builder.make_zoomable_element(updated_attrs);
	var current_zoomable = document.getElementById("zoomable-image-" + current_attrs["image-id"]);
		
	current_zoomable.parentNode.replaceChild(updated_zoomable, current_zoomable);
	zoomable.images.init(updated_zoomable);
	
	var updated_id = updated_zoomable.getAttribute("zoomable-image-id");
	var img_id = "zoomable-picture-default-" + updated_id;

	var im = document.getElementById(img_id);

	im.onload = function() {
	    
	    var w = this.width;
	    var h = this.height;
	    
	    if (h = w){
		zoomable.images.resize_visible();
	    }
	};
    }

    advance(){

	var count_images = this._images.length;
	
	var visible = document.getElementsByClassName("zoomable-carousel-visible");
	var count = visible.length;
	
	var center = Math.floor(count / 2);	// AGAIN, account for image count of 2

	for (var i=0; i < count; i++){
	    
	    var el = visible[i];
	    
	    var src = el.getAttribute("src");
	    
	    var idx = el.getAttribute("zoomable-carousel-index");
	    idx = parseInt(idx);
	    
	    var next_idx = (idx == 0) ? count_images - 1 : idx - 1;
	    var next_src = this._images[next_idx];
	    
	    el.setAttribute("src", next_src);
	    el.setAttribute("zoomable-carousel-index", next_idx);
	    
	    if (i == center){
		var current_attrs = this._attrs[src];
		var next_attrs = this._attrs[next_src];
		this.update(current_attrs, next_attrs);
	    }
	}
    }
    
    rewind(){

	var count_images = this._images.length;
	
	var visible = document.getElementsByClassName("zoomable-carousel-visible");
	var count = visible.length;
	
	var center = Math.floor(count / 2);
	
	for (var i=0; i < count; i++){
	    
	    var el = visible[i];
	    
	    var src = el.getAttribute("src");
	    var idx = el.getAttribute("zoomable-carousel-index");
	    idx = parseInt(idx);
	    
	    var prev_idx = (idx == (count_images - 1)) ? 0 : idx + 1;
	    var prev_src = this._images[prev_idx];
	    
	    el.setAttribute("src", prev_src);
	    el.setAttribute("zoomable-carousel-index", prev_idx);
	    
	    if (i == center){
		    var current_attrs = this._attrs[src];
		    var prev_attrs = this._attrs[prev_src];
		    this.update(current_attrs, prev_attrs);
		}
	}
    }
    
}

customElements.define('zoomable-image-carousel', ZoomableImageCarouselElement, { extends: "ul" });
