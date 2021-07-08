"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDirSync = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function readDirSync(p, ret = []) {
    return fs_1.default.readdirSync(p).reduce((_ret, element) => {
        const _path = path_1.default.join(p, element);
        if (fs_1.default.statSync(_path).isDirectory()) {
            return [...ret, ...readDirSync(_path, ret)];
        }
        else {
            const txt = JSON.parse(fs_1.default.readFileSync(_path, {
                encoding: 'utf-8'
            }));
            _ret.push(txt);
        }
        return _ret;
    }, ret);
}
exports.readDirSync = readDirSync;
console.log(__dirname, path_1.default.join(__dirname, '../../videos'));
const res = readDirSync(path_1.default.join(__dirname, '../../videos'));
console.log(JSON.stringify(res));
