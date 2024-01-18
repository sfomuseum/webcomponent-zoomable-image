class ZoomableImageCarouselElement extends HTMLULElement {

    constructor() {
	super();
    }
    
    connectedCallback(){
	
	var li_els = this.querySelectorAll("li");

	var wrapper = document.createElement("div");

	this.parentNode.replaceChild(wrapper, this);
    }
}

customElements.define('zoomable-image-carousel', ZoomableImageElement, { extends: "ul" });
