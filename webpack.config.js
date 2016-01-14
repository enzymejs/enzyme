module.exports = {
    entry: './build/index.js',
    output: {
        path: 'dist',
        filename: 'enzyme.amd.js',
        libraryTarget: 'amd'
    },
    module: {
        loaders: [
            { test: /\.json$/i, loader: 'json' }
        ]
    }
}
