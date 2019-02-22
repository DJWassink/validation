import {Observable, BehaviorSubject} from 'rxjs';

export interface FieldState<T> {
    touched: boolean;
    dirty: boolean;
    validates: boolean;
    hasValidated: boolean;
    errorMessages: string[];
    value: T;
    onChange: (value: T) => void;
}

function isString(value: any): value is string {
    return typeof value === 'string';
}

export function createFieldState<T>(initialValue: T, validators: ReadonlyArray<(value: T) => string | null>): [Observable<FieldState<T>>, FieldState<T>] {
    let subject: BehaviorSubject<FieldState<T>> | null = null;

    const changeHandler = (value: T) => {
        const validatorMessages = validators.map(v => v(value)).filter(isString);
        const newState: FieldState<T> = {
            touched: true,
            dirty: value !== initialValue,
            value: value,
            errorMessages: validatorMessages,
            validates: validatorMessages.length === 0,
            hasValidated: true,
            onChange: changeHandler,
        }

        if (subject !== null) {
            subject.next(newState);
        }
    }

    const initialState = {
        touched: false,
        dirty: false,
        validates: false,
        hasValidated: false,
        value: initialValue,
        errorMessages: [],
        onChange: changeHandler
    }

    subject = new BehaviorSubject<FieldState<T>>(initialState);

    return [subject.asObservable(), initialState];
}


