
var slider = new DDCarousel({
	container: ".ddcarousel",
	responsive: {
		768: {
			touchMouse: false,
			touch: false,
		}
	},
	itemsPerPage: 4,
	fullWidth: true,
	startPage: 0,
	//autoplay: true,
	itemPerPage: true,
	autoplayPauseHover: true
	/*itemsPerPage: 3,
	autoplayDuration: 1000,
	autoplayPauseOnHover: true,
	autoHeight: true,
	nav: true,
	dots: true,
	centerSlide: true,
	urlNav: true
	vertical: true,
	autoHeight: false,
	responsive: false,
	touch: true,
	touchMouse: true,
	
	touchSwipeThreshold: 10
	touchMaxSlideDist: 100
	swipeSmooth: 0.1,
	slideChangeDuration: 0.9,
	
	labelNavPrev: "&#x2190;",
	labelNavNext: "&#x2192;",
	
	onInitialize: e => {
		console.log(e);
		},
	onInitialized: e => {
		console.log(e);
	}
	onChanged: e => {
		console.log(e);
	} 
	onDrag: () => {
		console.log("drag");
	},
	onDragging: () => {
		console.log("dragging");
	},
	onDragged: () => {
		console.log("dragged");
	},
	onTransitionend: () => {
		console.log("transitionend");
	}*/
});

//available methods
document.getElementById("prev").addEventListener("click", () => {
	slider.prevSlide();
});

document.getElementById("next").addEventListener("click", () => {
	slider.nextSlide();
});

document.getElementById("go").addEventListener("click", () => {
	var index = parseInt(document.getElementById("slideNum").value);
	slider.changePage(index);
});

document.getElementById("calc").addEventListener("click", () => {
	slider.calculateStage();
});

//events

document.getElementById("resizeContainer").addEventListener("click", () => {
	document.getElementsByClassName("ddcarousel")[0].style.width =
		Math.floor(Math.random() * 101) + 50 + "%";
	slider.calculateStage();
});
