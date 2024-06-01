// react
import { useState } from 'react';

// mui
import Paper from '@mui/material/Paper';
import {
    Checkbox, Chip, IconButton, Alert,
    Snackbar, Switch, Typography
} from '@mui/material';

// mui-icons
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import DoneAllIcon from '@mui/icons-material/DoneAll';

// local
import { MAX_RES_TYPES, getNewTag } from '../utils/rulesUtils'
    ;
// style
import './style.css';

// types
import { IRules } from '../../service/types';

type TSetChecked = (prevState: Set<number>) => Set<number>;
interface IProps {
    isDevtools: boolean;
    rules: IRules;
    dispatch: (config: {
        type: string;
        payload: object;
    }) => void;
    checked: Set<number>;
    setChecked: (nextState: Set<number> | TSetChecked) => void;
}

const copyToClipboard = async (value: string) => {
    if (chrome.devtools) {
        return chrome.devtools.inspectedWindow.eval(
            `navigator.clipboard.writeText(${value})`
        );
    }
    return navigator.clipboard.writeText(value);
};

export default function List(props: IProps) {
    const {
        isDevtools,
        rules,
        dispatch,
        checked,
        setChecked
    } = props;
    const active = new Set(rules?.active || []);
    const [snackState, setSnackState] = useState({
        from: false,
        to: false
    });

    const itemsCount = rules.order.length;
    const selectedCount = checked.size;
    const hasSelectedItems = !!selectedCount;
    return (
        <div className='grid grid-rows-[40px_1fr] w-full overflow-hidden'>
            <div className='bg-back flex justify-between items-center pl-[24px] pr-s'>
                <div className='h-3/4 grow flex items-center'>
                    <Checkbox
                        edge='end'
                        onChange={() => {
                            if (hasSelectedItems) {
                                setChecked(new Set());
                            } else {
                                setChecked(new Set(rules.order));
                            }
                        }}
                        sx={{ px: 0, mr: '12px' }}
                        checked={hasSelectedItems}
                        title={(selectedCount ? 'unselect' : 'select') + ' all rules'}
                    />
                    <Typography>
                        {hasSelectedItems ? selectedCount === itemsCount ? `All (${selectedCount})` : `${selectedCount}` : 'Nothing'} selected
                    </Typography>
                </div>
                <Paper
                    elevation={0}
                    className='flex mr-s h-3/4 shrink-0'
                    sx={{ borderRadius: '30px' }}
                >
                    <IconButton
                        edge='end'
                        aria-label='enable'
                        title='enable selected rules'
                        size='small'
                        disabled={!hasSelectedItems}
                        onClick={(event) => dispatch?.({
                            type: 'enableRules',
                            payload: {
                                event,
                                ids: [...checked.keys()]
                            }
                        })}
                    >
                        <DoneAllIcon />
                    </IconButton>
                    <IconButton
                        edge='end'
                        aria-label='disable'
                        title='disable selected rules'
                        size='small'
                        disabled={!hasSelectedItems}
                        onClick={(event) => dispatch?.({
                            type: 'disableRules',
                            payload: {
                                event,
                                ids: [...checked.keys()]
                            }
                        })}
                    >
                        <RemoveDoneIcon />
                    </IconButton>
                    <IconButton
                        edge='end'
                        aria-label='export'
                        title='export selected rules'
                        disabled={!hasSelectedItems}
                        onClick={(event) => dispatch?.({
                            type: 'export',
                            payload: {
                                event,
                                ids: [...checked.keys()]
                            }
                        })}
                        size='small'
                        sx={{ margin: 0 }}
                    >
                        <FileDownloadIcon />
                    </IconButton>
                    <IconButton
                        edge='end'
                        aria-label='delete'
                        title='delete selected rules'
                        disabled={!hasSelectedItems}
                        onClick={(event) => dispatch?.({
                            type: 'delete',
                            payload: {
                                event,
                                ids: [...checked.keys()]
                            }
                        })}
                        size='small'
                        sx={{ margin: 0 }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Paper>
            </div>
            <ul className='row-span-9 divide-y divide-solid pl-s'>
                {rules?.order.length ?
                    rules.order.map((id, ind) => {
                        const rule = rules.items[id];
                        const MAX_VIS_RES = 2;
                        const resourceLable = rule.resourceTypes?.length === MAX_RES_TYPES ?
                            'All' :
                            rule.resourceTypes.length > MAX_VIS_RES ?
                                rule.resourceTypes.slice(0, MAX_VIS_RES).join(', ') + ` and ${rule.resourceTypes.length - MAX_VIS_RES} more` :
                                rule.resourceTypes.join(', ')
                        return <li
                            key={id}
                            className='h-[160px] grid grid-rows-[40px_32px_32px_40px] gap-y-1 px-s pt-4xs shadow-md'
                        >
                            <div
                                className='flex justify-between items-center'
                            >
                                <div className='inline-block'>
                                    <Checkbox
                                        edge='end'
                                        onChange={() => {
                                            setChecked((prev) => {
                                                const next = new Set(prev) as Set<number>;
                                                if (next.has(id)) {
                                                    next.delete(id);
                                                } else {
                                                    next.add(id);
                                                }
                                                return next;
                                            })
                                        }}
                                        sx={{ px: 0, mr: '12px' }}
                                        checked={checked.has(id)}
                                    />
                                    <Chip
                                        color='primary'
                                        label={rule.tag}
                                    />
                                </div>
                                <Switch
                                    checked={active?.has(id)}
                                    onChange={() => dispatch?.({
                                        type: active?.has(id) ? 'disableRules' : 'enableRules',
                                        payload: {
                                            ids: [id]
                                        }
                                    })}
                                    sx={{ translate: '12px' }}
                                />
                            </div>
                            <div className='flex items-center overflow-hidden'>
                                {!isDevtools && <IconButton
                                    edge='start'
                                    aria-label='copy-from'
                                    onClick={() => {
                                        copyToClipboard(rule.from).then(() => {
                                            setSnackState((prev) => ({ ...prev, from: true }));
                                        }).catch(() => setSnackState((prev) => ({ ...prev, from: false })))
                                    }}
                                    size='small'
                                    sx={{ p: 0, pl: '4px' }}
                                >
                                    <ContentCopyIcon />
                                </IconButton>}
                                <div
                                    className='grid grid-cols-[56px_1fr] items-baseline overflow-hidden pt-4xs h-full pl-4xs grow'
                                >
                                    <Typography
                                        variant='h6'
                                        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                                    >
                                        FROM:
                                    </Typography>
                                    <Typography
                                        title={rule.from}
                                        className='text-ellipsis overflow-hidden whitespace-nowrap'
                                    >
                                        {rule.from}
                                    </Typography>
                                </div>
                                <Snackbar
                                    open={snackState.from}
                                    autoHideDuration={3000}
                                    onClose={() => {
                                        setSnackState((prev) => ({ ...prev, from: false }));
                                    }}
                                >
                                    <Alert
                                        onClose={() => {
                                            setSnackState((prev) => ({ ...prev, from: false }));
                                        }}
                                        severity='success'
                                        variant='filled'
                                        sx={{ width: '100%' }}
                                    >
                                        'From' field successfully copied to the clipboard
                                    </Alert>
                                </Snackbar>
                            </div>
                            <div className='flex items-center overflow-hidden'>
                                {!props.isDevtools && <IconButton
                                    edge='start'
                                    aria-label='copy-to'
                                    onClick={() => {
                                        copyToClipboard(rule.to).then(() => {
                                            setSnackState((prev) => ({ ...prev, to: true }));
                                        }).catch(() => setSnackState((prev) => ({ ...prev, to: false })))
                                    }}
                                    size='small'
                                    sx={{ p: 0, pl: '4px' }}
                                >
                                    <ContentCopyIcon />
                                </IconButton>}
                                <div
                                    className='grid grid-cols-[56px_1fr] items-baseline overflow-hidden pt-4xs h-full pl-4xs grow'
                                >
                                    <Typography
                                        variant='h6'
                                        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                                    >
                                        TO:
                                    </Typography>
                                    <Typography
                                        title={rule.to}
                                        className='text-ellipsis overflow-hidden whitespace-nowrap flex-grow-1'>
                                        {rule.to}
                                    </Typography>
                                </div>
                                <Snackbar
                                    open={snackState.to}
                                    autoHideDuration={3000}
                                    onClose={() => {
                                        setSnackState((prev) => ({ ...prev, to: false }));
                                    }}
                                >
                                    <Alert
                                        onClose={() => {
                                            setSnackState((prev) => ({ ...prev, to: false }));
                                        }}
                                        severity='success'
                                        variant='filled'
                                        sx={{ width: '100%' }}
                                    >
                                        'To' field successfully copied to the clipboard
                                    </Alert>
                                </Snackbar>
                            </div>
                            <div className='flex justify-between items-center space-x-2 overflow-hidden'>
                                <Chip
                                    title={'Resource types: ' + resourceLable}
                                    label={resourceLable}
                                    className='overflow-hidden'
                                />
                                <Paper
                                    elevation={0}
                                    className='flex h-3/4 shrink-0 bg-stone-400'
                                    variant='outlined'
                                    sx={{ borderRadius: '30px' }}
                                >
                                    <IconButton
                                        edge='end'
                                        aria-label='copyRule'
                                        size='small'
                                        onClick={(event) => dispatch?.({
                                            type: 'copyRule',
                                            payload: {
                                                event,
                                                rule: {
                                                    ...rule,
                                                    tag: getNewTag(rule.tag)
                                                }
                                            }
                                        })}
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                    <IconButton
                                        edge='end'
                                        aria-label='moveUp'
                                        size='small'
                                        disabled={ind === 0}
                                        onClick={(event) => dispatch?.({
                                            type: 'moveRuleUp',
                                            payload: {
                                                event,
                                                id
                                            }
                                        })}
                                    >
                                        <ArrowDropUpIcon />
                                    </IconButton>
                                    <IconButton
                                        edge='end'
                                        aria-label='moveDown'
                                        size='small'
                                        disabled={ind === (rules.order.length - 1)}
                                        onClick={(event) => dispatch?.({
                                            type: 'moveRuleDown',
                                            payload: {
                                                event,
                                                id
                                            }
                                        })}
                                    >
                                        <ArrowDropDownIcon />
                                    </IconButton>
                                    <IconButton
                                        edge='end'
                                        aria-label='edit'
                                        size='small'
                                        onClick={(event) => dispatch?.({
                                            type: 'edit',
                                            payload: {
                                                event,
                                                rule: {
                                                    id,
                                                    ...rule
                                                }
                                            }
                                        })}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        edge='end'
                                        aria-label='delete'
                                        size='small'
                                        onClick={(event) => dispatch?.({
                                            type: 'delete',
                                            payload: {
                                                event,
                                                ids: [id]
                                            }
                                        })}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Paper>
                            </div>
                        </li>;
                    })
                    :
                    <li
                        key='empty'
                        className='h-32 py-2 px-s flex items-center justify-center'
                    >
                        <Typography>No rules found</Typography>
                    </li>
                }
            </ul>
        </div>
    );
}
