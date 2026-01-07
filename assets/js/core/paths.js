export const appBaseUrl = new URL('.', document.baseURI);

export function resolvePath(path) {
    return new URL(path, appBaseUrl).toString();
}
