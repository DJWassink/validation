import {finalize} from 'rxjs/operators';
import {Observable, combineLatest, BehaviorSubject} from "rxjs";
import {FieldState} from "./field_state";

export interface FormState<T extends FieldStates, U> {
    fieldsMap: FieldsMap<T>,
    touched: boolean;
    dirty: boolean;
    validates: boolean;
    hasValidated: boolean;
    errorMessages: ErrorMessages<FieldsMapValues<T>, U>;
    values: FieldsMapValues<T>;
}

type FieldsMapItemValue<T> = T extends Observable<FieldState<infer U>> ? U : never;
type ObservableValue<T> =  T extends Observable<infer U> ? U : never;

export type FieldsMapValues<T extends FieldStates> = {[P in keyof T]: FieldsMapItemValue<T[P][0]>};
export type FieldsMap<T extends FieldStates> = {[P in keyof T]: ObservableValue<T[P][0]>};

export type FieldStates = {[key: string]: [Observable<FieldState<any>>, FieldState<any>]};
export type ErrorMessages<T, U> = ErrorMap<T> & ErrorMap<U>;
export type ErrorMap<T> = {[P in keyof T]: string[]};
export type FormValidators<T extends FieldStates> = {[key: string]: ReadonlyArray<(values: FieldsMapValues<T>) => string | null>};

export function createFormState<TFieldStates extends FieldStates, TFormValidators extends FormValidators<TFieldStates>>(
    fieldStates: TFieldStates, validators: TFormValidators = {} as TFormValidators
): [Observable<FormState<TFieldStates, TFormValidators>>, FormState<TFieldStates, TFormValidators>]{
    const mapKeys = Object.keys(fieldStates);
    const mapValues = Object.values(fieldStates);
    const mapInitialStates = mapValues.map(states => states[1]);
    const mapObservables = mapValues.map(states => states[0]);

    const initialFormState = fieldStatesToFormState<TFieldStates, TFormValidators>(mapInitialStates, mapKeys, validators);

    const subject = new BehaviorSubject(initialFormState);

    const combined = combineLatest(mapObservables).subscribe(states => {
        subject.next(fieldStatesToFormState<TFieldStates, TFormValidators>(states, mapKeys, validators));
    });

    const observable = subject.pipe(finalize(() => combined.unsubscribe()));

    return [observable, initialFormState];
}



function fieldStatesToFormState<TFieldStates extends FieldStates, TFormValidators extends FormValidators<TFieldStates>>(
    states: Array<FieldState<any>>,
    mapKeys: string[],
    validators: TFormValidators = {} as TFormValidators
) {
    const values = states.reduce((pv, state, index) => Object.assign(pv, {[mapKeys[index]]: state.value}), {} as FieldsMapValues<TFieldStates>);
    
    const errorMessagesMap = states.reduce((pv, state, index) => Object.assign(pv, {[mapKeys[index]]: state.errorMessages}), 
        {} as ErrorMessages<TFieldStates, TFormValidators>
    );

    // Add the form messages to the messagesMap
    Object.keys(validators).forEach(key => {
        const messages = validators[key].map(f => f(values)).filter((m): m is string => typeof m === 'string');
        if (errorMessagesMap[key] !== undefined) {
            errorMessagesMap[key] = [...errorMessagesMap[key], ...messages];
        } else {
            errorMessagesMap[key] = messages;
        }
    });

    const fieldsMap = states.reduce((pv, state, index) => Object.assign(pv, {[mapKeys[index]]: state}), {} as FieldsMap<TFieldStates>);

    const newFormState: FormState<TFieldStates, TFormValidators> = {
        fieldsMap: fieldsMap,
        touched: states.some(s => s.touched),
        dirty: states.some(s => s.dirty),
        validates: Object.values(errorMessagesMap).every(messages => messages.length === 0),
        hasValidated: states.every(s => s.hasValidated),
        errorMessages: errorMessagesMap, 
        values
    }

    return newFormState;
}
