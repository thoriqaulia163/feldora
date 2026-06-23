import { useState, type ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Navbar } from '~/components/layout/Navbar'
import { Footer } from '~/components/layout/Footer'
import { NotFoundPage } from '~/components/layout/NotFoundPage'
import { ErrorPage } from '~/components/layout/ErrorPage'
import { GlobalLoader } from '~/components/ui/GlobalLoader'
import { OfflineBanner } from '~/components/ui/OfflineBanner'
import { ToastProvider } from '~/components/ui/Toast'
import { UpdatePrompt } from '~/components/ui/UpdatePrompt'
import appCss from '~/styles/global.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'FELDORA' },
      { name: 'description', content: 'FELDORA — A cinematic digital universe' },
      { name: 'theme-color', content: '#0a0a0f' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/feldora-logo-192.png' },
      { rel: 'manifest', href: '/manifest.json' },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ErrorPage,
})

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RootDocument>
          <GlobalLoader />
          <OfflineBanner />
          <UpdatePrompt />
          <Navbar />
          <main className="relative min-h-screen">
            <Outlet />
          </main>
          <Footer />
        </RootDocument>
      </ToastProvider>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `
if('serviceWorker' in navigator && location.hostname !== 'localhost'){
  navigator.serviceWorker.register('/sw.js').then(function(reg){
    // Check for updates periodically (every 60 min)
    setInterval(function(){ reg.update() }, 60*60*1000);
    // If a waiting SW exists on page load, notify immediately
    if(reg.waiting){
      navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage({type:'__CHECK'});
      window.dispatchEvent(new CustomEvent('sw-update-ready'));
    }
    // Listen for new SW entering waiting state
    reg.addEventListener('updatefound', function(){
      var newSW = reg.installing;
      if(!newSW) return;
      newSW.addEventListener('statechange', function(){
        if(newSW.state === 'installed' && navigator.serviceWorker.controller){
          window.dispatchEvent(new CustomEvent('sw-update-ready'));
        }
      });
    });
  });
}`,
          }}
        />
      </body>
    </html>
  )
}


