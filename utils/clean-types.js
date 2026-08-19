import fs from "fs";
import path from "path";

const typesDir = path.resolve("dist/types");

if (fs.existsSync(typesDir)) {
    fs.rmSync(typesDir, {
        recursive: true,
        force: true
    });
    console.log("Removed dist/types folder!");
}