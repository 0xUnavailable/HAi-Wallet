import { IPlugin } from '../../../packages/core/plugin/IPlugin';

export const HelloWorldPlugin: IPlugin = {
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