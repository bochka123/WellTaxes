import { type FC } from 'react';

import { useJurisdiction } from '@/entities/jurisdiction';

const Home: FC = () => {
    const { data } = useJurisdiction();

    console.log(data);

    return (
        <></>
    );
};

export default Home;
