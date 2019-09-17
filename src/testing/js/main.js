document.addEventListener("DOMContentLoaded", function(event) {
	var slider = new DDCarousel({
		container: ".ddcarousel",
		items: 3,
		nav: true,
		dots: true,
		autoHeight: false,
		responsive: false,
		touch: true,
		touchMouse: true,
		centerSlide: false,

		//touchSwipeThreshold: 10
		//touchMaxSlideDist: 100
		swipeSmooth: 0.1,
		slideChangeDuration: 0.9,

		labelNavPrev: "&#x2190;",
		labelNavNext: "&#x2192;"
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
		slider.changeSlide(index);
	});

	document.getElementById("calc").addEventListener("click", () => {
		slider.calculateStage();
	});

	var text = document.getElementById("console");

	//events
	slider.on("changed", () => {
		text.innerHTML += "Changed slide\r\n";
		text.scrollTop = text.scrollHeight;
	});

	slider.on("drag", () => {
		text.innerHTML += "Drag\r\n";
		text.scrollTop = text.scrollHeight;
	});

	slider.on("dragged", () => {
		text.innerHTML += "Dropped\r\n";
		text.scrollTop = text.scrollHeight;
	});

	slider.on("resized", () => {
		text.innerHTML += "Resized\r\n";
		text.scrollTop = text.scrollHeight;
	});

	document.getElementById("resizeContainer").addEventListener("click", () => {
		document.getElementsByClassName("ddcarousel")[0].style.width = Math.floor(Math.random() * 101) + 50 + "%";
		slider.calculateStage();
	});

	document.getElementById("getDetails").addEventListener("click", () => {
		text.innerHTML += "Current slide:" + slider.getCurrentSlide() + "\r\n";
		text.innerHTML += "Current page:" + slider.getCurrentPage() + "\r\n";
		text.innerHTML += "Total slides:" + slider.getTotalSlides() + "\r\n";
		text.scrollTop = text.scrollHeight;
	});
});
