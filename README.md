# RxJs - Form Validation
Easy form validation with RxJs 


Create a `FormState` with `FieldState`'s which container validators to ensure correct values in your form 🎉
```ts
function minLength(value: {length: number}, length: number, name?: string) {
  if (value.length > length) {
    return null;
  }
  return name || 'Value' + ' should be longer then ' + length;
}

const formStates = createFormState({
  val1: createFieldState("test", [v => minLength(v, 5, 'Value')]),
  val2: createFieldState("test2",[v => minLength(v, 10, 'Value')]),
  someArray: createArrayFieldState([{val1: true}, {val1: false}], [
    (val) => val.val1 === true ? null : 'Should be checked'
  ])
}, {
  something: [(values) => values.val1 !== values.val2 ? 'Values should be the same!' : null]
});
```


Next up, use your `FormState` in your view. Completely type-safe!
```tsx
export function MyForm() {
  const formState = useFormState(formStates);
      
  return <> 
    <p>
        Your form is: {formState.validates ? 'Valid 🎉' : 'Not Valid, booh! 👻'}
        <br />
        {formState.errors.something.map(s => '❌ ' + s.message).join('\n')}
    </p>
    
    <input value={formState.fieldsMap.val1.value} onChange={e => formState.fieldsMap.val1.onChange(e.target.value)} />
    {formState.errors!.val1.length > 0 && <span>{formState.fieldsMap.val1.errors.map(e => '❌ ' + e.message).join(', ')}</span>}
    <br/>

    <input value={formState.fieldsMap.val2.value} onChange={e => formState.fieldsMap.val2.onChange(e.target.value)} />
    {formState.fieldsMap.val2.errors.length > 0 && <span>{formState.fieldsMap.val2.errors.map(e => '❌ ' + e.message).join(', ')}</span>}
    <br/>

    {formState.value.someArray.map((e, index) => (
      <div key={index}>
        <input 
          type="checkbox" 
          checked={e.val1} 
          onChange={() => {
            const newArray = formState.value.someArray.map(val => val === e ? {val1: !e.val1} : val);
            formState.fieldsMap.someArray.onChange(newArray)
          }} 
          />
          <br />
          {formState.errors.someArray.filter(o => (o.value) === e).map(e => '❌ ' + e.message).join('\n')}
      </div>
    ))}
  </>
}


```