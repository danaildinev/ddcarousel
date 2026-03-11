import path from "path";
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export default () => {
    return [{
        entry: "./src/ddcarousel.ts",
        output: {
            path: path.resolve(__dirname, "testing"),
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
                        "sass-loader",
                    ],
                }]
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".mjs"]
        },
        mode: "development",
        devtool: "source-map",
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
        experiments: {
            outputModule: true
        },
        optimization: {
            minimize: false
        }
    }]
};