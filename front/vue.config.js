module.exports = {
    runtimeCompiler: true,
    devServer: {
        port: 3333,
        host: "87.106.255.115",
        public: "87.106.255.115:3333",
        disableHostCheck: true,
        proxy: {
            "/api": {
                target: "http://127.0.0.1:8080",
                changeOrigin: true,
                ws: true,
            },
            "/socket.io": {
                target: "http://127.0.0.1:8080",
                changeOrigin: true,
                ws: true,
            },
        },
    },
    assetsDir: "assets",
    productionSourceMap: false,
    lintOnSave: false,
};
