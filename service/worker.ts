// local
import { ACTIONS } from './actions';

// types
import { IRequests, IStorage, IStorageRule, TMessage } from './types';

/**
 * Default state for storage
 */
const defaultState: IStorage = {
    rules: {
        items: {},
        order: [],
        active: [],
        groups: {},
        groupOrder: []
    },
    requests: {
        items: [],
        limit: 100,
        isListen: true
    }
};

/**
 * Runtime listener
 */
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
        await chrome.storage.local.set(defaultState);
    } else {
        const state = await chrome.storage.local.get();
        if (!state) {
            await chrome.storage.local.set(defaultState);
        }
    }
});

/**
 * Prepare rule to chrome format
 * @param params
 */
function prepareRule(params: IStorageRule): chrome.declarativeNetRequest.Rule {
    const {
        from,
        to,
        type,
        resourceTypes = []
    } = params;
    let redirect;
    let condition;
    if (type === 'regex') {
        redirect = {
            regexSubstitution: to
        };
        condition = {
            regexFilter: from,
            resourceTypes
        };
    } else {
        redirect = {
            url: to
        };
        condition = {
            urlFilter: from,
            resourceTypes
        };
    }
    return {
        priority: 1,
        action: {
            type: 'redirect',
            redirect
        },
        condition
    } as chrome.declarativeNetRequest.Rule;
}

/**
 * Badge handler
 * @param count
 */
async function setBadge(count: number): Promise<void> {
    await chrome.action.setBadgeText({
        text: count > 0 ? String(count) : ''
    }) ;
    await chrome.action.setBadgeBackgroundColor({
        color: count > 0 ? 'green' : '#ffffff00'
    });
}

/**
 * Async handler for messages
 * @param message
 * @param sender
 * @param sendResponse
 */
