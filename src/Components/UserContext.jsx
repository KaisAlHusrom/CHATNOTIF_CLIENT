import { createContext, useContext, useState } from "react"
import PropTypes from 'prop-types';
// import Cookies from "universal-cookie"


const userContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = () => useContext(userContext)

export const UserProvider = ({children}) => {
    const [userInfo, setUserInfo] = useState(() => 
        localStorage.getItem("user_data") ? JSON.parse(localStorage.getItem("user_data")) : {}
    )

    // const cookies = new Cookies()
    
    return (
        <userContext.Provider value={{userInfo , setUserInfo}}>
            {children}
        </userContext.Provider>
    )
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired
  };
