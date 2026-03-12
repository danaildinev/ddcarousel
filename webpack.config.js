import path from "path";
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";
import pkg from './package.json' with { type: 'json' };
import TerserPlugin from "terser-webpack-plugin";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const licenseMsg = `/*! 
* ${pkg.name} v${pkg.version}
* (c) ${new Date().getFullYear()} ${pkg.author} 
* MIT License
* ${pkg.repository.url}
*/`;

const createBaseConfig = (sassStyle = "compressed") => ({
    entry: "./src/ddcarousel.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true
                    }
                },
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                style: sassStyle,
                            },
                        },
                    },
                ],
            }]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
});

// ESM dev build (used for internal testing)
function esmDevConfig() {
    // esm build - dev
    return {
        ...createBaseConfig("expanded"),
        mode: "development",
        devtool: "source-map",
        watch: true,
        output: {
            path: path.resolve(__dirname, "testing"),
            filename: "ddcarousel.esm.js",
            library: {
                type: "module"
            }
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
                directory: path.join(__dirname, "testing"),
            },
            compress: true,
            port: 9000,
        },
        experiments: {
            outputModule: true
        },
        optimization: {
            minimize: false
        }
    };
}

// ESM production build (for modern browsers - to use by vite, webpack or any modern app)
function esmProdConfig() {
    return {
        ...createBaseConfig("expanded"),
        mode: "production",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "ddcarousel.esm.js",
            library: {
                type: "module"
            }
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
                        compress: false,
                        mangle: false,
                        format: {
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

// UMD build (for browsers <script>, minified)
function umdConfig() {
    return {
        ...createBaseConfig(),
        mode: "production",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "ddcarousel.umd.min.js",
            library: {
                name: "ddcarousel",
                type: "umd",
                export: 'default'
            },
            globalObject: "this"
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "ddcarousel.min.css"
            }),
            new webpack.BannerPlugin({
                banner: licenseMsg,
                raw: true,
                entryOnly: true
            })
        ],
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: {
                        format: {
                            comments: /@license|^!/ // preserve only license banner
                        }
                    }
                })
            ]
        },
    }
}

export default (env = {}) => {
    if (env?.dev)
        return esmDevConfig();

    return [
        esmProdConfig(),
        umdConfig(),
    ];
};