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
	this._links = {};
	this._attrs = {};
	
	var images = this.querySelectorAll("img");
	
	var images = document.getElementsByClassName("zoomable-carousel-image");
	var count = images.length;
	
	if (count < this.visible) {
	    this.setAttribute("class", "zoomable-carousel-" + count);
	}

	for (var i=0; i < count; i++){
	    
	    var img_el = images[i];
	    var img_src = img_el.getAttribute("src");
	    
	    this._images.push(img_src);
	    
	    // self.preload(img_src);
	    
	    var data_attributes = {};
	    
	    var attrs = img_el.attributes;
	    var count_attrs = attrs.length;
	    
	    for (var j=0; j< count_attrs; j++){
		
		var attr = attrs[j];
		var key = attr.name;
		
		if (! key.startsWith("data-")){
		    continue;
		}
		
		var short_key = key.replace("data-", "");
		data_attributes[short_key] = attr.value;
	    }
	    
	    _attrs[img_src] = data_attributes;
	    
	    var parent = img_el.parentNode;
	    
	    if (parent.nodeName == "A"){
		var link = parent.getAttribute("href");
		this.links[ img_src ] = link
		parent = parent.parentNode;
	    }
	    
	    parent.style.display = "none";
	}
	
	var rewind_el = document.createElement("li");
	rewind_el.setAttribute("id", "zoomable-carousel-control-rewind");
	rewind_el.setAttribute("class", "zoomable-carousel-item zoomable-carousel-control");
	rewind_el.appendChild(document.createTextNode("<"));
	
	rewind_el.onclick = self.rewind;	    
	
	this.appendChild(rewind_el);
	
	var panes = this.visible;
	
	if (count < this.visible){
	    panes = count;
	}
	
	for (var i=0; i < panes; i++){
	    
	    var j = (i == 0) ? count - 1 : i - 1;
	    
	    var img_src = this.images[j];
	    var img_node = document.createElement("img");
	    
	    img_node.setAttribute("class", "zoomable-carousel-item zoomable-carousel-visible");
	    img_node.setAttribute("data-index", j);		
	    img_node.setAttribute("src", img_src);
	    
	    if (link){
		img_node.onclick = function(e){
		    var el = e.target;
		    var src = el.getAttribute("src");
		    var attrs = _attrs[src];
		    var id = attrs["image-id"];
		    
		    // self.assign(id);
		    return false;
		};
	    }
	    
	    var item_node = document.createElement("li");
	    item_node.setAttribute("class", "zoomable-carousel-item");
	    item_node.appendChild(img_node);
	    
	    this.appendChild(item_node);
	}
	
	var advance_el = document.createElement("li");
	advance_el.setAttribute("id", "zoomable-carousel-control-advance");
	advance_el.setAttribute("class", "zoomable-carousel-item zoomable-carousel-control");
	advance_el.appendChild(document.createTextNode(">"));
	
	advance_el.onclick = self.advance;
	this.appendChild(advance_el);

	// auto-load a specific image based on the presence of its ID in location.hash

	// var wrapper = document.createElement("div");
	// this.parentNode.replaceChild(wrapper, this);
    }
}

customElements.define('zoomable-image-carousel', ZoomableImageCarouselElement, { extends: "ul" });
