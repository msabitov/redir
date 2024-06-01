// react
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react'

// mui
import Button from '@mui/material/Button';
import {
  Alert, Badge, Dialog, IconButton,
  Menu, MenuItem, Snackbar, Switch, Typography
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

// mui-icons
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// local
import RuleList from './List';
import RuleForm from './Form';
import RulesetList from '../ruleset/List';
import RulesetForm from '../ruleset/Form';
import { DEFAULT_RESOURCE_TYPES } from '../utils/rulesUtils';
import { default as useSearch } from '../utils/useSearch';
import {
  activate,
  copyRule,
  deactivate,
  deleteRules,
  deleteRuleset,
  disableRules,
  enableRules,
  moveRuleDown,
  moveRuleUp,
  moveRulesetDown,
  moveRulesetUp,
  saveRule,
  saveRuleset,
  setRulesConfig,
  visitRepo
} from '../utils/actions';

// types

// types
import {
  IRules,
  IStorageGroup
} from '../../service/types';
interface IProps {
  isDevtools: boolean;
  initial: IRules;
}

const defaultRulesetTemplate: IStorageGroup = {
  tag: '',
  rules: []
};

const defaultRuleTemplate = {
  type: 'regex',
  from: '',
  to: '',
  tag: '',
  resourceTypes: DEFAULT_RESOURCE_TYPES
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

const prepareConfig = (config?: IRules) => {
  if (typeof config !== 'object') {
    return null;
  }

  const { order, items, groups = {}, groupOrder = [] } = config;
  if (!order?.length || !items) {
    return null;
  }
  return {
    groupOrder,
    groups,
    items,
    order,
    active: []
  };
}

function App({
  initial,
  isDevtools
}: IProps) {
  const [initialParams, setInitialParams] = useState(null);
  const [checked, setChecked] = useState(new Set<number>());

  const [filter, setFilter] = useState('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterRef = useRef(null);

  const [rulesetFormParams, setRulesetFormParams] = useState(null);
  const [isRulesetFormOpen, setIsRulesetFormOpen] = useState(false);

  const {
    searchContent,
    searchValue,
    searchType
  } = useSearch({
    initialSearchType: 'all',
    searchTypes: ['all', 'rule', 'ruleset']
  });

  let ruleSearchValue = searchValue;
  let rulesetSearchValue = searchValue;
  if (searchType === 'rule') {
    rulesetSearchValue = '';
  } else if (searchType === 'ruleset') {
    ruleSearchValue = '';
  }

  const [rules, setRules] = useState<IRules>(initial);
  const [snackState, setSnackState] = useState({
    import: undefined
  })

  const isHasActive = !!rules?.active?.length;

  const toggleActive = () => {
    if (isHasActive) {
      deactivate();
    } else {
      activate();
    }
  };

  useEffect(() => {
    chrome.storage?.local?.onChanged.addListener((changes) => {
      if (changes.rules) {
        setRules(changes.rules.newValue);
      }
    })
  }, [])

  const changeFilter = (value) => {
    setFilter(value);
    setFilterMenuOpen(false);
  }

  const filteredRules = useMemo(() => {
    if (filter === 'all') {
      return rules;
    }

    let order;
    if (filter === 'active') {
      order = rules.active;
    } else {
      const activeSet = new Set(rules.active);
      order = rules.order.filter((id) => {
        return !activeSet.has(id);
      });
    }

    return {
      ...rules,
      order
    }
  }, [filter, rules]);

  const searchedRules = useMemo(() => {
    if (!ruleSearchValue) {
      return filteredRules;
    }

    const order = filteredRules.order.filter((id) => {
      const item = filteredRules.items[id];
      return item?.tag.includes(ruleSearchValue);
    });
    return {
      ...filteredRules,
      order
    }
  }, [ruleSearchValue, filteredRules]);

  const dispatch = (params) => {
    const { type, payload } = params;
    switch (type) {
      case 'visit':
        visitRepo();
        break;
      case 'editRuleset':
        setRulesetFormParams(payload.data);
        setIsRulesetFormOpen(true);
        break;
      case 'saveRuleset':
        saveRuleset(payload.data);
        break;
      case 'deleteRuleset':
        deleteRuleset(payload.ids);
        break;
      case 'copyRule':
        copyRule(payload.rule);
        break;
      case 'moveRuleUp':
        moveRuleUp(payload.id);
        break;
      case 'moveRuleDown':
        moveRuleDown(payload.id);
        break;
      case 'moveRulesetUp':
        moveRulesetUp(payload.id);
        break;
      case 'moveRulesetDown':
        moveRulesetDown(payload.id);
        break;
      case 'edit':
        setInitialParams(payload.rule);
        break;
      case 'delete':
        deleteRules(payload.ids);
        break;
      case 'enableRules':
        if (!payload.ids) {
          return;
        }
        enableRules(payload.ids);
        break;
      case 'disableRules':
        if (!payload.ids) {
          return;
        }
        disableRules(payload.ids);
        break;
      case 'export':
        let exportedObject;
        if (!payload?.ids) {
          exportedObject = {
            ...rules
          };
          delete exportedObject.active;
        } else {
          const exportedItems = payload.ids.reduce((acc, id) => {
            const item = searchedRules.items[id];
            acc[id] = item;
            return acc;
          }, {});

          exportedObject = {
            items: exportedItems,
            order: payload.ids
          };
        }
        const exportedString = JSON.stringify(exportedObject);
        const blob = new Blob([exportedString], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'redir-rules.json';
        link.click();
        URL.revokeObjectURL(link.href);
        break;
    }
  }

  return (
    <div className='grow h-full bg-white grid grid-rows-[80px_1fr]'>
      <div className='grid grid-rows-2 bg-back px-s'>
        <div className='flex justify-start items-center'>
          <Typography
            variant='h6'
            sx={{ fontSize: '1rem', fontWeight: 'bold', mr: '0.5rem' }}
          >
            RULES
          </Typography>
          <Button
            component='label'
            startIcon={<AddCircleIcon />}
            className='h-full'
            title='add rule'
            onClick={() => setInitialParams(defaultRuleTemplate)}
          >
            ADD RULE
          </Button>
          <Button
            component='button'
            startIcon={<FolderOpenIcon />}
            title='Create ruleset with selected rules'
            disabled={checked.size <= 1}
            onClick={() => {
              setRulesetFormParams({
                ...defaultRulesetTemplate,
                rules: [...checked.keys()]
              });
              setIsRulesetFormOpen(true);
            }}
            sx={{ borderRadius: '16px' }}
          >
            ADD RULESET
          </Button>
          <Button
            component='label'
            startIcon={<FileUploadIcon />}
            className='h-full'
            title='import rules'
          >
            import
            <input
              type='file'
              accept='.json'
              className='invisible absolute top-0 left-0 bottom-full'
              onChange={(e) => {
                const input = e.target;
                const file = input.files[0];
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    input.value = null;
                    // e.target points to the reader
                    const textContent = e.target.result as string;
                    try {
                      const config = JSON.parse(textContent);
                      const preparedConfig = prepareConfig(config);
                      if (!preparedConfig) {
                        throw new Error('no required format');
                      }
                      setRulesConfig(preparedConfig);
                    } catch (error) {
                      setSnackState((prev) => ({ ...prev, import: error }));
                    }

                  }
                  reader.onerror = (e) => {
                    input.value = null;
                    const error = e.target.error
                    setSnackState((prev) => ({ ...prev, import: error }));
                  }
                  reader.readAsText(file);
                }
              }}
            />
          </Button>
          <Button
            component='label'
            startIcon={<FileDownloadIcon />}
            className='h-full'
            title='export rules'
            onClick={() => dispatch({
              type: 'export',
              payload: {}
            })}
          >
            Export
          </Button>
          <Switch
            checked={isHasActive}
            sx={{
              ml: 'auto'
            }}
            title={(isHasActive ? 'disable' : 'enable') + ' all rules'}
            onChange={toggleActive}
          ></Switch>
        </div>
        <div className='flex justify-between items-center pr-s'>
          {searchContent}
          <IconButton
            ref={filterRef}
            title={'show ' + filter}
            size='small'
            onClick={() => setFilterMenuOpen(true)}
          >
            <Badge
              color={filter === 'active' ? 'success' : 'warning'}
              variant='dot'
              invisible={filter === 'all'}
            >
              <FilterAltIcon />
            </Badge>
          </IconButton>
          <Menu
            id='basic-menu'
            anchorEl={filterRef.current}
            open={filterMenuOpen}
            onClose={() => setFilterMenuOpen(false)}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={() => changeFilter('all')}>All</MenuItem>
            <MenuItem onClick={() => changeFilter('active')}>Active</MenuItem>
            <MenuItem onClick={() => changeFilter('passive')}>Passive</MenuItem>
          </Menu>
        </div>
      </div>
      <div className='flex overflow-hidden'>
        <RulesetList
          dispatch={dispatch}
          rules={rules}
          checkedRules={checked}
          setCheckedRules={setChecked}
          searchValue={rulesetSearchValue}
        />
        <RuleList
          rules={searchedRules}
          dispatch={dispatch}
          checked={checked}
          setChecked={setChecked}
          isDevtools={isDevtools}
        />
      </div>
      <Dialog
        key='rulesetForm'
        fullScreen
        open={isRulesetFormOpen}
        onClose={() => {
          setIsRulesetFormOpen(false);
        }}
        TransitionComponent={Transition}
        className='overflow-hidden'
      >
        <RulesetForm
          initialParams={rulesetFormParams}
          ruleItems={rules.items}
          selectedRules={checked}
          onClose={() => {
            setIsRulesetFormOpen(false);
          }}
          onSave={(ruleset) => {
            saveRuleset(ruleset);
            setIsRulesetFormOpen(false);
          }}
        />
      </Dialog>
      <Dialog
        key='ruleForm'
        fullScreen
        open={!!initialParams}
        onClose={() => {
          setInitialParams(null);
        }}
        TransitionComponent={Transition}
        className='overflow-hidden'
        sx={{ overflowX: 'hidden' }}
      >
        <RuleForm
          initialParams={initialParams}
          onSave={(ruleData) => {
            saveRule(ruleData).then(() => {
              setInitialParams(null);
            })
          }}
          onClose={() => setInitialParams(null)}
        />
      </Dialog>
      <Snackbar
        open={!!snackState.import}
        autoHideDuration={3000}
        onClose={() => {
          setSnackState((prev) => ({ ...prev, import: undefined }));
        }}
      >
        <Alert
          onClose={() => {
            setSnackState((prev) => ({ ...prev, import: undefined }));
          }}
          severity='error'
          variant='filled'
          sx={{ width: '100%' }}
        >
          Failed to import config: check format and try again
        </Alert>
      </Snackbar>
    </div>
  )
}

export default App
