import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './lib/react-query/QueryProvider.jsx';
// import theme from "@/theme/theme" //Custom Theme
import App from './App.jsx'
// import '@fontsource/roboto/100.css';
// import '@fontsource/roboto/300.css';
// import '@fontsource/roboto/400.css';
// import '@fontsource/roboto/500.css';
// import '@fontsource/roboto/700.css';
// import '@fontsource/roboto/900.css';

const reactHelmetContext = {}

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <QueryProvider>
        <HelmetProvider context={reactHelmetContext}>
          <App />
        </HelmetProvider>
      </QueryProvider>
    </BrowserRouter>
)
