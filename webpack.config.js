import path from "path";
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const baseConfig = () => ({
    entry: "./src/ddcarousel.ts",
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
        extensions: [".ts", ".js",]
    }
});

function umdProdConfig() {
    return {
        ...baseConfig(),
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
        ],
        optimization: {
            minimize: true,
        },
    }
}

function esmDevConfig() {
    return {
        ...baseConfig(),
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

export default (env = {}) => {
    if (env?.dev)
        return esmDevConfig();

    return umdProdConfig();
};