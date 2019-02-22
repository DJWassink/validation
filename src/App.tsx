import React, {useState} from 'react';
import './App.css';
import {MyForm} from './my_form';

export function App () {
  const [showForm, setForm] = useState(true);

  return <div className="App">
    <header className="App-header">
        <button onClick={() => setForm(!showForm)}>Toggle form</button>
        <React.Suspense fallback={<div>Not yet 😊</div>}>
          {showForm && <MyForm />}
        </React.Suspense>
    </header>
  </div>
}

