"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createFromEnv(prefix, delimeter = "_") {
    const config = {};
    for (let [key, value] of Object.entries(process.env)) {
        let finder = new RegExp(`$${prefix}`, 'gi');
        if (finder.test(key)) {
            let configKey = key.replace(`${prefix}${delimeter}`, '');
            config[`${configKey}`] = value;
        }
    }
    return config;
}
exports.createFromEnv = createFromEnv;
function createExportedModule(config) {
    switch (process.env.NODE_ENV) {
        case 'production':
            return config.production;
        case 'dev':
            return config.dev;
        case 'test':
            return config.test;
        default:
            return config.dev;
    }
}
exports.createExportedModule = createExportedModule;
