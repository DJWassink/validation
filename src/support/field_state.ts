import {Observable, BehaviorSubject} from 'rxjs';
import {ErrorObject, Validator, FieldValidationResult} from './types';

interface FieldState<T> extends FieldValidationResult<T, T> {
    onChange: (value: T) => void;
}

interface ArrayFieldState<T> extends FieldValidationResult<T, T[]> {
    onChange: (value: T[]) => void;
}

export function validate<T>(validators: ReadonlyArray<Validator<T>>, value: T) {
    return validators.reduce((acc: ErrorObject<T>[], v) => {
        const validationResult = v(value);
        if (validationResult !== null) {
            return [
                ...acc,
                {
                    message: validationResult,
                    value: value
                }
            ]
        }
        return acc;
    }, []);
}

export function createFieldState<T>(initialValue: T, validators: ReadonlyArray<Validator<T>>): [Observable<FieldState<T>>, FieldState<T>] {
    let subject: BehaviorSubject<FieldState<T>> | null = null;

    const changeHandler = (value: T) => {
        const errors = validate(validators, value);

        const newState: FieldState<T> = {
            touched: true,
            dirty: value !== initialValue,
            value: value,
            errors: errors,
            validates: errors.length === 0,
            hasValidated: true,
            onChange: changeHandler,
        }

        if (subject !== null) {
            subject.next(newState);
        }
    }

    const errors = validate(validators, initialValue);
    const initialState = {
        touched: false,
        dirty: false,
        validates: false,
        hasValidated: false,
        value: initialValue,
        errors: errors,
        onChange: changeHandler
    }

    subject = new BehaviorSubject<FieldState<T>>(initialState);

    return [subject.asObservable(), initialState];
}

type ExtractFromArray<T extends Array<any>> = T extends (infer U)[] ? U : never;
export function createArrayFieldState<T extends Array<any>>(initialValues: T, validators: ReadonlyArray<Validator<ExtractFromArray<T>>>): [Observable<ArrayFieldState<ExtractFromArray<T>>>, ArrayFieldState<ExtractFromArray<T>>] {
    let subject: BehaviorSubject<ArrayFieldState<ExtractFromArray<T>>> | null = null;

    const changeHandler = (values: any) => {
        const errors = values.reduce((acc: ErrorObject<T>[], value: any) => [...acc, ...validate(validators, value)], []);

        const newState: ArrayFieldState<ExtractFromArray<T>> = {
            touched: true,
            dirty: values !== initialValues,
            value: values,
            errors: errors,
            validates: errors.length === 0,
            hasValidated: true,
            onChange: changeHandler,
        }

        if (subject !== null) {
            subject.next(newState);
        }
    }

    const errors = initialValues.reduce((acc: ErrorObject<T>[], value) => [...acc, ...validate(validators, value)], []);
    const initialState: ArrayFieldState<ExtractFromArray<T>> = {
        touched: false,
        dirty: false,
        validates: false,
        hasValidated: false,
        value: initialValues,
        errors: errors,
        onChange: changeHandler
    }

    subject = new BehaviorSubject<ArrayFieldState<ExtractFromArray<T>>>(initialState);

    return [subject.asObservable(), initialState];
}