// react
import { useMemo } from 'react';

// mui
import {
    Box, Button, Chip, IconButton, Paper, Typography
} from '@mui/material';

// mui-icons
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import GitHubIcon from '@mui/icons-material/GitHub';

// types
import { IRules } from '../../service/types';

type TSetChecked = (prevState: Set<number>) => Set<number>;
interface IProps {
    rules: IRules;
    dispatch: (config: {
        type: string;
        payload?: object;
    }) => void;
    checkedRules: Set<number>;
    setCheckedRules: (nextState: Set<number> | TSetChecked) => void;
    searchValue: string;
}

export default function List(props: IProps) {
    const {
        rules,
        dispatch,
        setCheckedRules,
        searchValue = ''
    } = props;

    const { groups, groupOrder } = rules;

    const searchedGroupOrder = useMemo(() => {
        if (!searchValue) {
            return groupOrder;
        }

        const order = groupOrder.filter((id) => {
            const item = groups[id];
            return item?.tag.includes(searchValue);
        });
        return order;
    }, [searchValue, groupOrder, groups]);

    return <Box sx={{
        width: '100%',
        height: '100%',
        bqcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '300px'
    }}>
        <div className='grid grid-rows-[40px_1fr] w-full overflow-hidden grow'>
            <div className='bg-back flex justify-between items-center px-s'>
                <div className='h-3/4 grow flex items-center'>
                    <Button
                        variant='contained'
                        component='label'
                        startIcon={<GitHubIcon />}
                        className='h-full'
                        title='Visit repository'
                        onClick={() => dispatch({ type: 'visit' })}
                        sx={{ borderRadius: '16px' }}
                    >
                        Visit repo
                    </Button>
                </div>
            </div>
            <ul className='divide-y divide-solid'>
                {searchedGroupOrder?.length ?
                    searchedGroupOrder.map((id, ind) => {
                        const group = groups[id];
                        return <li
                            key={id}
                            className='h-[124px] grid grid-rows-[40px_32px_32px] gap-y-1 px-s shadow-md py-4xs'
                        >
                            <div
                                className='flex justify-between items-center h-[40px]'
                            >
                                <Chip
                                    color='primary'
                                    label={group.tag}
                                />
                            </div>
                            <div className='flex overflow-hidden'>
                                <Paper
                                    elevation={0}
                                    className='flex shrink-0 bg-stone-400 h-full'
                                    variant='outlined'
                                    sx={{ borderRadius: '30px' }}
                                >
                                    <IconButton
                                        key='markRuleset'
                                        edge='end'
                                        aria-label='markRuleset'
                                        title='Mark rules from ruleset'
                                        size='small'
                                        onClick={() => {
                                            setCheckedRules(new Set(group.rules));
                                        }}
                                    >
                                        <DoneAllIcon />
                                    </IconButton>
                                    <IconButton
                                        key='unmarkRuleset'
                                        edge='end'
                                        aria-label='unmarkRuleset'
                                        title='Unmark rules from ruleset'
                                        size='small'
                                        onClick={() => {
                                            setCheckedRules((prev) => {
                                                [...group.rules.keys()].forEach((key) => prev.delete(key))
                                                return new Set(prev);
                                            });
                                        }}
                                    >
                                        <RemoveDoneIcon />
                                    </IconButton>
                                    <IconButton
                                        key='enableRules'
                                        edge='end'
                                        aria-label='enableRuleset'
                                        title='Enable rules from ruleset'
                                        size='small'
                                        onClick={(event) => dispatch?.({
                                            type: 'enableRules',
                                            payload: {
                                                event,
                                                ids: group.rules
                                            }
                                        })}
                                    >
                                        <CheckCircleIcon />
                                    </IconButton>
                                    <IconButton
                                        key='disableRuleset'
                                        edge='end'
                                        aria-label='disableRuleset'
                                        title='Disable rules from ruleset'
                                        size='small'
                                        onClick={(event) => dispatch?.({
                                            type: 'disableRules',
                                            payload: {
                                                event,
                                                ids: group.rules
                                            }
                                        })}
                                    >
                                        <CancelIcon />
                                    </IconButton>
                                </Paper>
                            </div>
                            <div className='flex overflow-hidden'>
                                <Paper
                                    elevation={0}
                                    className='flex h-full shrink-0 bg-stone-400'
                                    variant='outlined'
                                    sx={{ borderRadius: '30px' }}
                                >
                                    <IconButton
                                        key='editRuleset'
                                        edge='end'
                                        aria-label='editRuleset'
                                        title='Edit ruleset'
                                        size='small'
                                        onClick={() => {
                                            dispatch({
                                                type: 'editRuleset',
                                                payload: {
                                                    data: group
                                                }
                                            })
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        key='deleteRuleset'
                                        edge='end'
                                        aria-label='deleteRuleset'
                                        title='Delete ruleset'
                                        size='small'
                                        onClick={(event) => dispatch?.({
                                            type: 'deleteRuleset',
                                            payload: {
                                                event,
                                                ids: [id]
                                            }
                                        })}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton
                                        edge='end'
                                        aria-label='moveUp'
                                        size='small'
                                        title='Move up'
                                        disabled={ind === 0}
                                        onClick={(event) => dispatch?.({
                                            type: 'moveRulesetUp',
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
                                        title='Move down'
                                        disabled={ind === (rules.groupOrder.length - 1)}
                                        onClick={(event) => dispatch?.({
                                            type: 'moveRulesetDown',
                                            payload: {
                                                event,
                                                id
                                            }
                                        })}
                                    >
                                        <ArrowDropDownIcon />
                                    </IconButton>
                                </Paper>
                            </div>
                        </li>;
                    })
                    :
                    !searchValue ? <li
                        key='empty'
                        className='h-32 py-2 px-s flex items-center justify-center'
                    >
                        <Paper
                            elevation={3}
                            sx={{ p: '8px' }}
                        >
                            <Typography>You can select 2 or more rules and then add new ruleset</Typography>
                        </Paper>
                    </li> : null
                }
            </ul>
        </div>
    </Box>;
}
