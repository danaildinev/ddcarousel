// Append license header to build files
const fs = require('fs/promises');
const path = require('path');

const targetFiles = [
    './dist/ddcarousel.js',
    './dist/ddcarousel.min.js',
    './dist/ddcarousel.min.css',
];

async function buildLicenseHeader() {
    const file = path.resolve('./package.json');
    const fileText = await fs.readFile(file, 'utf8');
    const package = JSON.parse(fileText);

    // output -> /*! ddcarousel v1.4.2 | MIT | https://github.com/user/ddcarousel */
    return `/*! ${package.name} v${package.version} | ${package.license} | ${package.repository.url} */\n`;
}

async function prependLicense(file, license) {
    const content = await fs.readFile(file, 'utf8');
    await fs.writeFile(file, license + content, 'utf8');
    console.log("\x1b[32m", `License appended to ${file} successfully 😊`);
}

async function main() {
    try {
        const license = await buildLicenseHeader();
        await Promise.all(
            targetFiles.map(file => prependLicense(file, license))
        );
    } catch (err) {
        console.error('Failed to append license', err);
        process.exit(1);
    }
}

main();

