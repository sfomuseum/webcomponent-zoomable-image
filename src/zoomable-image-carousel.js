class ZoomableImageCarousel {

    // This package is in need of some love, refactoring or at least documentation.
    // Specifically looking over the code now it seems overly complicated and repetative
    // but I am confident there were reasons. I just don't remember what those reasons
    // were anymore...
    
    visible = 3
    
    _images = []
    _pictures = []
    _links = []
    _attrs = []

    document_root
    
    constructor(root) {
	this.document_root = (root) ? root : document;
    }

    make_carousel_wrapper(ctx) {

	if (ctx.hasAttribute("visible")){
	    var n = parseInt(ctx.getAttribute("visible"));

	    if (n){
		this.visible = n;
	    }

	}

	var _self = this;

	// Start by creating a new <ul> element that will eventually replace 'this'.
	
	var carousel = document.createElement("ul");
	
	carousel.setAttribute("class", "zoomable-carousel");
	
	var pictures = ctx.querySelectorAll("picture");
	var count_pictures = pictures.length;

	if (count_pictures < this.visible) {
	    ctx.setAttribute("class", "zoomable-carousel-" + count_pictures);
	}

	for (var i=0; i < count_pictures; i++){

	    var pic_el = pictures[i];
	    this._pictures.push(pic_el);

	    var img_el = pic_el.querySelector("img");
	    var img_src = img_el.getAttribute("src");

	    this._images.push(img_src);
	    
	    var data_attributes = {
		image_src: img_src,
		"image-id": pic_el.getAttribute("zoomable-image-id"),
		"tiles-url": pic_el.getAttribute("zoomable-tiles-url"),
		"exif-description": pic_el.getAttribute("zoomable-exif-description"),
		"exif-copyright": pic_el.getAttribute("zoomable-exif-copyright"),		
		"image-control": pic_el.hasAttribute("zoomable-image-control"),		
		"picture": pic_el.cloneNode(true),
		// This is necessary because 'pic_el' get silently zero-ed out 
		// for reasons I don't understand so we track the raw HTML and
		// if necessary parse it back in to a DOM element in make_picture_element.
		// Good times....
		"picture_html": pic_el.outerHTML,
	    };

	    this._attrs[img_src] = data_attributes;

	    var parent = img_el.parentNode;
	    
	    if (parent.nodeName == "A"){
		var link = parent.getAttribute("href");
		this._links[ img_src ] = link
		parent = parent.parentNode;
	    }
	    
	    parent.style.display = "none";
	}

	// Create rewind button

	var rewind_el = document.createElement("li");
	rewind_el.setAttribute("id", "zoomable-carousel-control-rewind");
	rewind_el.setAttribute("class", "zoomable-carousel-item zoomable-carousel-control");
	rewind_el.appendChild(document.createTextNode("<"));
	
	rewind_el.onclick = function(){
	    _self.rewind();
	};
	
	carousel.appendChild(rewind_el);
	
	// Draw visible image panes

	var panes = this.visible;
	
	if (count_pictures < this.visible){
	    panes = count_pictures;
	}
	
	for (var i=0; i < panes; i++){
	    
	    var j = (i == 0) ? count_pictures - 1 : i - 1;
	    
	    var img_src = this._images[j];
	    var img_node = document.createElement("img");
	    
	    img_node.setAttribute("class", "zoomable-carousel-item zoomable-carousel-visible");
	    img_node.setAttribute("zoomable-carousel-index", j);		
	    img_node.setAttribute("src", img_src);
	    
	    img_node.onclick = function(e){
		var el = e.target;
		var src = el.getAttribute("src");
		var attrs = _self._attrs[src];
		var id = attrs["image-id"];
		_self.assign(id);
		return false;
	    };
	    
	    var item_node = document.createElement("li");
	    item_node.setAttribute("class", "zoomable-carousel-item");
	    item_node.setAttribute("zoomable-carousel-index", i);	    
	    item_node.appendChild(img_node);

	    carousel.appendChild(item_node);
	}

	// Create advance button

	var advance_el = document.createElement("li");
	advance_el.setAttribute("id", "zoomable-carousel-control-advance");
	advance_el.setAttribute("class", "zoomable-carousel-item zoomable-carousel-control");
	advance_el.appendChild(document.createTextNode(">"));
	
	advance_el.onclick = function(){
	    _self.advance();
	};
	
	carousel.appendChild(advance_el);
	
	var first_pic = this._pictures[0];

	// Create zoomable image (custom) element which is placed above the carousel

	var z;

	// If we are in a WebKit context we (seemingly) can't use the new ZoomableImageElementCustom()
	// methods so we just use the inline code construct the element manually. All of this needs
	// to be reconciled with the equivalent code in zoomable-image.js and, perhaps, there is no
	// point in trying to create elements with the ZoomableImage wrapper classes. TBD...

	if ('webkitRequestAnimationFrame' in window){

	    var z_attrs = {
		'image-id': first_pic.getAttribute("zoomable-image-id"),
		'image-url-ds': '',
		'tiles-url': first_pic.getAttribute("zoomable-tiles-url"),
		'image-control': first_pic.getAttribute("zoomable-image-control"),				
		'picture': first_pic,
	    };

	    if (first_pic.hasAttribute("zoomable-exif-description")){
		z_attrs['exif-description'] = first_pic.getAttribute("zoomable-exif-description");
	    }

	    if (first_pic.hasAttribute("zoomable-exif-copyright")){
		z_attrs['exif-copyright'] = first_pic.getAttribute("zoomable-exif-copyright");
	    }
	    
	    z = this.make_zoomable_element(z_attrs);
	    
	} else {
	    
	    /*
	       Note the way we are calling new ZoomableImageElement and not document.createElement("picture")
	       and then assigning an is="zoomable-image" property. When we do the latter the Web Component
	       constructor is not trigger. I don't know why.
	     */
	    
	    z = new ZoomableImageElement();
	    
	    z.setAttribute("zoomable-image-id", first_pic.getAttribute("zoomable-image-id"));
	    z.setAttribute("zoomable-tiles-url", first_pic.getAttribute("zoomable-tiles-url"));

	    if (first_pic.hasAttribute("zoomable-exif-description")){
		z.setAttribute("zoomable-exif-description", first_pic.getAttribute("zoomable-exif-description"));	    
	    }

	    if (first_pic.hasAttribute("zoomable-exif-copyright")){
		z.setAttribute("zoomable-exif-copyright", first_pic.getAttribute("zoomable-exif-copyright"));	    
	    }
	    
	    if (first_pic.hasAttribute("zoomable-image-control")){
		z.setAttribute("zoomable-image-control", "true");
	    }
	    
	    var source_els = first_pic.querySelectorAll("source")
	    var img_els = first_pic.querySelectorAll("img")
	    
	    var count_sources = source_els.length;
	    var count_imgs = img_els.length;
	    
	    for (var i=0; i < count_sources; i++){
		z.appendChild(source_els[i]);
	    }
	    
	    for (var i=0; i < count_imgs; i++){
		z.appendChild(img_els[i]);
	    }
	}

	var wrapper = document.createElement("div");
	wrapper.setAttribute("class", "zoomable-carousel-wrapper");

	var tpl_id = "zoomable-image-carousel-template";
	
	if (ctx.hasAttribute("template-id")){
	    tpl_id = ctx.getAttribute("template-id");
	}
	
	var tpl = document.querySelector("#" + tpl_id);

	if (tpl){
	    let tpl_content = tpl.content;
	    wrapper.appendChild(tpl_content.cloneNode(true));
	}

	wrapper.appendChild(z);
	wrapper.appendChild(carousel);

	// Let's just get everything else working first...
	
	if (ctx.hasAttribute("zoomable-keyboard-events")){

	    var pagination_el = document.createElement("div");
	    pagination_el.setAttribute("class", "zoomable-pagination-blurb");

	    var previous = document.createElement("span");
	    previous.setAttribute("class", "zoomable-pagination-blurb-arrow");
	    previous.appendChild(document.createTextNode("←"));
	    
	    var next = document.createElement("span");
	    next.setAttribute("class", "zoomable-pagination-blurb-arrow");
	    next.appendChild(document.createTextNode("→"));
	    
	    pagination_el.appendChild(document.createTextNode("you can also use the "));
	    pagination_el.appendChild(previous);
	    pagination_el.appendChild(document.createTextNode(" and "));
	    pagination_el.appendChild(next);
	    pagination_el.appendChild(document.createTextNode(" arrow keys on your keyboard to navigate between images"));      
	    
	    wrapper.appendChild(pagination_el);
	    
	    this.init_keyboard();
	}

	return wrapper;
    }
    
    assign(id) {

	if (! id){
	    id = this._pictures[0].getAttribute("zoomable-image-id");
	}

	var visible_images = this.document_root.querySelectorAll(".zoomable-carousel-visible");

	var count_visible = visible_images.length;
	
	var current_idx = Math.floor(count_visible / 2);
	
	var new_idx = this.index_for_id(id);

	if (new_idx == -1){
	    console.error("Can't determine new index");
	    return false;
	}

	var current_el = visible_images[current_idx];

	if (! current_el){
	    console.error("Can't get element for index " + current_idx);
	    return false;
	}

	var current_src = current_el.getAttribute("src");
	var current_attrs = this._attrs[current_src];
	
	var new_src = this._images[new_idx];
	var new_attrs = this._attrs[new_src];
	new_attrs.picture = this._pictures[new_src];

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

	var updated_zoomable = this.make_zoomable_element(updated_attrs);
	var current_zoomable = this.document_root.querySelector("#zoomable-image-" + current_attrs["image-id"]);

	current_zoomable.parentNode.replaceChild(updated_zoomable, current_zoomable);
	zoomable.images.init(updated_zoomable, this.document_root);
	
	var updated_id = updated_zoomable.getAttribute("zoomable-image-id");
	var img_id = "#zoomable-picture-default-" + updated_id;

	var im = this.document_root.querySelector(img_id);

	im.onload = function() {
	    
	    var w = this.width;
	    var h = this.height;

	    if (h = w){
		zoomable.images.resize_visible();
	    }

	    const customEvent = new CustomEvent('zoomable_carousel_onchange', {
                detail: updated_attrs,
                bubbles: true,
                composed: true
            });

            this.dispatchEvent(customEvent);	    
	};
    }

    advance(){

	var count_images = this._images.length;
	
	var visible = this.document_root.querySelectorAll(".zoomable-carousel-visible");
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
	
	var visible = this.document_root.querySelectorAll(".zoomable-carousel-visible");
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

    init_keyboard(){

	var _self = this;
	
	document.addEventListener('keydown', function(e){
	    
	    if (e.keyCode == 37){
		_self.rewind();
	    }
	    
	    if (e.keyCode == 39){
		_self.advance();
	    }
	    
	});
    }

    // START OF reconcile this with the code in zoomable-image.js
    
    make_zoomable_element(args){
	
	var static_el = this.make_static_element(args);
	var tiles_el = this.make_tiles_element(args);
	
	var zoomable_el = document.createElement("div");
	zoomable_el.setAttribute("class", "zoomable-image");
	zoomable_el.setAttribute("id", "zoomable-image-" + args["image-id"]);
	zoomable_el.setAttribute("zoomable-image-id", args["image-id"]);

	zoomable_el.setAttribute("zoomable-tiles-url", args["tiles-url"]);

	if (args["image-control"]){
	    zoomable_el.setAttribute("zoomable-image-control", args["image-control"]);		
	}
	
	if (args["exif-description"]){
	    zoomable_el.setAttribute("zoomable-exif-description", args["exif-description"]);
	}
	
	if (args["exif-copyright"]){
	    zoomable_el.setAttribute("zoomable-exif-copyright", args["exif-copyright"]);
	}
	
	zoomable_el.appendChild(static_el);
	zoomable_el.appendChild(tiles_el);
	
	return zoomable_el;
    }
    
    make_static_element(args){
	
	var picture_el = this.make_picture_element(args);
	
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

	static_el.setAttribute("zoomable-tiles-url", args["tiles-url"]);

	if (args["image-control"]){
	    static_el.setAttribute("zoomable-image-control", args["image-control"]);		
	}
	
	if (args["exif-description"]){
	    static_el.setAttribute("zoomable-exif-description", args["exif-description"]);
	}

	if (args["exif-copyright"]){
	    static_el.setAttribute("zoomable-exif-copyright", args["exif-copyright"]);
	}
		
	static_el.appendChild(button_el);
	static_el.appendChild(loading_el);
	static_el.appendChild(link_el);
	
	return static_el;
    }
    
    make_tiles_element(args){
	
	var map_el = document.createElement("div");
	map_el.setAttribute("class", "zoomable-map");
	map_el.setAttribute("id", "zoomable-map-" + args["image-id"]);
	
	var tiles_el = document.createElement("div");
	tiles_el.setAttribute("class", "zoomable-tiles");
	tiles_el.setAttribute("id", "zoomable-tiles-" + args["image-id"]);
	tiles_el.setAttribute("zoomable-tiles-url", args["tiles-url"]);

	if (args["image-control"]){
	    tiles_el.setAttribute("zoomable-image-control", args["image-control"]);		
	}
		
	if (args["exif-description"]){
	    tiles_el.setAttribute("zoomable-exif-description", args["exif-description"]);
	}
	
	if (args["exif-copyright"]){
	    tiles_el.setAttribute("zoomable-exif-copyright", args["exif-copyright"]);
	}
	
	tiles_el.appendChild(map_el);
	return tiles_el;
    }
    
    make_picture_element(args){
	
	var p = document.createElement("picture");
	p.setAttribute("class", "zoomable-picture");
	p.setAttribute("id", "zoomable-picture-" + args["image-id"]);
	p.setAttribute("zoomable-tiles-url", args["tiles-url"]);

	if (args["image-control"]){
	    p.setAttribute("zoomable-image-control", true);	    
	}
	
	if (args["exif-description"]){
	    p.setAttribute("zoomable-exif-description", args["exif-description"]);	    	
	}

	if (args["exif-copyright"]){
	    p.setAttribute("zoomable-exif-copyright", args["exif-copyright"]);	    	
	}
		
	var picture_el;

	// See notes above in make_carousel_wrapper. So dumb...
	if (args["picture"]){
	    picture_el = args["picture"];
	} else if (args["picture_html"]){
	    var parser = new DOMParser();
	    var doc = parser.parseFromString(args["picture_html"], "text/html");
	    picture_el = doc.querySelector("picture");
	}

	if (picture_el){

	    var source_els = picture_el.querySelectorAll("source");
	    var count_source = source_els.length;
	    
	    for (var i=0; i < count_source; i++){
		p.appendChild(source_els[i]);
	    }
	}
	
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
    
    // END OF reconcile this with the code in zoomable-image.js    
    
}

class ZoomableImageCarouselElement extends HTMLUListElement {
    
    constructor() {
	super();
    }
    
    connectedCallback(){

	var zc = new ZoomableImageCarousel();
	var wrapper = zc.make_carousel_wrapper(this);
	this.parentNode.replaceChild(wrapper, this);

	var id;
	
	if (location.hash != ""){
	    var hash = location.hash.substr(1);
	    id = parseInt(hash);
	}

	zc.assign(id);		
    }

    
}

customElements.define('zoomable-image-carousel', ZoomableImageCarouselElement, { extends: "ul" });

class ZoomableImageCarouselCustom extends HTMLElement {
    
    constructor() {
	super();
    }
    
    connectedCallback() {

	const shadow = this.attachShadow({ mode: "open" });
	
	var zc = new ZoomableImageCarousel(shadow);
	var wrapper = zc.make_carousel_wrapper(this);

	shadow.appendChild(wrapper);

	var id;
	
	if (location.hash != ""){
	    var hash = location.hash.substr(1);
	    id = parseInt(hash);
	}

	zc.assign(id);	
  }
}

customElements.define("zoomable-image-carousel-custom", ZoomableImageCarouselCustom);

