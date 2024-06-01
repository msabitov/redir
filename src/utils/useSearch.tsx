// react
import { Button, Divider, IconButton, Menu, MenuItem, Paper } from '@mui/material';
import { useRef, useState } from 'react';

// mui
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// types
interface ISearchOptions {
    initialSearchType: string;
    searchTypes: string[];
    timeout?: number;
}

const useSearch = (props: ISearchOptions) => {
    const {
        initialSearchType,
        searchTypes,
        timeout = 1000
    } = props;
    const [searchValue, setSearchValue] = useState('');
    const searchRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const searchTypeRef = useRef(null);
    const [searchMenuOpen, setSearchMenuOpen] = useState(false);
    const [searchType, setSearchType] = useState(initialSearchType);

    const search = () => {
        searchTimeoutRef.current = null;
        const nextValue = searchRef.current.value;
        if (nextValue !== searchValue) {
            setSearchValue(nextValue);
        }
    };

    const changeSearchType = (val: string) => {
        setSearchType(val)
        setSearchMenuOpen(false);
    };

    function debounceSearch() {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => search(), timeout);
    }

    const searchContent = <div className='flex grow items-center pr-s'>
        <Paper
            component='div'
            sx={{ display: 'flex', borderRadius: '30px', boxShadow: 'none' }}
            className='h-full grow overflow-hidden mr-s'
        >
            <Button
                variant='contained'
                ref={searchTypeRef}
                onClick={() => setSearchMenuOpen(true)}
                sx={{ fontSize: '1rem', width: '94px', height: '42px' }}
            >
                {searchType}
            </Button>
            <input
                ref={searchRef}
                placeholder='Search by tag'
                aria-label='Search by tag'
                className='outline-none grow pl-xs text-base'
                onKeyDown={(e) => {
                    if (e.code === 'Enter') {
                        search();
                    }
                }}
                onChange={() => {
                    debounceSearch();
                }}
                style={{
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                }}
            />
            {searchValue ? <IconButton
                type='button' sx={{ p: '10px' }}
                onClick={() => {
                    searchRef.current.value = '';
                    search();
                }}
            >
                <ClearIcon />
            </IconButton> : null}
            <Divider sx={{ height: 28, m: 0.5 }} orientation='vertical' />
            <IconButton
                color='primary'
                sx={{ p: '10px' }}
                onClick={() => {
                    search();
                }}
                size='small'
            >
                <SearchIcon />
            </IconButton>
        </Paper>
        <Menu
            id='search-type-menu'
            anchorEl={searchTypeRef.current}
            open={searchMenuOpen}
            onClose={() => setSearchMenuOpen(false)}
            MenuListProps={{
                'aria-labelledby': 'basic-button',
            }}
        >
            {searchTypes.map((val) => <MenuItem
                key={val}
                onClick={() => changeSearchType(val)}
            >
                {val}
            </MenuItem>)}
        </Menu>
    </div>;
    return {
        searchType,
        searchValue,
        searchContent
    }
}

export default useSearch;
