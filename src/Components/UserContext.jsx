import { createContext, useContext, useState, useCallback, useEffect } from "react"
import PropTypes from 'prop-types';
import { over } from "stompjs"
import SockJS from "sockjs-client/dist/sockjs";
import UsersService from "../Service/UsersService";
import FriendRequestService from "../Service/FriendRequestService";
import MessageService from "../Service/MessageService";
// import Cookies from "universal-cookie"


const userContext = createContext()

const stompClientContext = createContext()

const friendsContext = createContext()

const notificationsContext = createContext()

const messagesContext = createContext()


// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = () => useContext(userContext)

// eslint-disable-next-line react-refresh/only-export-components
export const useStompClientContext = () => useContext(stompClientContext)


// eslint-disable-next-line react-refresh/only-export-components
export const useFriendsContext = () => useContext(friendsContext)

// eslint-disable-next-line react-refresh/only-export-components
export const useNotificationsContext = () => useContext(notificationsContext)

// eslint-disable-next-line react-refresh/only-export-components
// export const useMessagesContext = () => useContext(messagesContext)

export const UserProvider = ({children}) => {
    const [userInfo, setUserInfo] = useState(() => 
        localStorage.getItem("user_data") ? JSON.parse(localStorage.getItem("user_data")) : {}
    )

    
    const [friends, setFriends] = useState([])
    const [notifications, setNotifications] = useState([])

    // const [messages, setMessages] = useState(new Map())

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

        // const fetchMessages = async () => {
        //     if(localStorage.getItem("user_data")) {
        //         if(friends.length > 0) {
        //             const updatedMessages = new Map();
        //             await Promise.all(friends.map(async (friend) => {
        //                 const res = await MessageService.getMessages(userInfo.id, friend.id);
        //                 updatedMessages.set(friend.userName, res.result);
        //             }));
        //             setMessages(new Map(messages))
        //         }
        //     }
        // }

        fetchFriends()
        fetchNotifications()
        // fetchMessages() 
    }, [userInfo])

    const [stompClient] = useState(() => {
        // if (localStorage.getItem("user_data")) {
            const Sock = new SockJS("http://localhost:8080/ws")

            return over(Sock)
        // } else {
        //     return null;
        // }
    } )

    // const cookies = new Cookies()
    
    return (
        <userContext.Provider value={{userInfo , setUserInfo}}>
            <stompClientContext.Provider value={stompClient}>
                <friendsContext.Provider value={{friends, setFriends}}>
                    <notificationsContext.Provider value={{notifications, setNotifications}}>
                    {children}
                        {/* <messagesContext.Provider value={{messages, setMessages}}>
                            
                        </ messagesContext.Provider> */}
                    </notificationsContext.Provider>
                </friendsContext.Provider>
            </stompClientContext.Provider>
        </userContext.Provider>
    )
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired
  };
