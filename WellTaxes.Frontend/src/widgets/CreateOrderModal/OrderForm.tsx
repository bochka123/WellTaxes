import { type ChangeEvent, type FC } from 'react';
import { useTranslation } from 'react-i18next';

import Field from '@/shared/ui/Field';

import { type FormErrors, type FormState } from './validation';

interface Props {
    form:         FormState;
    errors:       FormErrors;
    touched:      Partial<Record<keyof FormErrors, boolean>>;
    isPending:    boolean;
    onChange:     (patch: Partial<FormState>) => void;
    onBlur:       (field: keyof FormErrors) => void;
    onLatChange:  (e: ChangeEvent<HTMLInputElement>) => void;
    onLngChange:  (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit:     () => void;
}

const OrderForm: FC<Props> = ({
                                  form, errors, touched, isPending,
                                  onChange, onBlur, onLatChange, onLngChange, onSubmit,
                              }) => {
    const { t } = useTranslation();

    const inputBase   = 'w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-colors bg-white';
    const inputNormal = `${inputBase} border-zinc-200 focus:border-[#63aeff]`;
    const inputError  = `${inputBase} border-red-300 focus:border-red-400`;
    const fieldInput  = (hasError: boolean) => hasError ? inputError : inputNormal;

    const err = (field: keyof FormErrors) =>
        touched[field] && errors[field] ? t(errors[field]!) : undefined;

    return (
        <div className="flex flex-col gap-3 w-full sm:w-[45%] sm:min-w-0">
            
            <Field label={t('createOrder.latitude')} error={err('lat')}>
                <input
                    type="number" step="any"
                    placeholder={t('createOrder.latitudePlaceholder')}
                    value={form.latInput}
                    onChange={onLatChange}
                    onBlur={() => onBlur('lat')}
                    className={fieldInput(!!touched.lat && !!errors.lat)}
                />
            </Field>

            <Field label={t('createOrder.longitude')} error={err('lng')}>
                <input
                    type="number" step="any"
                    placeholder={t('createOrder.longitudePlaceholder')}
                    value={form.lngInput}
                    onChange={onLngChange}
                    onBlur={() => onBlur('lng')}
                    className={fieldInput(!!touched.lng && !!errors.lng)}
                />
            </Field>
            
            <Field label={t('createOrder.amount')} error={err('amount')}>
                <input
                    type="number" step="any" min="0"
                    placeholder={t('createOrder.amountPlaceholder')}
                    value={form.amount}
                    onChange={(e) => onChange({ amount: e.target.value })}
                    onBlur={() => onBlur('amount')}
                    className={fieldInput(!!touched.amount && !!errors.amount)}
                />
            </Field>
            
            <div className="flex gap-2">
                <Field label={t('createOrder.date')} error={err('date')} className="flex-1">
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => onChange({ date: e.target.value })}
                        onBlur={() => onBlur('date')}
                        className={fieldInput(!!touched.date && !!errors.date)}
                    />
                </Field>

                <Field label={t('createOrder.time')} error={err('time')} className="w-28">
                    <input
                        type="time"
                        value={form.time}
                        onChange={(e) => onChange({ time: e.target.value })}
                        onBlur={() => onBlur('time')}
                        className={fieldInput(!!touched.time && !!errors.time)}
                    />
                </Field>
            </div>

            <button
                type="button"
                onClick={onSubmit}
                disabled={isPending}
                className="mt-auto w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#63aeff' }}
            >
                {isPending ? t('createOrder.creating') : t('createOrder.createButton')}
            </button>

        </div>
    );
};

export default OrderForm;
