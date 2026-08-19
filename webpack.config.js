import path from "path";
import { fileURLToPath } from 'url';
import { rmSync } from "fs";

import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";

import pkg from './package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const DIST_DIR = path.resolve(__dirname, "dist");
const TESTING_DIR = path.resolve(__dirname, "testing");

const licenseMsg = `/*! 
* ${pkg.name} v${pkg.version}
* (c) 2019-${new Date().getFullYear()} ${pkg.author} 
* MIT License / ${pkg.repository.url}
*/`;

const createBaseConfig = (sassStyle = "compressed", sourceMap = false) => ({
    entry: "./src/ddcarousel.ts",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        // Type checking is handled separately by typescript.
                        // This keeps the webpack compilation faster.
                        transpileOnly: true
                    }
                },
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap,
                            sassOptions: {
                                style: sassStyle
                            }
                        }
                    }
                ],
            }]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
});

// ESM dev build (used only for local development/testing). Unminified and uncluded source maps for easier debugging.
function esmDevConfig() {
    return {
        ...createBaseConfig("expanded", true),
        name: "esm-dev",
        mode: "development",
        devtool: "source-map",
        watch: true,
        output: {
            path: TESTING_DIR,
            filename: "ddcarousel.esm.js",
            library: {
                type: "module"
            },
            module: true
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "ddcarousel.css"
            })
        ],
        devServer: {
            /*devMiddleware: {
                writeToDisk: true
            },*/
            static: {
                directory: TESTING_DIR,
            },
            compress: true,
            port: 9000,
        },
        experiments: {
            outputModule: true // native ESM library output.
        },
        optimization: {
            minimize: false
        }
    };
}

// ESM production build (for package managers and modern bundlers such as vite, webpack...l)
function esmProdConfig() {
    return {
        ...createBaseConfig("expanded", false),
        name: "esm",
        mode: "production",
        devtool: false, // do not publish ESM source maps
        output: {
            path: DIST_DIR,
            filename: "ddcarousel.esm.js",
            // Lazy-loaded modules receive names such as ddcarousel-loop.esm.js.
            // Dynamic import must have a webpackChunkName.
            chunkFilename: "[name].esm.js",
            publicPath: "auto",
            library: {
                type: "module"
            },
            module: true
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "ddcarousel.css"
            }),
            new webpack.BannerPlugin({
                banner: licenseMsg,
                raw: true,
                entryOnly: true
            })
        ],
        optimization: {
            minimize: true, // removes user comments
            minimizer: [
                new TerserPlugin({
                    extractComments: false, // prevent .LICENSE.txt
                    terserOptions: {
                        module: true, // use optimizations for ESM
                        compress: { // run compression more than once and find additional simplifications
                            passes: 2
                        },
                        mangle: true, // shorten local variable/function names
                        format: { // preserve license comments only
                            comments: /@license|^!/
                        }
                    }
                })
            ]
        },
        experiments: {
            outputModule: true
        },
    }
};

// UMD bowser build (for browsers classic <script> usage)
function umdConfig(minified = false) {
    const suffix = minified ? ".min" : "";
    return {
        // keep the normal UMD build readable and compress sass only for the minified production artifact.
        ...createBaseConfig(minified ? "compressed" : "expanded", minified),
        name: minified ? "umd-min" : "umd",
        mode: "production",
        devtool: minified ? "source-map" : false, // the readable UMD build does not need a source map, use only in prod build
        output: {
            path: DIST_DIR,
            filename: `ddcarousel.umd${suffix}.js`,
            library: {
                name: "ddcarousel",
                type: "umd",
                export: "default"
            },
            globalObject: "this"
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: `ddcarousel${suffix}.css`
            }),
            new webpack.BannerPlugin({
                banner: licenseMsg,
                raw: true,
                entryOnly: true
            }),
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1 // no chunks, umd must be a self-contained browser file
            })
        ],
        optimization: {
            minimize: minified,
            ...(minified && {
                minimizer: [
                    new TerserPlugin({
                        extractComments: false,
                        terserOptions: {
                            compress: {
                                passes: 2
                            },
                            mangle: true,
                            format: {
                                comments: /@license|^!/ // preserve only license banner
                            }
                        }
                    })
                ]
            })
        }
    };
}

export default (env = {}) => {
    if (env.dev) {
        return esmDevConfig();
    }

    rmSync(DIST_DIR, {
        recursive: true,
        force: true
    });

    return [
        esmProdConfig(),
        umdConfig(),
        umdConfig(true)
    ];
};