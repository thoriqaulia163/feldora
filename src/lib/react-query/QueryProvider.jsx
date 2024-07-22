import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import PropTypes from 'prop-types';
import React from 'react'

QueryProvider.propTypes = {
    children: PropTypes.node
};
const queryClient = new QueryClient()

export function QueryProvider({children}){
  return (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
  )
}