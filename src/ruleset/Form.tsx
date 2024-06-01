// react
import { useState } from 'react';

// mui
import {
    Alert,
    AppBar,
    Box,
    Button,
    Chip,
    FormControl,
    IconButton,
    Snackbar,
    TextField,
    Toolbar,
    Typography
} from '@mui/material';

// mui-icons
import CloseIcon from '@mui/icons-material/Close';

// types
import { IStorageGroup, IStorageRule } from '../../service/types';

interface IProps {
    onClose: () => void;
    onSave: (config: object) => void;
    initialParams: IStorageGroup;
    ruleItems: IStorageRule[] | object;
    selectedRules: Set<number>;
}

/**
 * Rule form
 * @param props
 * @returns JSX
 */
export default function RuleForm(props: IProps) {
    const {
        onClose,
        onSave,
        initialParams = {
            tag: '', rules: []
        },
        ruleItems,
        selectedRules
    } = props;

    const [tag, setTag] = useState(initialParams.tag);
    const [rules, setRules] = useState(new Set(initialParams.rules));
    const rulesArray = [...rules.keys()];

    const [snackState, setSnackState] = useState({
        message: ''
    });

    const save = async () => {
        try {
            if (!tag) {
                throw Error("Tag field can't be empty");
            } else if (rules.size <= 1) {
                throw Error('Ruleset shoud include 2 or more rules');
            }
            onSave?.({
                tag,
                rules: [...rules.keys()]
            });
        } catch (e) {
            setSnackState({ message: e.message });
        }
    };

    return <Box sx={{
        width: '100%',
        height: '100%',
        bqcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    }}>
        <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
                <IconButton
                    edge='start'
                    color='inherit'
                    onClick={() => onClose()}
                    aria-label='close'
                >
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
                    Ruleset Form
                </Typography>
                <Button
                    autoFocus
                    color='inherit'
                    onClick={save}
                >
                    Save
                </Button>
            </Toolbar>
        </AppBar>
        <FormControl sx={{ p: '0 1em', mt: '20px' }}>
            <TextField
                required
                id='tag-field-required'
                label='Tag'
                value={tag}
                onChange={(e) => {
                    setTag(e.target.value);
                }}
                sx={{ mt: '1em' }}
            />
            <Box className='flex flex-wrap justify-start items-center mt-s'>
                <Typography className='w-1/2 mb-2 pl-m grow'>INCLUDED RULES:</Typography>
                <Chip
                    label='Reset to initial rules'
                    onClick={() => setRules(new Set(initialParams.rules))}
                />
                <Chip
                    label='Set selected rules'
                    disabled={!selectedRules?.size}
                    onClick={() => setRules(new Set(selectedRules))}
                />
                <Chip
                    label='Include selected rules'
                    disabled={!selectedRules?.size}
                    onClick={() => setRules((prev) => {
                        const next = new Set(prev);
                        selectedRules.forEach((value) => {
                            next.add(value);
                        });
                        return next;
                    })}
                    sx={{ ml: '4px' }}
                />
                <Chip
                    label='Exclude selected rules'
                    disabled={!selectedRules?.size}
                    onClick={() => setRules((prev) => {
                        const next = new Set(prev);
                        selectedRules.forEach((value) => {
                            next.delete(value);
                        });
                        return next;
                    })}
                    sx={{ ml: '4px' }}
                />
            </Box>
            <div className='flex flex-wrap justify-start'>
                {rulesArray?.map((ruleId: number) => {
                    const label = ruleItems[ruleId]?.tag;
                    return <Chip
                        label={label}
                        onDelete={() => {
                            setRules((prev) => {
                                const next = new Set(prev);
                                next.delete(ruleId);
                                return next;
                            });
                        }}
                        sx={{ m: '4px' }}
                    />;
                })}
            </div>
        </FormControl>
        <Snackbar
            open={!!snackState.message}
            autoHideDuration={3000}
            onClose={() => {
                setSnackState((prev) => ({ ...prev, message: '' }));
            }}
        >
            <Alert
                onClose={() => {
                    setSnackState((prev) => ({ ...prev, message: '' }));
                }}
                severity='error'
                variant='filled'
                sx={{ width: '100%' }}
            >
                {snackState.message}
            </Alert>
        </Snackbar>
    </Box>;
}
