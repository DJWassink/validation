import {finalize} from 'rxjs/operators';
import {Observable, combineLatest, BehaviorSubject} from "rxjs";
import {validate} from "./field_state";
import {FieldStates, FormValidators, FormState, FieldValidationResult, FieldsMapValues, ErrorObjects, FieldsMap} from './types';

export function createFormState<TFieldStates extends FieldStates, TFormValidators extends FormValidators<TFieldStates>>(
    fieldStates: TFieldStates, validators: TFormValidators = {} as TFormValidators
): [Observable<FormState<TFieldStates, TFormValidators>>, FormState<TFieldStates, TFormValidators>] {
    console.info('create form');
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
    states: Array<FieldValidationResult<any, any>>,
    mapKeys: string[],
    validators: TFormValidators = {} as TFormValidators
) {
    const value = states.reduce((pv, state, index) => Object.assign(pv, {[mapKeys[index]]: state.value}), {} as FieldsMapValues<TFieldStates>);
    const errors = states.reduce((pv, state, index) => Object.assign(pv, {[mapKeys[index]]: state.errors}), 
        {} as ErrorObjects<TFieldStates, TFormValidators>
    );
    
    // Add the form messages to the errors map, sadly typescript doesn't like assiging them :(
    Object.keys(validators).forEach(key => {
        const formErrors = validate(validators[key], value);
        if (errors[key] !== undefined) {
            (errors[key] as any) = [...errors[key], ...formErrors];
        } else {
            (errors[key] as any) = formErrors;
        }
    });

    const fieldsMap = states.reduce((pv, state, index) => Object.assign(pv, {[mapKeys[index]]: state}), {} as FieldsMap<TFieldStates>);

    const newFormState: FormState<TFieldStates, TFormValidators> = {
        fieldsMap: fieldsMap,
        touched: states.some(s => s.touched),
        dirty: states.some(s => s.dirty),
        validates: Object.values(errors).every(messages => messages.length === 0),
        hasValidated: states.every(s => s.hasValidated),
        errors: errors, 
        value
    }

    return newFormState;
}
