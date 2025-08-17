"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const url_1 = require("url");
const path_1 = require("path");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_1.dirname)(__filename);
exports.config = {
    port: 3001,
    dataDir: (0, path_1.join)(__dirname, 'data'),
    ordersFile: 'orders.json'
};
