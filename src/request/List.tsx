// react
import { useState } from 'react';

// mui
import Paper from '@mui/material/Paper';

import {
    Checkbox, Chip, IconButton, Alert,
    Snackbar, Typography
} from '@mui/material';

// mui-icons
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';

// types
import { IRequests } from '../../service/types';
interface IProps {
    requests: IRequests;
    dispatch: (config: {
        payload: object;
        type: string;
    }) => void;
    isUnpacked: boolean;
    isDevtools: boolean;
}

export default function List(props: IProps) {
    const {
        requests,
        dispatch,
        isUnpacked
    } = props;
    const [checked, setChecked] = useState(new Set());
    const [snackState, setSnackState] = useState({
        url: false,
        initiator: false
    });
    const itemsCount = requests.items.length;
    const selectedCount = checked.size;
    const hasSelectedItems = !!selectedCount;
    return (
        <div className='grid grid-rows-[40px_1fr] w-full overflow-hidden'>
            <div className='bg-back flex justify-between items-center px-s'>
                <div className='h-3/4 grow flex items-center'>
                    <Checkbox
                        edge='end'
                        onChange={() => {
                            if (hasSelectedItems) {
                                setChecked(new Set());
                            } else {
                                setChecked(new Set(requests.items.map(({ request }) => request.requestId)));
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
                        aria-label='export'
                        title='export selected requests'
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
                        <FileUploadIcon />
                    </IconButton>
                    <IconButton
                        edge='end'
                        aria-label='delete'
                        title='delete selected requests from storage'
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
                {requests?.items.length ?
                    requests.items.map((item) => {
                        const request = item.request;
                        const rule = item.rule;
                        const datetime = item.datetime;
                        const id = item.id;
                        return <li
                            key={id}
                            className='h-[80px] grid grid-rows-[40px_30px] gap-y-1 pr-s'
                        >
                            <div
                                className='flex justify-between items-center'
                            >
                                <div className='inline-block'>
                                    <Checkbox
                                        edge='end'
                                        onChange={() => {
                                            setChecked((prev) => {
                                                const next = new Set(prev);
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
                                <Chip
                                    title={datetime}
                                    label={datetime}
                                    className='overflow-hidden'
                                    sx={{ ml: 'auto', mr: '8px' }}
                                />
                                <Chip
                                    title={'Resource type: ' + request.type}
                                    label={request.type}
                                    className='overflow-hidden'
                                    sx={{ mr: '8px' }}
                                />

                                <Chip
                                    color='info'
                                    label={request?.method}
                                />
                            </div>
                            <div className='flex items-center overflow-hidden'>
                                <div className='grid grid-cols-[auto_1fr] items-baseline overflow-hidden pt-4xs h-full grow'>
                                    <Typography
                                        variant='h6'
                                        sx={{ fontWeight: 'bold', fontSize: '1rem', px: '4px' }}
                                    >
                                        URL:
                                    </Typography>
                                    <Typography
                                        title={request.url}
                                        className='text-ellipsis overflow-hidden whitespace-nowrap'
                                    >
                                        {request.url}
                                    </Typography>
                                </div>
                                <Snackbar
                                    open={snackState.url}
                                    autoHideDuration={3000}
                                    onClose={() => {
                                        setSnackState((prev) => ({ ...prev, url: false }));
                                    }}
                                >
                                    <Alert
                                        onClose={() => {
                                            setSnackState((prev) => ({ ...prev, url: false }));
                                        }}
                                        severity='success'
                                        variant='filled'
                                        sx={{ width: '100%' }}
                                    >
                                        'URL' field successfully copied to the clipboard
                                    </Alert>
                                </Snackbar>
                            </div>
                        </li>;
                    })
                    :
                    <li
                        key='empty'
                        className='h-32 py-2 px-s flex items-center justify-center'
                    >
                        {!isUnpacked ?
                            <Typography>
                                <p>Unfortunately, the function of tracking triggered rules is only available in unpacked extensions.</p>
                                <p>You can download the unpacked extension from the 'dist' folder of the official repository.</p>
                            </Typography> :
                            <Typography>No requests found</Typography>
                        }
                    </li>
                }
            </ul>
        </div >);
}
