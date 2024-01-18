var zoomable = zoomable || {};

zoomable.carousel = (function(){

    var _images = [];
    var _links = {};
    var _attrs = {};

    var _visible = 3;

    var _carousel;

    var self = {

	'init': function(){

	    var carousel = document.getElementById("zoomable-carousel");

	    if (! carousel){
		return;
	    }

	    _carousel = carousel;

	    var images = document.getElementsByClassName("zoomable-carousel-image");
	    var count = images.length;

	    if (count < _visible) {
		carousel.setAttribute("class", "zoomable-carousel-" + count);
	    }

	    for (var i=0; i < count; i++){

		var img_el = images[i];
		var img_src = img_el.getAttribute("src");

		_images.push(img_src);

		self.preload(img_src);

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
		    _links[ img_src ] = link
		    parent = parent.parentNode;
		}

		parent.style.display = "none";
	    }

	    var rewind_el = document.createElement("li");
	    rewind_el.setAttribute("id", "zoomable-carousel-control-rewind");
	    rewind_el.setAttribute("class", "zoomable-carousel-item zoomable-carousel-control");
	    rewind_el.appendChild(document.createTextNode("<"));

	    rewind_el.onclick = self.rewind;	    

	    _carousel.appendChild(rewind_el);

	    var panes = _visible;

	    if (count < _visible){
		panes = count;
	    }

	    for (var i=0; i < panes; i++){

		var j = (i == 0) ? count - 1 : i - 1;

		var img_src = _images[j];
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
			self.assign(id);
			return false;
		    };
		}

		var item_node = document.createElement("li");
		item_node.setAttribute("class", "zoomable-carousel-item");
		item_node.appendChild(img_node);

		_carousel.appendChild(item_node);
	    }
		
	    var advance_el = document.createElement("li");
	    advance_el.setAttribute("id", "zoomable-carousel-control-advance");
	    advance_el.setAttribute("class", "zoomable-carousel-item zoomable-carousel-control");
	    advance_el.appendChild(document.createTextNode(">"));

	    advance_el.onclick = self.advance;
	    _carousel.appendChild(advance_el);

	    // auto-load a specific image based on the presence of its ID in location.hash

	    if (location.hash != ""){
		var hash = location.hash.substr(1);
		var id = hash;
		self.assign(id);
	    }

	    self.show();
	},

	'init_keyboard': function(){

	    document.addEventListener('keydown', function(e){
		
		if (e.keyCode == 37){
		    self.rewind();
		}
		
		if (e.keyCode == 39){
		    self.advance();
		}
		
	    });

	    var el = document.getElementById("pagination-blurb");

	    // https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser/45666491#45666491
	    var is_mobile = /Mobi/i.test(window.navigator.userAgent)

	    if ((el) && (! is_mobile)){

		var previous = document.createElement("span");
		previous.setAttribute("class", "hey-look");
		previous.setAttribute("style", "color:#555;");
		previous.appendChild(document.createTextNode("←"));
		
		var next = document.createElement("span");
		next.setAttribute("class", "hey-look");
		next.setAttribute("style", "color:#555;");
		next.appendChild(document.createTextNode("→"));
		
		el.appendChild(document.createTextNode("you can also use the "));
		el.appendChild(previous);
		el.appendChild(document.createTextNode(" and "));
		el.appendChild(next);
		el.appendChild(document.createTextNode(" arrow keys on your keyboard to navigate between images"));      

		el.style.display = "block";
	    }
	},

	'carousel': function(){
	    return _carousel;
	},
	
	'show': function(){
	    _carousel.style.display = "grid";
	},

	'hide': function(){
	    _carousel.style.display = "none";
	},

	'assign': function(id){

	    var visible = document.getElementsByClassName("zoomable-carousel-visible");
	    var count_visible = visible.length;

	    // var current_idx = self.index_for_center();
	    var current_idx = Math.floor(count_visible / 2);

	    var new_idx = self.index_for_id(id);

	    if (new_idx == -1){
		console.log("Can't determine new index");
		return false;
	    }

	    var current_el = visible[current_idx];

	    if (! current_el){
		console.log("Can't get element for index " + current_idx);
		return false;
	    }

	    var current_src = current_el.getAttribute("src");
	    var current_attrs = _attrs[current_src];

	    var new_src = _images[new_idx];
	    var new_attrs = _attrs[new_src];

	    self.update(current_attrs, new_attrs);

	    // now update the bookends

	    var count_images = _images.length;

	    var center_el = visible[current_idx];
	    center_el.setAttribute("src", new_src);
	    center_el.setAttribute("data-index", new_idx);

	    for (var i=0; i < current_idx; i++){
		
		var j = i + 1;

		var prev_idx = (new_idx == 0) ? count_images - 1 : new_idx - j;
		var prev_src = _images[prev_idx];

		var prev_el = visible[i];
		prev_el.setAttribute("src", prev_src);
		prev_el.setAttribute("data-index", prev_idx);
	    }

	    for (var i= (current_idx + 1); i < count_visible; i++){

		var next_idx = (new_idx == (count_images - 1)) ? 0 : new_idx + 1;
		var next_src = _images[next_idx];

		var next_el = visible[i];
		next_el.setAttribute("src", next_src);
		next_el.setAttribute("data-index", next_idx);
	    }
	},

	/*
	'index_for_center': function(){
	    var count = _images.length;
	    var center = Math.floor(count / 2);
	    return center;
	},
	*/

	'index_for_id': function(id){

	    var idx = -1;
	    var count = _images.length;

	    for (var i=0; i < count; i++){

		var src = _images[i];
		var attrs = _attrs[src];

		if (attrs["image-id"] == id){
		    idx = i;
		    break;
		}
	    }

	    return idx;
	},

	'advance': function(e){

	    var count_images = _images.length;
	    
	    var visible = document.getElementsByClassName("zoomable-carousel-visible");
	    var count = visible.length;
	    
	    var center = Math.floor(count / 2);	// AGAIN, account for image count of 2

	    for (var i=0; i < count; i++){
		
		var el = visible[i];
		
		var src = el.getAttribute("src");

		var idx = el.getAttribute("data-index");
		idx = parseInt(idx);
		
		var next_idx = (idx == 0) ? count_images - 1 : idx - 1;
		var next_src = _images[next_idx];

		el.setAttribute("src", next_src);
		el.setAttribute("data-index", next_idx);

		if (i == center){
		    var current_attrs = _attrs[src];
		    var next_attrs = _attrs[next_src];
		    self.update(current_attrs, next_attrs);
		}
	    }
	},

	'rewind': function(){

	    var count_images = _images.length;
	    
	    var visible = document.getElementsByClassName("zoomable-carousel-visible");
	    var count = visible.length;

	    var center = Math.floor(count / 2);

	    for (var i=0; i < count; i++){
		
		var el = visible[i];
		
		var src = el.getAttribute("src");
		var idx = el.getAttribute("data-index");
		idx = parseInt(idx);
		
		var prev_idx = (idx == (count_images - 1)) ? 0 : idx + 1;
		var prev_src = _images[prev_idx];

		el.setAttribute("src", prev_src);
		el.setAttribute("data-index", prev_idx);

		if (i == center){
		    var current_attrs = _attrs[src];
		    var prev_attrs = _attrs[prev_src];
		    self.update(current_attrs, prev_attrs);
		}
	    }
	},
	
	'update': function(current_attrs, updated_attrs){

	    // console.log("CURRENT", current_attrs);
	    // console.log("UPDATED", updated_attrs);

	    location.hash = updated_attrs["image-id"];

	    console.log("CAROUSEL", "zoomable-image-" + current_attrs["image-id"]);

	    var updated_zoomable = zoomable.builder.make_zoomable_element(updated_attrs);
	    var current_zoomable = document.getElementById("zoomable-image-" + current_attrs["image-id"]);

	    // console.log("CURRENT", current_zoomable);
	    // console.log("UPDATED", updated_zoomable);

	    current_zoomable.parentNode.replaceChild(updated_zoomable, current_zoomable);
	    zoomable.images.init(updated_zoomable);

	    var updated_id = updated_zoomable.getAttribute("data-image-id");
	    var img_id = "zoomable-picture-default-" + updated_id;

	    var im = document.getElementById(img_id);

	    im.onload = function() {

		var w = this.width;
		var h = this.height;
		
		if (h = w){
		    zoomable.images.resize_visible();
		}
	    };

	},

	'preload': function(img_src){

	    // This needs to be reconciled with source_map
	    // in zoomable.builder.js

	    var others = [
		"b", "c", "z", "n", "s",
	    ];

	    var count = others.length;

	    setTimeout(function(){

		for (var i=0; i < count; i++){

		    var src = img_src.replace("_s", "_" + others[i]);
		    var el = document.createElement("img");

		    el.onload = function(){
			// 
		    };
		    
		    el.src = src;
		}

	    }, 0);

	}
    };

    return self;
})();
