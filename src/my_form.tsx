import * as React from 'react';
import {useFormState} from './support/use_form_state';
import {createFormState} from './support/form_state';
import {createFieldState} from './support/field_state';
export function MyForm() {

  const formState = useFormState(() => createFormState({
    val1: createFieldState("test", [(val) => val.length > 5 ? null : 'Value should be longer then 5 chars']),
    val2: createFieldState("test2", [(val) => val.length > 10 ? null : 'Value should be longer then 10 chars'])
  }, {
    something: [(values) => values.val1 !== values.val2 ? 'Values should be the same!' : null]
  }))
      
  const allErrorMessages = (Object.values(formState.errorMessages) as string[][])
    .reduce((pv, acc: string[]) => [...acc, ...pv], []);

  return <> 
    <p>
        Your form is: {formState.validates ? 'Valid 🎉' : 'Not Valid, booh! 👻'}
        {allErrorMessages.join('\n')}
    </p>
    
    <input value={formState.fieldsMap.val1.value} onChange={e => formState.fieldsMap.val1.onChange(e.target.value)} />
    <span>Has validated: {formState.fieldsMap.val1.hasValidated + ""}</span>
    {formState.fieldsMap.val1.dirty === true && <span>dirty</span>}
    {formState.fieldsMap.val1.validates === true && <span>yay valid</span>}
    {formState.errorMessages!.val1.length > 0 && <span>{formState.fieldsMap.val1.errorMessages.join(', ')}</span>}


    <br/>
    <br/>
    <br/>

    <input value={formState.fieldsMap.val2.value} onChange={e => formState.fieldsMap.val2.onChange(e.target.value)} />
    <span>Has validated: {formState.fieldsMap.val2.hasValidated + ""}</span>
    {formState.fieldsMap.val2.dirty === true && <span>dirty</span>}
    {formState.fieldsMap.val2.validates === true && <span>yay valid</span>}
    {formState.fieldsMap.val2.errorMessages.length > 0 && <span>{formState.fieldsMap.val2.errorMessages.join(', ')}</span>}
  </>
}
