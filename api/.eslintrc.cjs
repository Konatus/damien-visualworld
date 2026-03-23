module.exports = {
    root: true,
    parser: "babel-eslint",
    env: {
        node: true,
        es6: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:prettier/recommended",
    ],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-unused-vars": ["error", { varsIgnorePattern: "[iI]gnored" }],
    },
};
