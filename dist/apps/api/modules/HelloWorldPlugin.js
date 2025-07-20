"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorldPlugin = void 0;
exports.HelloWorldPlugin = {
    id: 'hello-world',
    name: 'Hello World Plugin',
    version: '1.0.0',
    type: 'demo',
    init: () => {
        console.log('HelloWorldPlugin (backend) initialized!');
    },
    dispose: () => {
        console.log('HelloWorldPlugin (backend) disposed!');
    },
};
