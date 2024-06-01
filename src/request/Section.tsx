// react
import { useEffect, useMemo, useRef, useState } from 'react'

// mui
import {
    Alert, Badge, Button, IconButton, Menu, MenuItem,
    Snackbar, Switch, Typography
} from '@mui/material';

// mui-icons
import FilterAltIcon from '@mui/icons-material/FilterAlt';

// local
import RequestList from './List';
import useSearch from '../utils/useSearch';
import {
    startListen,
    stopListen,
    deleteRequests,
    setRequstsLimit
} from '../utils/actions';

// types
import { IRequests, IRules } from '../../service/types';

interface IProps {
    isDevtools: boolean;
    isUnpacked: boolean;
    initial: {
        requests: IRequests;
        rules: IRules;
    }
}

const requestMethods = [
    'GET', 'POST', 'UPDATE', 'DELETE', 'OPTIONS', 'HEAD', 'PUT', 'PATCH', 'CONNECT', 'TRACE'
];

function Section(props: IProps) {
    const [filter, setFilter] = useState('All');
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const filterRef = useRef(null);

    const {
        searchContent,
        searchValue,
        searchType
    } = useSearch({
        initialSearchType: 'url',
        searchTypes: ['url', 'rule']
    });

    const [requests, setRequests] = useState(props.initial.requests);

    const [limit, setLimit] = useState(props.initial.requests.limit);

    const isLimitChanged = limit !== requests.limit;

    const [snackState, setSnackState] = useState({
        import: undefined
    });

    const isListen = !!requests?.isListen;

    const toggleListen = () => {
        if (isListen) {
            stopListen();
        } else {
            startListen();
        }
    };

    useEffect(() => {
        chrome.storage?.local?.onChanged.addListener((changes) => {
            if (changes.requests) {
                setRequests(changes.requests.newValue);
            }
        })
    }, []);

    const changeFilter = (value) => {
        setFilter(value);
        setFilterMenuOpen(false);
    }

    const filteredRequests = useMemo(() => {
        if (filter === 'All') {
            return requests;
        }

        const items = requests.items.filter((item) => {
            return item.request.method === filter;
        });

        return {
            ...requests,
            items
        }
    }, [filter, requests]);

    const searchedRequests = useMemo(() => {
        let items;
        if (!searchValue) {
            return filteredRequests;
        } else if (searchType === 'url') {
            items = filteredRequests.items.filter((item) => {
                return item.request.url.includes(searchValue);
            });
        } else {
            items = filteredRequests.items.filter((item) => {
                return item.rule.tag.includes(searchValue);
            });
        }

        return {
            ...filteredRequests,
            items
        }
    }, [searchType, searchValue, filteredRequests]);

    const dispatch = (params) => {
        const { type, payload } = params;
        switch (type) {
            case 'delete':
                deleteRequests(payload.ids);
                break;
            case 'export':
                if (!payload.ids) {
                    return;
                }
                const selectionSet = new Set(payload.ids);
                const exportedItems = searchedRequests.items.filter((item) => selectionSet.has(item.request.requestId));

                const exportedObject = {
                    items: exportedItems,
                }
                const exportedString = JSON.stringify(exportedObject);
                const blob = new Blob([exportedString], { type: 'application/json' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'redir-requests.json';
                link.click();
                URL.revokeObjectURL(link.href);
                break;
        }
    }

    return (
        <div className='w-full h-full bg-white grid grid-rows-[80px_1fr]'>
            <div className='grid grid-rows-2 bg-back px-s'>
                <div className='flex justify-start items-center'>
                    <Typography
                        variant='h6'
                        sx={{ fontSize: '1rem', fontWeight: 'bold', mr: 'auto' }}
                    >
                        MATCHED REQUESTS
                    </Typography>
                    {isLimitChanged && <Button
                        className='h-full'
                        title='apply requests limit'
                        onClick={() => setRequstsLimit(limit)}
                    >
                        Apply
                    </Button>}
                    <label
                        className='flex'
                    >
                        <Typography
                            sx={{ fontSize: '1rem', fontWeight: 'bold', pr: '4px' }}
                        >
                            Saved requests limit
                        </Typography>
                        <input
                            type='number'
                            min='1'
                            max='1000'
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            style={{
                                fontSize: '1rem',
                                textAlign: 'end'
                            }}
                            className='text-base mr-2xs rounded-lg'
                        />
                    </label>
                    <Switch
                        checked={isListen}
                        sx={{
                            ml: '4px'
                        }}
                        title={(isListen ? 'disable' : 'enable') + ' listening matched requests'}
                        onChange={toggleListen}
                    ></Switch>
                </div>
                <div className='flex justify-between items-center pr-s'>
                    {searchContent}
                    <IconButton
                        ref={filterRef}
                        title={'shown: ' + filter}
                        size='small'
                        onClick={() => setFilterMenuOpen(true)}
                    >
                        <Badge
                            color='success'
                            variant='dot'
                            invisible={filter === 'All'}
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
                        <MenuItem key='All' onClick={() => changeFilter('All')}>All</MenuItem>
                        {requestMethods.map((method) => {
                            return <MenuItem
                                key={method}
                                onClick={() => changeFilter(method)}
                            >
                                {method}
                            </MenuItem>;
                        })}
                    </Menu>
                </div>
            </div>
            <RequestList
                requests={searchedRequests}
                dispatch={dispatch}
                isDevtools={props.isDevtools}
                isUnpacked={props.isUnpacked}
            />
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

export default Section
