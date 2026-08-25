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
	title: document.querySelector(".demos__preview-title"),
	description: document.querySelector(".demos__preview-description"),
	meta: document.querySelector(".demos__preview-meta"),
	content: document.querySelector(".demos__preview-content"),
	actions: document.querySelector(".demos__preview-actions"),
	extra: document.querySelector(".demos__preview-extra"),
};

let sidebar;

document.addEventListener("DOMContentLoaded", () => {
	sidebar = document.querySelector(".demos__sidebar");
	sidebar.addEventListener("click", е => {
		const button = е.target.closest("button[data-demo]");
		loadDemo(button);
	});

	const initialDemo = sidebar.querySelector('button[data-demo="#default"]');
	if (initialDemo) {
		loadDemo(initialDemo);
	}
});

async function loadDemo(button) {
	const { key } = getDemoContent(button);
	const demo = demoConfigs[key];

	setActiveButton(button);

	resetPreview();
	setPreviewContent(button);
	createCarousel(demo.slides);

	const demoConfig = demo.config;
	const config = {
		container: ".demo-carousel",
		...demoConfig,
	};
	const instance = getCarousel();
	const carousel = instance();
	const context = carousel;

	try {
		await carousel.init(config);
		renderConfig(config);
	} catch (error) {
		console.error(error);
		preview.meta.textContent = "Failed to initialize demo";
		writeOutput(error.message);
	}
}

export function getCarousel() {
	return window.ddcarousel;
}

function getDemoContent(button) {
	return {
		key: button.dataset.demo?.replace(/^#/, "") ?? "",
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
	createOutput().textContent = JSON.stringify(value);
}

function renderConfig(config) {
	const details = document.createElement("details");
	details.className = "demos__config";

	const summary = document.createElement("summary");
	summary.textContent = "Configuration";

	const pre = document.createElement("pre");
	pre.textContent = JSON.stringify(config, null, 2);

	details.append(summary, pre);
	preview.extra.append(details);
}

const getRandomLoremTextLength = t => t.slice(0, 100 + Math.floor(Math.random() * (t.length - 500))).replace(/\s\w+$/, "");

export function createCarousel(slides = 12) {
	const content = `
		<div class="ddcarousel demo-carousel">
			${Array.from({ length: slides }, (_, index) => {

		const number = index + 1;
		const content = `${number}. ${getRandomLoremTextLength(loremIpsum)}`;

		return `<div class="item-${number}">${content}</div>`;
	}).join("")}
		</div>
	`;

	preview.content.innerHTML = content;
	return preview.content.querySelector(".demo-carousel");
}


