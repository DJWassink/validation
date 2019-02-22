
import {Observable, observable} from "rxjs";

import {FormState, FieldStates, FormValidators} from "./form_state";

import {useState, useEffect} from "react";

export const useFormState = <TFieldStates extends FieldStates, TFormValidators extends FormValidators<TFieldStates>>(
    formStateCallback: () => [Observable<FormState<TFieldStates, TFormValidators>>, FormState<TFieldStates, TFormValidators>]
  ) => {
    const [value, setValue] = useState<FormState<TFieldStates, TFormValidators> | null>(null);
  
    useEffect(
        () => {
            const formState = formStateCallback();
            const subscription = formState[0].subscribe({next: setValue});
            return () => {
                subscription.unsubscribe();
            };
        },
        [observable],
    );
  
    //Uglfy af
    return value || formStateCallback()[1];
  }