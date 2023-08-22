import { createContext, useContext, useState, useCallback, useEffect } from "react"
import PropTypes from 'prop-types';
import { over } from "stompjs"
import SockJS from "sockjs-client/dist/sockjs";
import UsersService from "../Service/UsersService";
import FriendRequestService from "../Service/FriendRequestService";
// import Cookies from "universal-cookie"


const userContext = createContext()

const stompClientContext = createContext()

const friendsContext = createContext()

const notificationsContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = () => useContext(userContext)

// eslint-disable-next-line react-refresh/only-export-components
export const useStompClientContext = () => useContext(stompClientContext)


// eslint-disable-next-line react-refresh/only-export-components
export const useFriendsContext = () => useContext(friendsContext)

// eslint-disable-next-line react-refresh/only-export-components
export const useNotificationsContext = () => useContext(notificationsContext)

export const UserProvider = ({children}) => {
    const [userInfo, setUserInfo] = useState(() => 
        localStorage.getItem("user_data") ? JSON.parse(localStorage.getItem("user_data")) : {}
    )

    
    const [friends, setFriends] = useState([])
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        const fetchFriends = async () => {
            if(localStorage.getItem("user_data")) {
                let requests = await UsersService.GetFriends(userInfo.id)
                setFriends(requests.result)
            } 
        }

        const fetchNotifications = async () => {
            if(localStorage.getItem("user_data")) {
              let requests = await FriendRequestService.getUserRequests(userInfo.id)
              setNotifications(requests.result)
            } 
      
          }

        fetchFriends()
        fetchNotifications()
    }, [userInfo])

    const [stompClient] = useState(() => {
        if (localStorage.getItem("user_data")) {
            const Sock = new SockJS("http://localhost:8080/ws")
            return over(Sock)
        } else {
            return null;
        }
    } )

    // const cookies = new Cookies()
    
    return (
        <userContext.Provider value={{userInfo , setUserInfo}}>
            <stompClientContext.Provider value={stompClient}>
                <friendsContext.Provider value={{friends, setFriends}}>
                    <notificationsContext.Provider value={{notifications, setNotifications}}>
                        {children}
                    </notificationsContext.Provider>
                </friendsContext.Provider>
            </stompClientContext.Provider>
        </userContext.Provider>
    )
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired
  };
