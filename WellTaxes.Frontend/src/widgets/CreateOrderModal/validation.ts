import { type LatLng } from '@/entities/jurisdiction';

export interface FormState {
    latInput:   string;
    lngInput:   string;
    amount:     string;
    date:       string;
    time:       string;
}

export interface FormErrors {
    lat?:    string;
    lng?:    string;
    amount?: string;
    date?:   string;
    time?:   string;
    picked?: string;
}

export const EMPTY_FORM: FormState = {
    latInput: '',
    lngInput: '',
    amount:   '',
    date:     new Date().toISOString().slice(0, 10),
    time:     new Date().toTimeString().slice(0, 5),
};

export const buildTimestamp = (date: string, time: string): string => {
    return new Date(`${date}T${time}:00`).toISOString();
};

export const validate = (form: FormState, picked: LatLng | null): FormErrors => {
    const errors: FormErrors = {};

    if (!picked)
        errors.picked = 'createOrder.errors.pickPoint';

    const lat = parseFloat(form.latInput);
    if (!form.latInput.trim())        errors.lat = 'createOrder.errors.required';
    else if (isNaN(lat))              errors.lat = 'createOrder.errors.invalidNumber';
    else if (lat < -90 || lat > 90)   errors.lat = 'createOrder.errors.latRange';

    const lng = parseFloat(form.lngInput);
    if (!form.lngInput.trim())        errors.lng = 'createOrder.errors.required';
    else if (isNaN(lng))              errors.lng = 'createOrder.errors.invalidNumber';
    else if (lng < -180 || lng > 180) errors.lng = 'createOrder.errors.lngRange';

    const amount = parseFloat(form.amount);
    if (!form.amount.trim())          errors.amount = 'createOrder.errors.required';
    else if (isNaN(amount))           errors.amount = 'createOrder.errors.invalidNumber';
    else if (amount <= 0)             errors.amount = 'createOrder.errors.positiveAmount';

    if (!form.date.trim())            errors.date = 'createOrder.errors.required';
    if (!form.time.trim())            errors.time = 'createOrder.errors.required';

    return errors;
};
