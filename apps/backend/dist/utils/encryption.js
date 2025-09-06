"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptSettings = exports.encryptSettings = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fallback-key-change-in-production';
const encryptSettings = (text) => {
    try {
        return crypto_js_1.default.AES.encrypt(text, ENCRYPTION_KEY).toString();
    }
    catch (error) {
        console.error('Encryption failed:', error);
        return text; // Return plaintext if encryption fails
    }
};
exports.encryptSettings = encryptSettings;
const decryptSettings = (encryptedText) => {
    try {
        const bytes = crypto_js_1.default.AES.decrypt(encryptedText, ENCRYPTION_KEY);
        return bytes.toString(crypto_js_1.default.enc.Utf8);
    }
    catch (error) {
        console.error('Decryption failed:', error);
        return encryptedText; // Return as-is if decryption fails
    }
};
exports.decryptSettings = decryptSettings;
