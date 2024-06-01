// local
import { ACTIONS } from '../../service/actions';

// types
import { IExtStorageRule } from '../../service/types';

export const saveRuleset = async (data: object) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.SAVE_RULESET, data });
}

export const deleteRuleset = async (ids: number[]) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.DELETE_RULESET, ids });
}
export const enableRules = async (ids: number[]) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.ENABLE_RULES, ids });
}

export const disableRules = async (ids: number[]) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.DISABLE_RULES, ids });
}

export const moveRuleUp = async (id: number) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.MOVE_RULE_UP, id });
}

export const moveRuleDown = async (id: number) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.MOVE_RULE_DOWN, id });
}

export const moveRulesetUp = async (id: number) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.MOVE_RULESET_UP, id });
}

export const moveRulesetDown = async (id: number) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.MOVE_RULESET_DOWN, id });
}

export const activate = async () => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.ACTIVATE });
}

export const deactivate = async () => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.DEACTIVATE });
}

export const deleteRules = async (ids?: number[]) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.DELETE_RULES, ids });
}

export const saveRule = async (ruleData: IExtStorageRule) => {
  const { id: ruleId, ...rule } = ruleData;
  await chrome.runtime?.sendMessage({ type: ACTIONS.SAVE_RULE, ruleId, rule });
}

export const copyRule = async (rule: object) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.SAVE_RULE, ruleId: undefined, rule });
}

export const setRulesConfig = async (config: object) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.SET_RULES_CONFIG, config });
}

export const startListen = async () => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.START_LISTEN });
}

export const stopListen = async () => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.STOP_LISTEN });
}

export const deleteRequests = async (ids?: number[]) => {
  await chrome.runtime?.sendMessage({ type: ACTIONS.DELETE_REQUESTS, ids });
}

export const getStorageData = async () => {
  return await chrome.runtime.sendMessage({ type: ACTIONS.INIT });
}

export const setRequstsLimit = async (limit: number) => {
  return await chrome.runtime.sendMessage({ type: ACTIONS.SET_REQUESTS_LIMIT, limit });
}

export const visitRepo = () => {
  window.open('https://github.com/msabitov/redir', 'blank');
}
