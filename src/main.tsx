// react
import React from 'react'
import ReactDOM from 'react-dom/client';

// mui
import { createTheme, ThemeProvider } from '@mui/material/styles';

// local
import App from './App.tsx'
import { getStorageData } from './utils/actions.ts';

// style
import './index.css';

// types
import { IStorage } from '../service/types.ts';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6c6363'
    }
  },
});

const root = document.getElementById('root');
const isDevMode = !chrome.runtime?.sendMessage;
const isDevtools = !!chrome.devtools;

// handle devtools view
if (isDevtools) {
  root.style.cssText = 'width: 100%; height: 100%';
  document.documentElement.style.cssText = 'width: 100%; height: 100%';
  document.body.style.cssText = 'width: 100%; height: 100%';

  chrome.devtools.panels.create(
    'Redir',
    'images/icon32.png',
    'index.html'
  );
  // handle dev server view
} else if (isDevMode) {
  root.style.cssText = 'width: 100%; height: 100%';
  document.documentElement.style.cssText = 'width: 100%; height: 100%';
  document.body.style.cssText = 'width: 100%; height: 100%';
}

/**
 * Initialize extension state
 */
const getData = async (): Promise<IStorage> => {
  if (!isDevMode) {
    const result = await getStorageData();
    return result;
  }
  // if dev mode
  const order = [...new Array(15)].map((val, ind) => ind + 1);
  return {
    rules: {
      order,
      items: order.reduce((acc, val) => {
        acc[val] = {
          from: 'https://example.com',
          to: `http://localhost:${val}000`,
          tag: `Test rule №${val}`,
          resourceTypes: ['main_frame']
        };
        return acc;
      }, {}),
      active: [1, 3],
      groups: {
        1: {
          tag: 'Casual ruleset 1',
          rules: [1, 2, 3]
        },
        2: {
          tag: 'Special ruleset 2',
          rules: [4, 2, 3]
        },
        3: {
          tag: 'Next ruleset 3',
          rules: [4, 2]
        }
      },
      groupOrder: [1, 2, 3]
    },
    requests: {
      isListen: true,
      items: [...new Array(15)].map((val, ind) => ({
        id: `${ind}20.05.2050, 16:${30 + ind}`,
        request: {
          documentId: 'documentId',
          frameId: 15,
          frameType: 'frameType',
          initiator: 'init',
          method: 'GET',
          requestId: 'requestId' + ind,
          type: 'script',
          url: `https://example.com/part-${ind}`,
          partentFrameId: undefined,
          tabId: ind
        } as chrome.declarativeNetRequest.RequestDetails,
        rule: {
          tag: `Rule Tag ${ind}`,
          id: ind + 1
        },
        datetime: `20.05.2050, 16:${30 + ind}`
      })),
      limit: 100
    }
  };
}

async function checkUnpacked() {
  if (!chrome?.management) {
    return true;
  }
  const info = await chrome.management.getSelf();
  return info.installType === 'development';
}

async function init(): Promise<void> {
  const data = await getData();
  const isUnpacked = await checkUnpacked();

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <App
          data={data}
          isUnpacked={isUnpacked}
          isDevtools={isDevtools}
          isDevMode={isDevMode}
        />
      </ThemeProvider>
    </React.StrictMode>
  );
}

init();
