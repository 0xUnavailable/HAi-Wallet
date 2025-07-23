"use strict";
// nlpIntentParser.ts
// Lightweight NLP intent parser for mapping user input to API actions
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIntent = parseIntent;
function parseIntent(userInput) {
    const input = userInput.toLowerCase();
    if (input.includes('swap'))
        return 'swap';
    if (input.includes('bridge'))
        return 'bridge';
    if (input.includes('send') || input.includes('transfer'))
        return 'transfer';
    if (input.includes(' and ') || input.includes('split'))
        return 'multi';
    return 'unknown';
}