const messageHandler = async (
    message: TMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: object) => void
): Promise<void> => {
    let state = await chrome.storage.local.get() as IStorage;
    if (!state?.rules || !state?.requests) {
        await chrome.storage.local.set(defaultState);
        state = defaultState;
    }
    const rules = state.rules;
    const requests = state.requests;
    const active = new Set(rules.active);
    switch (message.type) {
        case ACTIONS.SET_REQUESTS_LIMIT:
            if (message.limit < requests.items.length) {
                requests.items = requests.items.slice(0, message.limit);
            }
            requests.limit = message.limit;
            await chrome.storage.local.set({
                requests
            });
            break;
        case ACTIONS.START_LISTEN:
            await chrome.storage.local.set({
                requests: {
                    ...requests,
                    isListen: true
                }
            });
            break;
        case ACTIONS.STOP_LISTEN:
            await chrome.storage.local.set({
                requests: {
                    ...requests,
                    isListen: false
                }
            });
            break;
        case ACTIONS.INIT:
            sendResponse(state);
            break;
        case ACTIONS.MOVE_RULE_UP:
        case ACTIONS.MOVE_RULE_DOWN:
            const moveUpOrder = [...rules.order];
            const index = moveUpOrder.findIndex((val) => val === message.id);
            if (typeof index !== 'number') {
                return;
            }
            if (message.type === ACTIONS.MOVE_RULE_UP) {
                moveUpOrder.splice(index - 1, 2, moveUpOrder[index], moveUpOrder[index - 1]);
            } else {
                moveUpOrder.splice(index, 2, moveUpOrder[index + 1], moveUpOrder[index]);
            }
            rules.order = moveUpOrder;
            await chrome.storage.local.set({
                rules
            });
            break;
        case ACTIONS.MOVE_RULESET_UP:
        case ACTIONS.MOVE_RULESET_DOWN:
            const groupeMoveUpOrder = [...rules.groupOrder];
            const groupIndex = groupeMoveUpOrder.findIndex((val) => val === message.id);
            if (typeof groupIndex !== 'number') {
                return;
            }
            if (message.type === ACTIONS.MOVE_RULESET_UP) {
                groupeMoveUpOrder.splice(groupIndex - 1, 2, groupeMoveUpOrder[groupIndex], groupeMoveUpOrder[groupIndex - 1]);
            } else {
                groupeMoveUpOrder.splice(groupIndex, 2, groupeMoveUpOrder[groupIndex + 1], groupeMoveUpOrder[groupIndex]);
            }
            rules.groupOrder = groupeMoveUpOrder;
            await chrome.storage.local.set({
                rules
            });
            break;
        case ACTIONS.SAVE_RULE:
            if (message.ruleId && active.has(message.ruleId)) {
                await chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: [message.ruleId],
                    addRules: [{
                        ...prepareRule(message.rule),
                        id: message.ruleId
                    }]
                });
            }
            if (!message.ruleId) {
                let newId;
                if (rules.order?.length) {
                    newId = Math.max(...rules.order) + 1;
                    rules.order.unshift(newId);
                } else {
                    newId = 1;
                    rules.order = [newId];
                }
                rules.items[newId] = message.rule;
            } else {
                rules.items[message.ruleId] = message.rule;
            }
            await chrome.storage.local.set({
                rules
            });
            break;
        case ACTIONS.SAVE_RULESET:
            if (!rules.groups) {
                rules.groups = {};
            }
            if (!message.data.id) {
                let newId;
                if (rules.groupOrder?.length) {
                    newId = Math.max(...rules.order) + 1;
                    rules.order.push(newId);
                } else {
                    newId = 1;
                    rules.groupOrder = [newId];
                }
                rules.groups[newId] = {
                    tag: message.data.tag,
                    rules: message.data.rules
                };
            } else {
                rules.groups[message.data.id] = {
                    tag: message.data.tag,
                    rules: message.data.rules
                };
            }
            await chrome.storage.local.set({
                rules
            });
            break;
        case ACTIONS.DELETE_RULESET:
            const groupDeleteIds = message.ids; 
            groupDeleteIds.forEach((id) => {
                delete rules.groups[id];
            });
            const deleteGroupIdsSet = new Set(groupDeleteIds);
            rules.groupOrder = rules.groupOrder.filter((id) => !deleteGroupIdsSet.has(id));    
            await chrome.storage.local.set({
                rules
            });
            break;
        case ACTIONS.DISABLE_RULES:
            const disableRulesParams = message.ids.reduce((acc, ruleId) => {
                if (!active.has(ruleId)) {
                    return acc;
                }
                if (!acc.removeRuleIds) {
                    acc.removeRuleIds = [];
                }
                acc.removeRuleIds.push(ruleId);
                active.delete(ruleId);
                return acc;
            }, {} as chrome.declarativeNetRequest.UpdateRuleOptions);
            await chrome.declarativeNetRequest.updateDynamicRules(disableRulesParams);
            rules.active = [...active.keys()];
            setBadge(active.size);
            await chrome.storage.local.set({
                rules
            });
            break;
        case ACTIONS.ENABLE_RULES:
            const enableRulesParams = message.ids.reduce((acc, ruleId) => {
                if (active.has(ruleId)) {
                    return acc;
                }

                if (!acc.addRules) {
                    acc.addRules = [];
                }
                acc.addRules.push({
                    ...prepareRule(rules.items[ruleId]),
                    id: ruleId
                });

                if (!acc.removeRuleIds) {
                    acc.removeRuleIds = [];
                }
                acc.removeRuleIds.push(ruleId);
                active.add(ruleId);
                return acc;
            }, {addRules: [], removeRuleIds: []} as chrome.declarativeNetRequest.UpdateRuleOptions);
            await chrome.declarativeNetRequest.updateDynamicRules(enableRulesParams);
            rules.active = [...active.keys()];
            setBadge(active.size);
            await chrome.storage.local.set({
                rules
            });
            break;
        case ACTIONS.DELETE_RULES:
            const deleteIds = message.ids || rules.order;
            const deleteRuleIds = deleteIds.filter((id) => active.has(id));
            if (deleteRuleIds.length) {
                await chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: deleteRuleIds
                });
            }
            deleteIds.forEach((id) => {
                delete rules.items[id];
                active.delete(id);
            });
            rules.active = [...active.keys()];
            const deleteIdsSet = new Set(deleteIds);
            const deleteGroupIdSet = new Set();
            rules.order = rules.order.filter((id) => !deleteIdsSet.has(id));
            rules.groupOrder.forEach((groupId) => {
                const nextRules = rules.groups[groupId].rules.filter((ruleId) => !deleteIdsSet.has(ruleId));
                if (nextRules.length > 1) {
                    rules.groups[groupId].rules = nextRules;
                } else {
                    deleteGroupIdSet.add(groupId);
                    delete rules.groups[groupId];
                }
            });
            if (deleteGroupIdSet.size) {
                rules.groupOrder = rules.groupOrder.filter((groupId) => !deleteGroupIdSet.has(groupId));
            }
            setBadge(active.size);
            await chrome.storage.local.set({
                rules
            });
            break;
        case ACTIONS.DEACTIVATE:
            const removeRuleIds = rules.active;
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds
            });
            active.clear();
            rules.active = [...active.keys()];
            setBadge(active.size);
            await chrome.storage.local.set({
                rules
            });
            break;
        case ACTIONS.ACTIVATE:
            const activateIds = rules.order;
            const addRules = activateIds.map((id) => {
                return {
                    ...prepareRule(rules.items[id]),
                    id
                };
            });
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules,
                removeRuleIds: rules.order.map((id) => id)
            });
            rules.active = rules.order;
            setBadge(activateIds.length);
            await chrome.storage.local.set({
                rules
            });
            break;
        case ACTIONS.SET_RULES_CONFIG:
            await chrome.storage.local.set({
                rules: {
                    ...defaultState.rules,
                    ...rules,
                    ...message.config
                },
                requests: defaultState.requests
            });
            break;
        case ACTIONS.DELETE_REQUESTS:
            const deleteRequestIds = message.ids;
            const deleteRequestIdsSet = new Set(deleteRequestIds);
            requests.items = requests.items.filter((item) => !deleteRequestIdsSet.has(item.id));
            await chrome.storage.local.set({
                requests
            });
            break;
        default:
            break;
    }
}

/**
 * Message listener
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    messageHandler(message, sender, sendResponse);
    switch (message.type) {
        case ACTIONS.INIT:
            return true;
        default:
            return false;
    }
});

/**
 * Listener for matched rules
 */
chrome.declarativeNetRequest?.onRuleMatchedDebug?.addListener((info) => {
    const { rule, request } = info;
    chrome.storage.local.get().then((localStorage) => {
        const requests = localStorage.requests as IRequests;
        if (!requests.isListen) {
            return;
        }
        const datetime = new Date().toLocaleString();
        const ruleItems = localStorage.rules.items;
        const ruleId = rule.ruleId;
        const addedItem = {
            id: request.requestId + '-' + datetime,
            request,
            datetime,
            rule: {
                id: ruleId,
                tag: ruleItems[ruleId]?.tag || undefined
            }
        }
        requests.items.unshift(addedItem);
        if (requests.items.length > requests.limit) {
            requests.items.pop();
        }
        return chrome.storage.local.set({ requests });
    })
})
