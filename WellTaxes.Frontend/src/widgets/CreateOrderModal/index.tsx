import { type ChangeEvent, type Dispatch, type FC, type SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type LatLng, useNyGeoJson } from '@/entities/jurisdiction';
import { useCreateOrder } from '@/entities/order';
import Modal from '@/shared/ui/Modal';

import MapSection from './MapSelection';
import OrderForm  from './OrderForm';
import { buildLocaleTimestamp, EMPTY_FORM, type FormErrors, type FormState, validate } from './validation';

interface Props {
    visible:    boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
}

const CreateOrderModal: FC<Props> = ({ visible, setVisible }) => {
    const { t } = useTranslation();
    const { mutate: createOrder, isPending } = useCreateOrder();
    const nyGeoJson = useNyGeoJson();

    const [picked,  setPicked]  = useState<LatLng | null>(null);
    const [form,    setForm]    = useState<FormState>(EMPTY_FORM);
    const [errors,  setErrors]  = useState<FormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormErrors, boolean>>>({});

    const updateForm = (patch: Partial<FormState>) =>
        setForm((prev) => ({ ...prev, ...patch }));

    const handleMapPick = (p: LatLng): void => {
        setPicked(p);
        updateForm({ latInput: p.lat.toFixed(6), lngInput: p.lng.toFixed(6) });
        setErrors((prev) => ({ ...prev, picked: undefined, lat: undefined, lng: undefined }));
    };

    const handleLatChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const val = e.target.value;
        updateForm({ latInput: val });
        const num = parseFloat(val);
        if (!isNaN(num)) setPicked((prev) => ({ lat: num, lng: prev?.lng ?? 0 }));
    };

    const handleLngChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const val = e.target.value;
        updateForm({ lngInput: val });
        const num = parseFloat(val);
        if (!isNaN(num)) setPicked((prev) => ({ lat: prev?.lat ?? 0, lng: num }));
    };

    const handleBlur = (field: keyof FormErrors) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setErrors(validate(form, picked));
    };

    const reset = () => {
        setPicked(null);
        setForm(EMPTY_FORM);
        setErrors({});
        setTouched({});
    };

    const handleCreate = (): void => {
        setTouched({ lat: true, lng: true, amount: true, date: true, time: true, picked: true });

        const errs = validate(form, picked);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        // eslint-disable-next-line no-console
        console.log(form.date, form.time);
        createOrder(
            {
                amount:    parseFloat(form.amount),
                latitude:  parseFloat(form.latInput),
                longitude: parseFloat(form.lngInput),
                timestamp: buildLocaleTimestamp(form.date, form.time),
            },
            {
                onSuccess: () => { reset(); setVisible(false); },
            }
        );
    };

    return (
        <Modal
            visible={visible}
            setVisible={() => { reset(); setVisible(false); }}
            heading={t('createOrder.heading')}
            zIndexType="top"
        >
            <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">

                <MapSection
                    picked={picked}
                    nyGeoJson={nyGeoJson}
                    touched={touched}
                    error={errors.picked}
                    onPick={handleMapPick}
                />

                <OrderForm
                    form={form}
                    errors={errors}
                    touched={touched}
                    isPending={isPending}
                    onChange={updateForm}
                    onBlur={handleBlur}
                    onLatChange={handleLatChange}
                    onLngChange={handleLngChange}
                    onSubmit={handleCreate}
                />

            </div>
        </Modal>
    );
};

export default CreateOrderModal;
