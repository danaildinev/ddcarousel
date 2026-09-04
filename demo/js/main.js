import { demoConfigs } from "./demo-configs.js";

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.In nec lectus et erat commodo ornare. 
Ut dictum lectus ac aliquet ultrices. Morbi vitae mauris felis. Praesent cursus, massa vitae ultrices cursus, 
mi erat gravida elit, ac fringilla metus nisl eget elit. Aliquam erat volutpat. Lorem ipsum dolor sit amet, 
consectetur adipiscing elit. In nec lectus et erat commodo ornare. Ut dictum lectus ac aliquet ultrices. Morbi mi 
erat gravida elit, ac fringilla metus nisl eget elit. Aliquam erat volutpat. Aliquam erat volutpat. Lorem ipsum 
dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.In nec lectus et erat commodo ornare. 
Ut dictum lectus ac aliquet ultrices. Morbi vitae mauris felis. Praesent cursus, massa vitae ultrices cursus, 
mi erat gravida elit, ac fringilla metus nisl eget elit. Aliquam erat volutpat. Lorem ipsum dolor sit amet, 
consectetur adipiscing elit. In nec lectus et erat commodo ornare. Ut dictum lectus ac aliquet ultrices. Morbi mi 
erat gravida elit, ac fringilla metus nisl eget elit. Aliquam erat volutpat. Aliquam erat volutpat. Lorem ipsum 
dolor sit amet, consectetur adipiscing elit.`;

export const preview = {
	title: document.querySelector(".demo__preview-title"),
	description: document.querySelector(".demo__preview-description"),
	meta: document.querySelector(".demo__preview-meta"),
	content: document.querySelector(".demo__preview-content"),
	footer: document.querySelector(".demo__preview-footer"),
	events: document.querySelector(".demo__preview-events"),
	actions: document.querySelector(".demo__preview-actions"),
	extra: document.querySelector(".demo__preview-extra"),
};

let sidebar;
let carousel;

let statusPopup;
let statusPopupTitle;
let statusPopupContent;

document.addEventListener("DOMContentLoaded", () => {
	statusPopup = document.querySelector("#statusPopup");
	statusPopupTitle = document.querySelector("#statusPopup__title");
	statusPopupContent = document.querySelector("#statusPopup__content");

	document.querySelector("#statusPopup__close").addEventListener("click", () => statusPopup.close());

	sidebar = document.querySelector(".demos__sidebar");
	sidebar.addEventListener("click", е => {
		const button = е.target.closest("button[data-demo]");
		loadDemo(button);
	});

	const initialDemo = sidebar.querySelector('button[data-demo="default"]');
	if (initialDemo) {
		loadDemo(initialDemo);
	}
});

async function loadDemo(button, configOverrides = {}) {
	const { key } = getDemoContent(button);
	const demo = demoConfigs[key];

	setActiveButton(button);

	if (carousel) {
		carousel.destroy(true);
		carousel = null;
	}

	resetPreview();
	setPreviewContent(button);

	if (typeof demo.render === "function") {
		demo.render();
	} else {
		createCarousel(demo.slides, demo.renderOptions ?? {});
	}

	const demoConfig = demo.config;
	const config = {
		container: ".demo-carousel",
		...demoConfig,
		...configOverrides,
	};

	try {
		const context = {
			carousel,
			button,
			key,
			config,
			reload(configOverride = {}) {
				return loadDemo(button, { ...configOverrides, ...configOverride });
			},
		};

		context.carousel = window.ddcarousel();

		if (typeof demo.beforeInit === "function") {
			demo.beforeInit(context);
		}

		await context.carousel.init(config);

		addStandardActions(context);

		if (typeof demo.actions === "function") {
			demo.actions(context);
		}

		if (typeof demo.afterInit === "function") {
			demo.afterInit(context);
		}
	} catch (error) {
		console.error(error);
		preview.meta.textContent = "Failed to initialize demo";
		writeOutput(error.message);
	}
}

export function getCarousel() {
	return carousel;
}

function getDemoContent(button) {
	return {
		key: button.dataset.demo.trim() ?? "",
		title: button.querySelector(".demos__title")?.textContent.trim() ?? "",
		description: button.querySelector(".demos__description")?.textContent.trim() ?? "",
		meta: button.querySelector(".demos__meta")?.textContent.trim() ?? "",
	};
}

function setPreviewContent(button) {
	const { title, description, meta } = getDemoContent(button);

	preview.title.textContent = title;
	preview.description.textContent = description;
	preview.meta.textContent = meta;
	preview.description.hidden = !description;
	preview.meta.hidden = !meta;
}

function resetPreview() {
	preview.title.textContent = "";
	preview.description.textContent = "";
	preview.meta.textContent = "";

	preview.content.replaceChildren();
	preview.actions.replaceChildren();
	preview.extra.replaceChildren();
	preview.events.replaceChildren();

	preview.content.removeAttribute("style");
	delete preview.content.dataset.resized;
}

function setActiveButton(button) {
	sidebar.querySelector("button[data-demo].active")?.classList.remove("active");
	button.classList.add("active");
}

function createOutput() {
	let output = preview.extra.querySelector(".demos__runtime-output");
	if (!output) {
		output = document.createElement("pre");
		output.className = "demos__runtime-output";

		preview.extra.append(output);
	}

	return output;
}

function writeOutput(value) {
	createOutput().textContent = stringify(value);
	console.log(value);
}

function stringify(value) {
	try {
		return typeof value === "string" ? value : JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

const defaultMaxContentLength = 500;
function getRandomLoremTextLength(text, maxContentLength = defaultMaxContentLength) {
	const maxLength = Math.min(maxContentLength, text.length);
	const minLength = Math.min(20, maxLength);
	const length = minLength + Math.floor(Math.random() * (maxLength - minLength + 1));

	return text.slice(0, length).replace(/\s\w*$/, "");
}

export function createCarousel(slides = 12, { urlData = false, urlNavContainer = false, lazyImages = false, maxCotentLength, carouselClass } = {}) {
	const imageWidth = 500;
	const imageHeight = 500;

	const content = `
		${urlNavContainer ? `<nav class="demo-url-nav"></nav>` : ""}

		<div id="demo-carousel" class="ddcarousel demo-carousel ${carouselClass ?? ""}">
			${Array.from({ length: slides }, (_, index) => {

		const number = index + 1;
		const urlAttributes = urlData ? `data-id="slide-${number}" data-title="Slide ${number}"` : "";
		const content = lazyImages ? `<img data-src="images/img${number}.jpg" alt="Image ${number}" width="${imageWidth}" height="${imageHeight}">` : `${number}. ${getRandomLoremTextLength(loremIpsum, maxCotentLength)}`;;

		return `<div class="item-${number}" ${urlAttributes}>${content}</div>`;
	}).join("")}
		</div>
	`;

	preview.content.innerHTML = content;
	return preview.content.querySelector("#demo-carousel");
}

export function addAction(label, callback) {
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = label;

	button.addEventListener("click", async () => {
		try {
			await callback();
		} catch (error) {
			console.error(error);
		}
	});

	preview.actions.append(button);
	return button;
}

function addStandardActions(context) {
	addAction("Previous", () => context.carousel.prevPage());
	addAction("Next", () => context.carousel.nextPage());
	addAction("Get status", () => showModal("Status", stringify(context.carousel.getStatus())));
	addAction("Configuration", () => showModal("Configuration", stringify(context.config)));
}

function showModal(title, content) {
	statusPopupTitle.textContent = title
	statusPopupContent.textContent = content
	statusPopup.showModal();
}

export function animateWidth(element, targetWidth, duration = 2000) {
	const startWidth = element.getBoundingClientRect().width;
	const startTime = performance.now();

	function animate(time) {
		const progress = Math.min((time - startTime) / duration, 1);
		const width = startWidth + (targetWidth - startWidth) * progress;

		element.style.width = `${width}px`;

		window.dispatchEvent(new Event("resize"));

		if (progress < 1) {
			requestAnimationFrame(animate);
		}
	}

	requestAnimationFrame(animate);
}

export function throttle(callback, delay) {
	let lastCall = 0;

	return (...args) => {
		const now = performance.now();

		if (now - lastCall < delay) {
			return;
		}

		lastCall = now;
		callback(...args);
	};
}