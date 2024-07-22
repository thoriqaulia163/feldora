import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './lib/react-query/QueryProvider.jsx';
import App from './App.jsx'
import '@fontsource/roboto/100.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <QueryProvider>
            <App />
        </QueryProvider>
    </BrowserRouter>
)
