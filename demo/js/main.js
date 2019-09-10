document.addEventListener("DOMContentLoaded", function(event) {
	var defaultCarousel = new DDCarousel({
		container: ".default"
	});

	var items = new DDCarousel({
		container: ".items",
		items: 3,
		nav: true,
		dots: false
	});

	var autoHeight = new DDCarousel({
		container: ".autoHeight",
		items: 3,
		autoHeight: true
	});

	var responsive = new DDCarousel({
		container: ".responsive",
		items: 2,
		responsive: true
	});

	var disabledTouch = new DDCarousel({
		container: ".disabledTouch",
		items: 3,
		touch: false
	});

	var disabledTouchMouse = new DDCarousel({
		container: ".disabledTouchMouse",
		items: 3,
		touchMouse: false
	});

	var customLabels = new DDCarousel({
		container: ".customLabels",
		items: 3,
		dots: false,
		nav: true,
		labelNavPrev: "&#x2190;",
		labelNavNext: "&#x2192;"
	});

	var customAnimConfig = new DDCarousel({
		container: ".customAnimConfig",
		items: 3,
		touchSwipeThreshold: 1,
		touchMaxSlideDist: 1000,
		swipeSmooth: 1,
		slideChangeDuration: 1.2
	});

	var eventsExample = new DDCarousel({
		container: ".eventsExample",
		items: 3
	});

	var eventLog = document.getElementById("eventLog");

	document.getElementById("resizeContainer").addEventListener("click", function() {
		document.getElementsByClassName("eventsExample")[0].style.width = Math.floor(Math.random() * 80) + 50 + "%";
		eventsExample.calculateStage();
		eventLog.scrollTop = eventLog.scrollHeight;
	});

	eventsExample.on("changed", function() {
		eventLog.innerHTML += "Slide changed\r\n";
		eventLog.scrollTop = eventLog.scrollHeight;
	});

	eventsExample.on("drag", function() {
		eventLog.innerHTML += "Drag\r\n";
		eventLog.scrollTop = eventLog.scrollHeight;
	});

	eventsExample.on("dragged", function() {
		eventLog.innerHTML += "Dropped\r\n";
		eventLog.scrollTop = eventLog.scrollHeight;
	});

	eventsExample.on("resized", function() {
		eventLog.innerHTML += "Resized\r\n";
		eventLog.scrollTop = eventLog.scrollHeight;
	});

	var methods = new DDCarousel({
		container: ".methods"
	});

	var info = document.getElementById("methodsInfo");

	document.getElementById("prev").addEventListener("click", function() {
		methods.prevSlide();
	});

	document.getElementById("next").addEventListener("click", function() {
		methods.nextSlide();
	});

	document.getElementById("go").addEventListener("click", function() {
		var index = parseInt(document.getElementById("slideNum").value - 1);
		methods.changeSlide(index);
	});

	document.getElementById("calc").addEventListener("click", function() {
		methods.calculateStage();
	});

	document.getElementById("getCurrent").addEventListener("click", function() {
		info.innerHTML = methods.getCurrentSlide();
	});

	document.getElementById("getInfo").addEventListener("click", function() {
		var output =
			"Current slide:" +
			methods.getCurrentSlide() +
			"<br/>Current page:" +
			methods.getCurrentPage() +
			"<br/>Total slides:" +
			methods.getTotalSlides();
		info.innerHTML = output;
	});
});
