const e="saveRuleset",t="deleteRuleset",s="enableRules",r="disableRules",a="moveRuleUp",o="moveRuleDown",l="moveRulesetUp",i="moveRulesetDown",c="activate",u="deactivate",d="deleteRules",n="saveRule",m="setRulesConfig",g="deleteRequests",h="startListen",p="stopListen",R="init",w="setRequstsLimit",v={rules:{items:{},order:[],active:[],groups:{},groupOrder:[]},requests:{items:[],limit:100,isListen:!0}};function f(e){const{from:t,to:s,type:r,resourceTypes:a=[]}=e;let o,l;return"regex"===r?(o={regexSubstitution:s},l={regexFilter:t,resourceTypes:a}):(o={url:s},l={urlFilter:t,resourceTypes:a}),{priority:1,action:{type:"redirect",redirect:o},condition:l}}async function y(e){await chrome.action.setBadgeText({text:e>0?String(e):""}),await chrome.action.setBadgeBackgroundColor({color:e>0?"green":"#ffffff00"})}chrome.runtime.onInstalled.addListener((async({reason:e})=>{if("install"===e)await chrome.storage.local.set(v);else{await chrome.storage.local.get()||await chrome.storage.local.set(v)}}));chrome.runtime.onMessage.addListener(((q,I,b)=>((async(q,I,b)=>{let k=await chrome.storage.local.get();k?.rules&&k?.requests||(await chrome.storage.local.set(v),k=v);const L=k.rules,D=k.requests,O=new Set(L.active);switch(q.type){case w:q.limit<D.items.length&&(D.items=D.items.slice(0,q.limit)),D.limit=q.limit,await chrome.storage.local.set({requests:D});break;case h:await chrome.storage.local.set({requests:{...D,isListen:!0}});break;case p:await chrome.storage.local.set({requests:{...D,isListen:!1}});break;case R:b(k);break;case a:case o:const I=[...L.order],x=I.findIndex((e=>e===q.id));if("number"!=typeof x)return;q.type===a?I.splice(x-1,2,I[x],I[x-1]):I.splice(x,2,I[x+1],I[x]),L.order=I,await chrome.storage.local.set({rules:L});break;case l:case i:const S=[...L.groupOrder],N=S.findIndex((e=>e===q.id));if("number"!=typeof N)return;q.type===l?S.splice(N-1,2,S[N],S[N-1]):S.splice(N,2,S[N+1],S[N]),L.groupOrder=S,await chrome.storage.local.set({rules:L});break;case n:if(q.ruleId&&O.has(q.ruleId)&&await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:[q.ruleId],addRules:[{...f(q.rule),id:q.ruleId}]}),q.ruleId)L.items[q.ruleId]=q.rule;else{let e;L.order?.length?(e=Math.max(...L.order)+1,L.order.unshift(e)):(e=1,L.order=[e]),L.items[e]=q.rule}await chrome.storage.local.set({rules:L});break;case e:if(L.groups||(L.groups={}),q.data.id)L.groups[q.data.id]={tag:q.data.tag,rules:q.data.rules};else{let e;L.groupOrder?.length?(e=Math.max(...L.order)+1,L.order.push(e)):(e=1,L.groupOrder=[e]),L.groups[e]={tag:q.data.tag,rules:q.data.rules}}await chrome.storage.local.set({rules:L});break;case t:const z=q.ids;z.forEach((e=>{delete L.groups[e]}));const M=new Set(z);L.groupOrder=L.groupOrder.filter((e=>!M.has(e))),await chrome.storage.local.set({rules:L});break;case r:const T=q.ids.reduce(((e,t)=>O.has(t)?(e.removeRuleIds||(e.removeRuleIds=[]),e.removeRuleIds.push(t),O.delete(t),e):e),{});await chrome.declarativeNetRequest.updateDynamicRules(T),L.active=[...O.keys()],y(O.size),await chrome.storage.local.set({rules:L});break;case s:const B=q.ids.reduce(((e,t)=>(O.has(t)||(e.addRules||(e.addRules=[]),e.addRules.push({...f(L.items[t]),id:t}),e.removeRuleIds||(e.removeRuleIds=[]),e.removeRuleIds.push(t),O.add(t)),e)),{addRules:[],removeRuleIds:[]});await chrome.declarativeNetRequest.updateDynamicRules(B),L.active=[...O.keys()],y(O.size),await chrome.storage.local.set({rules:L});break;case d:const E=q.ids||L.order,C=E.filter((e=>O.has(e)));C.length&&await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:C}),E.forEach((e=>{delete L.items[e],O.delete(e)})),L.active=[...O.keys()];const F=new Set(E),U=new Set;L.order=L.order.filter((e=>!F.has(e))),L.groupOrder.forEach((e=>{const t=L.groups[e].rules.filter((e=>!F.has(e)));t.length>1?L.groups[e].rules=t:(U.add(e),delete L.groups[e])})),U.size&&(L.groupOrder=L.groupOrder.filter((e=>!U.has(e)))),y(O.size),await chrome.storage.local.set({rules:L});break;case u:const j=L.active;await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:j}),O.clear(),L.active=[...O.keys()],y(O.size),await chrome.storage.local.set({rules:L});break;case c:const A=L.order,G=A.map((e=>({...f(L.items[e]),id:e})));await chrome.declarativeNetRequest.updateDynamicRules({addRules:G,removeRuleIds:L.order.map((e=>e))}),L.active=L.order,y(A.length),await chrome.storage.local.set({rules:L});break;case m:await chrome.storage.local.set({rules:{...v.rules,...L,...q.config},requests:v.requests});break;case g:const H=q.ids,J=new Set(H);D.items=D.items.filter((e=>!J.has(e.id))),await chrome.storage.local.set({requests:D})}})(q,0,b),q.type===R))),chrome.declarativeNetRequest?.onRuleMatchedDebug?.addListener((e=>{const{rule:t,request:s}=e;chrome.storage.local.get().then((e=>{const r=e.requests;if(!r.isListen)return;const a=(new Date).toLocaleString(),o=e.rules.items,l=t.ruleId,i={id:s.requestId+"-"+a,request:s,datetime:a,rule:{id:l,tag:o[l]?.tag||void 0}};return r.items.unshift(i),r.items.length>r.limit&&r.items.pop(),chrome.storage.local.set({requests:r})}))}));
