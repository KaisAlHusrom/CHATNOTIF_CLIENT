import { createContext, useContext, useState } from "react"
import PropTypes from 'prop-types';
const providerContext = createContext()

export const useProviderContext = () => useContext(userContext)

const Provider = ({children}) => {
  return (
    
    <useProviderContext.Provider value={}>
        {children}
    </useProviderContext.Provider>
  )
}

export default Provider

Provider.propTypes = {
    children: PropTypes.node.isRequired
  };
