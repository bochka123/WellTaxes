import { type ChangeEvent, type Dispatch, type FC, type SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type LatLng } from '@/entities/jurisdiction';
import Map from '@/entities/jurisdiction/ui/Map.tsx';
import Modal from '@/shared/ui/Modal';

interface Props {
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
}

const CreateOrderModal: FC<Props> = ({ visible, setVisible }) => {
    const { t } = useTranslation();
    const [picked, setPicked] = useState<LatLng | null>(null);
    const [latInput, setLatInput] = useState('');
    const [lngInput, setLngInput] = useState('');
    const [price, setPrice] = useState('');

    const handleMapPick = (p: LatLng): void => {
        setPicked(p);
        setLatInput(p.lat.toFixed(6));
        setLngInput(p.lng.toFixed(6));
    };

    const handleLatChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setLatInput(e.target.value);
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            setPicked((prev) => ({ lat: val, lng: prev?.lng ?? 0 }));
        }
    };

    const handleLngChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setLngInput(e.target.value);
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            setPicked((prev) => ({ lat: prev?.lat ?? 0, lng: val }));
        }
    };

    const handleCreate = (): void => {
        // TODO: call API
        setVisible(false);
    };

    const inputClass =
        'w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:border-[#63aeff] transition-colors';

    return (
        <Modal visible={visible} setVisible={setVisible} heading={t('createOrder.heading')}>
            <div className="flex flex-1 flex-col sm:flex-row items-stretch gap-4 p-4 sm:p-5">

                <div className="w-full sm:w-2/3 rounded overflow-hidden">
                    <Map picked={picked} onPick={handleMapPick} />
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-1/3">
                
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">{t('createOrder.latitude')}</label>
                        <input
                            type="number"
                            step="any"
                            placeholder={t('createOrder.latitudePlaceholder')}
                            value={latInput}
                            onChange={handleLatChange}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">{t('createOrder.longitude')}</label>
                        <input
                            type="number"
                            step="any"
                            placeholder={t('createOrder.longitudePlaceholder')}
                            value={lngInput}
                            onChange={handleLngChange}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">{t('createOrder.price')}</label>
                        <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder={t('createOrder.pricePlaceholder')}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex flex-1 items-end">
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="w-full py-2 rounded border-2 border-green-500 text-green-600 text-sm font-semibold hover:bg-green-500 hover:text-white transition-colors cursor-pointer bg-transparent"
                        >
                            {t('createOrder.createButton')}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CreateOrderModal;
