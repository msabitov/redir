export const DEFAULT_RESOURCE_TYPES = [
    'main_frame',
    'sub_frame',
    'stylesheet',
    'script',
    'image',
    'font',
    'object',
    'xmlhttprequest',
    'ping',
    'csp_report',
    'media',
    'websocket',
    'webtransport',
    'webbundle',
    'other'
] as chrome.declarativeNetRequest.ResourceType[];

export const MAX_RES_TYPES = DEFAULT_RESOURCE_TYPES.length;

export function getNewTag(tag: string): string {
    const copyRegex = /^(.*)\((\d)\)$/;
    const match = tag.match(copyRegex);
    if (match) {
        const count = Number(match[2]);
        return `${match[1]} (${count + 1})`;
    } else {
        return tag + ' (1)';
    }
}
