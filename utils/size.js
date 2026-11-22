import fs from "node:fs";
import zlib from "node:zlib";

const files = [
    "dist/ddcarousel.esm.js",
    "dist/ddcarousel.min.css",
];

for (const file of files) {
    const buffer = fs.readFileSync(file);
    const gzip = zlib.gzipSync(buffer);

    console.log(file);
    console.log(`  raw:  ${(buffer.length / 1024).toFixed(2)} KB`);
    console.log(`  gzip: ${(gzip.length / 1024).toFixed(2)} KB`);
}