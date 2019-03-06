import {Observable} from "rxjs";

//Both the FieldState and FormState implement this interface
interface ValidationResult<T> {
    touched: boolean;
    dirty: boolean;
    validates: boolean;
    hasValidated: boolean;
    value: T;
    errors: unknown;
}

//Every object that implements this interface can be used as a FieldState for the FormState
export interface FieldValidationResult<T, U> extends ValidationResult<U> {
    errors: ErrorObject<T>[];
}

export interface ErrorObject<T> {
    value: T;
    message: string;
}

export interface FormState<T extends FieldStates, U extends FormValidators<T>> extends ValidationResult<FieldsMapValues<T>> {
    fieldsMap: FieldsMap<T>,
    errors: ErrorObjects<T, U>;
}

//Extract the value type of a FieldState
type FieldsMapItemValue<T> = T extends Observable<FieldValidationResult<any, infer U>> ? U : never;
//Extract the error type of a FieldState
type FieldsmapErrorValue<T> = T extends Observable<FieldValidationResult<infer U, any>> ? U : never;

//Extract the value type of a generic 
type ObservableValue<T> =  T extends Observable<infer U> ? U : never;

//An object with all the values of the Form
export type FieldsMapValues<T extends FieldStates> = {[P in keyof T]: FieldsMapItemValue<T[P][0]>};

//And object with all the FieldState's
export type FieldsMap<T extends FieldStates> = {[P in keyof T]: ObservableValue<T[P][0]>};

//The return value of a createFieldState or a createArrayFieldState, used by the FormState
export type FieldStates = {[key: string]: [Observable<FieldValidationResult<any, any>>, FieldValidationResult<any, any>]};

//A global validator which has access to all the values in the FormState
export type FormValidators<T extends FieldStates> = {[key: string]: ReadonlyArray<Validator<FieldsMapValues<T>>> };

//A function which returns a string or null, if a string the field is marked as invalid
export type Validator<T> = (value: T) => string | null;


//A combination of all the errors from every field and global form validators
export type ErrorObjects<T extends FieldStates, U extends FormValidators<T>> = FieldsErrorMap<T> & FormErrorMap<T, U>;
export type FieldsErrorMap<T extends FieldStates> = {[P in keyof T]: ErrorObject<FieldsmapErrorValue<T[P][0]>>[]};
export type FormErrorMap<T extends FieldStates, U extends FormValidators<T>> = {[P in keyof U]: ErrorObject<FieldsMapValues<T>>[]};