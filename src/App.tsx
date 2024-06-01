// mui
import { Divider } from '@mui/material';

// local
import Rules from './rule/Section';
import Requests from './request/Section';

// styles
import './App.css';

// types
import { IRules, IRequests } from '../service/types';

interface IProps {
    isDevtools: boolean;
    isUnpacked: boolean;
    isDevMode: boolean;
    data: {
        rules: IRules;
        requests: IRequests;
    }
}

/**
 * Extension root
 */
function App({
    isDevtools,
    data,
    isUnpacked,
    isDevMode
}: IProps) {
    if (!data) {
        return <div></div>;
    } else if (isDevMode || isDevtools) {
        return <div className='grid grid-rows-[1fr] grid-cols-[1fr_auto_1fr] w-full h-full max-h-full overflow-hidden'>
            <div className='h-full overflow-hidden'>
                <Rules initial={data.rules} isDevtools={isDevtools} />
            </div>
            <Divider
                orientation='vertical'
                sx={{ borderWidth: '4px' }}
            />
            <div className='h-full overflow-hidden'>
                <Requests initial={data} isUnpacked={isUnpacked} isDevtools={isDevtools} />
            </div>
        </div>;
    } else {
        return <div className='flex w-[600px] h-[600px]'>
            <Rules initial={data.rules} isDevtools={isDevtools} />
        </div>;
    }
}

export default App;
