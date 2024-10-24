const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './dist/index.html',
        }),
        new MiniCssExtractPlugin({ filename: 'style.css' })
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'], // Add other extensions as needed
        fallback: {
            toast: require.resolve("toastr")
        },
    },
    mode: 'development',
};
