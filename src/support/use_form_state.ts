
import {Observable} from "rxjs";
import {useState, useEffect} from "react";
import {FieldStates, FormValidators, FormState} from "./types";

export const useFormState = <TFieldStates extends FieldStates, TFormValidators extends FormValidators<TFieldStates>>(
    formStates: [Observable<FormState<TFieldStates, TFormValidators>>, FormState<TFieldStates, TFormValidators>]
) => {
    const [value, setValue] = useState<FormState<TFieldStates, TFormValidators> | null>(null);

    useEffect(
        () => {
            const subscription = formStates[0].subscribe({next: setValue});
            return () => {
                subscription.unsubscribe();
            };
        },
        [],
    );

    //Uglfy af
    return value || formStates[1];
}