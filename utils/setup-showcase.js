import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const carouselUmd = "ddcarousel.umd.min.js";
const carouselCss = "ddcarousel.min.css";

const sourceDir = path.resolve("dist");
const targetDir = path.resolve("showcase/dist");

await mkdir(targetDir, { recursive: true });

await Promise.all([
    copyFile(path.join(sourceDir, carouselUmd), path.join(targetDir, carouselUmd)),
    copyFile(path.join(sourceDir, carouselCss), path.join(targetDir, carouselCss))
]);

console.log("ddcarousel UMD and CSS files copied to showcase folder");