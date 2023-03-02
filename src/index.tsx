import { NativeModules, Platform, NativeEventEmitter } from 'react-native';

const LINKING_ERROR =
  `The package 'omikit-plugin' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const OmikitPlugin = NativeModules.OmikitPlugin
  ? NativeModules.OmikitPlugin
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function initCall(data: any): Promise<boolean> {
  console.log(data);
  return OmikitPlugin.initCall(data);
}

export function updateToken(data: any): Promise<void> {
  console.log(data);
  return OmikitPlugin.updateToken(data);
}

export function startCall(data: any): Promise<boolean> {
  console.log(data);
  return OmikitPlugin.startCall(data);
}

export const omiEmitter = new NativeEventEmitter(OmikitPlugin);
