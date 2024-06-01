import { ACTIONS } from './actions';
export type TRuleType = 'regex' | 'wildcard';

export interface IStorageRule {
    tag: string;
    from: string;
    to: string;
    type: TRuleType;
    resourceTypes: chrome.declarativeNetRequest.ResourceType[];
}

export interface IExtStorageRule extends IStorageRule {
    id?: number;
}

export interface IStorageGroup {
    tag: string;
    rules: number[];
}

export interface IStorageRequest {
    id: string;
    datetime: string;
    rule: {
        tag?: string;
        id: number;
    };
    request: chrome.declarativeNetRequest.RequestDetails;
}

export interface IRequests {
    items: IStorageRequest[];
    isListen: boolean;
    limit: number;
}

export interface IRules {
    items: Record<number, IStorageRule>;
    order: number[];
    active: number[];
    groups: Record<number, IStorageGroup>;
    groupOrder: number[];
}

export interface IStorage {
    requests: IRequests;
    rules: IRules;
}

export type TMessage = {
    type: typeof ACTIONS.SAVE_RULESET,
    data: {
        tag: string;
        id: number;
        rules: number[];
    }
} | {
    type: typeof ACTIONS.DELETE_RULESET;
    ids: number[];
} | {
    type: typeof ACTIONS.SAVE_RULE;
    rule: IStorageRule;
    ruleId: number;
} | {
    type: typeof ACTIONS.MOVE_RULESET_DOWN;
    id: number;
} | {
    type: typeof ACTIONS.MOVE_RULESET_UP;
    id: number;
} | {
    type: typeof ACTIONS.MOVE_RULE_UP;
    id: number;
} | {
    type: typeof ACTIONS.MOVE_RULE_DOWN;
    id: number;
} | {
    type: typeof ACTIONS.INIT;
} | {
    type: typeof ACTIONS.START_LISTEN;
} | {
    type: typeof ACTIONS.STOP_LISTEN;
} | {
    type: typeof ACTIONS.SET_REQUESTS_LIMIT;
    limit: number;
} | {
    type: typeof ACTIONS.ENABLE_RULES;
    ids: number[];
} | {
    type: typeof ACTIONS.DISABLE_RULES;
    ids: number[];
} | {
    type: typeof ACTIONS.DELETE_RULES;
    ids: number[];
} | {
    type: typeof ACTIONS.ACTIVATE;
} | {
    type: typeof ACTIONS.DEACTIVATE;
} | {
    type: typeof ACTIONS.SET_RULES_CONFIG;
    config: {
        rules: IRules;
    }
} | {
    type: typeof ACTIONS.DELETE_REQUESTS;
    ids: string[];
}