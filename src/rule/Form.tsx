// react
import { useState } from 'react';

// mui
import {
    Alert, AppBar, Box, Button,
    Chip, FormControl, IconButton, InputLabel,
    MenuItem, Select, Snackbar, TextField,
    Toolbar, Typography
} from '@mui/material';

// mui-icons
import CloseIcon from '@mui/icons-material/Close';
import QuizIcon from '@mui/icons-material/Quiz';

// local
import {
    MAX_RES_TYPES, DEFAULT_RESOURCE_TYPES
} from '../utils/rulesUtils';

// types
import { IExtStorageRule, TRuleType } from '../../service/types';

interface IProps {
    initialParams: IExtStorageRule;
    onSave: (config: IExtStorageRule) => void;
    onClose: () => void;
}

const validateRegex = async (regex?: string) => {
    return chrome?.declarativeNetRequest?.isRegexSupported({
        isCaseSensitive: true,
        requireCapturing: true,
        regex
    });
}

const regexMessages = {
    syntaxError: 'The regular expression is syntactically incorrect,' +
        'or uses features not available in the RE2 syntax (https://github.com/google/re2/wiki/Syntax).',
    memoryLimitExceeded: 'The regular expression exceeds the memory limit.' +
        'Each rule must be less than 2KB once compiled.'
};

export default function RuleForm(props: IProps) {
    const {
        initialParams,
        onSave,
        onClose
    } = props;
    const [ruleParams, setRuleParams] = useState(initialParams);

    const [snackState, setSnackState] = useState({
        message: '',
        isError: true
    });
    const resourceSet = new Set(ruleParams?.resourceTypes)
    const [testStr, setTestStr] = useState('');

    const save = async () => {
        try {
            if (!ruleParams.tag || !ruleParams.from || !ruleParams.to) {
                throw Error("Rule fields can't be empty");
            } else if (!ruleParams.resourceTypes?.length) {
                throw Error('Rule shoud match one resource type at least');
            }
            if (ruleParams.type === 'regex') {
                const regexValidation = await validateRegex(ruleParams.from);
                if (!regexValidation.isSupported) {
                    throw Error(regexMessages[regexValidation.reason]);
                }
            }
            onSave?.(ruleParams);
        } catch (e) {
            setSnackState({ message: e.message, isError: true });
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
                    onClick={() => onClose?.()}
                    aria-label='close'
                >
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
                    Rule Form
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
            <InputLabel id='type-select-label' sx={{ pl: '18px' }}>Type</InputLabel>
            <Select
                labelId='type-select-label'
                id='type-select'
                key='type-select'
                value={ruleParams.type}
                label='Type'
                onChange={(e) => setRuleParams({
                    ...ruleParams,
                    type: e.target.value as TRuleType
                })}
            >
                <MenuItem value={'regex'}>Regex (RE2 syntax)</MenuItem>
                <MenuItem value={'filter'}>Wildcard</MenuItem>
            </Select>
            <TextField
                required
                id='from-field-required'
                label='From'
                value={ruleParams.from}
                onChange={(e) => {
                    setRuleParams({
                        ...ruleParams,
                        from: e.target.value
                    })
                }}
                sx={{ mt: '1em' }}
            />
            <TextField
                required
                id='to-field-required'
                label='To'
                value={ruleParams.to}
                onChange={(e) => {
                    setRuleParams({
                        ...ruleParams,
                        to: e.target.value
                    })
                }}
                sx={{ mt: '1em' }}
            />
            {(ruleParams.type === 'regex') && <div className='flex items-center' style={{ marginTop: '1rem' }}>
                <TextField
                    id='test-field'
                    label='Test Regex URL'
                    value={testStr}
                    disabled={!ruleParams.from}
                    onChange={(e) => {
                        setTestStr(e.target.value)
                    }}
                    className='grow'
                />
                <IconButton
                    disabled={!testStr || !ruleParams.from || (ruleParams.type !== 'regex')}
                    onClick={() => {
                        const regexp = new RegExp(ruleParams.from)
                        const match = regexp.test(testStr);
                        if (match) {
                            setSnackState({ message: 'URL fits', isError: false });
                        } else {
                            setSnackState({ message: "The URL doesn't fit", isError: true });
                        }
                    }}
                >
                    <QuizIcon />
                </IconButton>
            </div>}
            <TextField
                required
                id='tag-field-required'
                label='Tag'
                value={ruleParams.tag}
                onChange={(e) => {
                    setRuleParams({
                        ...ruleParams,
                        tag: e.target.value
                    })
                }}
                sx={{ mt: '1em' }}
            />
            <Box className='flex flex-wrap justify-between items-center mt-s'>
                <Typography className='w-1/2 mb-2 pl-m'>Resource type:</Typography>
                <Chip
                    className='w-1/2'
                    key='All'
                    label='All'
                    color={ruleParams?.resourceTypes.length === MAX_RES_TYPES ? 'primary' : undefined}
                    onClick={() => {
                        if (ruleParams?.resourceTypes.length !== MAX_RES_TYPES) {
                            setRuleParams({
                                ...ruleParams,
                                resourceTypes: DEFAULT_RESOURCE_TYPES
                            });
                        } else {
                            setRuleParams({
                                ...ruleParams,
                                resourceTypes: []
                            });
                        }
                    }}
                />
                <div className='flex flex-wrap items-center justify-stretch pt-2'>
                    {DEFAULT_RESOURCE_TYPES.map((type) => {
                        return <Chip
                            key={type}
                            label={type}
                            color={resourceSet.has(type) ? 'primary' : undefined}
                            onClick={() => {
                                let resourceTypes;
                                if (!resourceSet.has(type)) {
                                    resourceTypes = [...ruleParams.resourceTypes, type];
                                } else {
                                    const nextSet = new Set(ruleParams.resourceTypes);
                                    nextSet.delete(type);
                                    resourceTypes = [...nextSet.keys()];
                                }
                                setRuleParams({
                                    ...ruleParams,
                                    resourceTypes
                                });
                            }}
                            sx={{ mr: '4px', my: '4px' }}
                        />;
                    })}
                </div>
            </Box>
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
                severity={snackState.isError ? 'error' : 'success'}
                variant='filled'
                sx={{ width: '100%' }}
            >
                {snackState.message}
            </Alert>
        </Snackbar>
    </Box >;
}