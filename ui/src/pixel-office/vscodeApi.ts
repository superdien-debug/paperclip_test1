/**
 * Mock VS Code API for browser environment.
 */

export const vscode = {
  postMessage: (message: any) => {
    console.log('[Mock VSCode] postMessage:', message);
  },
  getState: () => ({}),
  setState: (state: any) => {
    console.log('[Mock VSCode] setState:', state);
  },
};
