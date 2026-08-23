import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const carouselUmd = "ddcarousel.umd.min.js";
const carouselCss = "ddcarousel.min.css";

const sourceDir = path.resolve("dist");
const targetDirJs = path.resolve("demo/js");
const targetDirCss = path.resolve("demo/css");

await mkdir(targetDirJs, { recursive: true });
await mkdir(targetDirCss, { recursive: true });

await Promise.all([
    copyFile(path.join(sourceDir, carouselUmd), path.join(targetDirJs, carouselUmd)),
    copyFile(path.join(sourceDir, carouselCss), path.join(targetDirCss, carouselCss))
]);

console.log("UMD and CSS files copied to demo");