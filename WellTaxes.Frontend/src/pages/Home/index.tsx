import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useJurisdiction } from '@/entities/jurisdiction';

interface TeamMember {
    id: number;
    name: string;
    position: string;
    image: string;
}

const Home: FC = () => {
    const { data } = useJurisdiction();
    const { t } = useTranslation();

    console.log(data);

    const TEAM_MEMBERS: TeamMember[] = [
        {
            id: 1,
            name: t('team.oleksandr.name'),
            position: t('team.oleksandr.position'),
            image: './oleksandr.jpg',
        },
        {
            id: 2,
            name: t('team.oleksii.name'),
            position: t('team.oleksii.position'),
            image: './oleksii.jpg',
        },
        {
            id: 3,
            name: t('team.yaroslav.name'),
            position: t('team.yaroslav.position'),
            image: './yaroslav.jpg',
        },
        {
            id: 4,
            name: t('team.nadiia.name'),
            position: t('team.nadiia.position'),
            image: './nadiia.jpg',
        },
    ];

    return (
        <div className="w-full">
            <section className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 py-12 md:py-20 px-4 md:px-8">
                <div className="flex flex-col gap-2 max-w-6xl mx-auto">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        {t('welcome.title')}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl">
                        {t('welcome.description')}
                    </p>
                </div>
            </section>

            <section className="flex flex-col align-middle py-12 md:py-20 px-4 md:px-8 bg-white">
                <div className="flex flex-col self-center gap-8 w-full mx-auto max-w-320">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
                        {t('team.aboutUs')}
                    </h2>
                    <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center items-start">
                        {TEAM_MEMBERS.map((member) => (
                            <div
                                key={member.id}
                                className="flex flex-col gap-1 items-center text-center transform transition duration-300 hover:scale-105"
                            >
                                <div className="w-40 h-40 md:w-32 md:h-32 lg:w-40 lg:h-40 mb-4 rounded-full overflow-hidden shadow-lg">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                                        {member.name}
                                    </h3>
                                    <p className="text-base md:text-sm lg:text-base text-gray-600">
                                        {member.position}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
