import "./SearchBox.css"
import {  useState, useEffect, useRef } from "react"
import UsersService from "./../../Service/UsersService"
import emptyImage from "./../../Assets/Images/emptyImageProfile.png"
import { useFriendsContext, useUserContext, useStompClientContext, useNotificationsContext } from "../../Components/UserContext"
import FriendRequestService from "../../Service/FriendRequestService"


const SearchBox = () => {
    // const navigate = useNavigate()
    const [isSearch, setIsSearch] = useState(false)

    const stompClient = useStompClientContext() 

    const {userInfo} = useUserContext()

    const {friends} = useFriendsContext()

    const {notifications} = useNotificationsContext()
    
    const [searchedUsers, setSearchedUsers] = useState([])

    const searchInput = useRef()

    // const [connectionError, setConnectionError] = useState(false)

    // useEffect(() => {
    //     console.log(userInfo)
    // })
    const searchBoxRef = useRef(null)

    const handleClickOutside = (event) => {
        if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
            setIsSearch(false)
        }
      }
    
      useEffect(() => {
        document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
      }, [])

    const handleSearch = async (e) => {
        let userName = ""
        if (!(typeof e === 'string')) {
            userName = e.target.value
        } else {
            userName = e;
        }

        if (userName !== "") {
            const users = await UsersService.FindUsersByUserName(userName)

            users.result && setSearchedUsers(users.result) 
            setIsSearch(true)
    
        } else {
            setIsSearch(false)
        }
        
    }

    const checkReq = async (senderId, receiverId) => {
        const isThereReq = await FriendRequestService.getUserFriendRequest(senderId, receiverId).then(res => res)
        if(isThereReq.result.status === "PENDING_APPROVAL") {
            return true;
        }
        return false
    }

    

    const handleFriendRequest = async (receiverId) => {
        if (stompClient) {
            let req = {
                senderId: userInfo.id,
                receiverId: receiverId
            }


            const request = await FriendRequestService.addFriendRequest(req)
            stompClient.send(`/api/v1/send-notif`, {}, JSON.stringify(request))
            handleSearch(searchInput.current.value)



        }
    } 

    const handleRemoveFriend = async (userId, friendWithId) => {
        if (stompClient) {
            const isMyFriend = checkIfInMyFriends(friendWithId)

            if(isMyFriend) {
                const result = await UsersService.removeFriend(userId, friendWithId);
                if(result.success) {
                    stompClient.send(`/api/v1/remove-friend`, {}, JSON.stringify(result))
                    handleSearch(searchInput.current.value)
                }
            }

        }
    }

    //every user has receivedRequests key, this function search if logged user is in the received requests.
    const checkRequestFromReceivedRequests = (receivedRequests, userId) => {
        let res = false
        receivedRequests.forEach(req => {
            if (req.requestSender.id === userId && req.status === "PENDING_APPROVAL") {
                res = true                
            }
        })

        return res
    }

    const checkIfInMyFriends = (friendWithId) => {
        let state = false
        friends.forEach(friend => {
          if (friend.id === friendWithId) {
            state = true
          }
        })
    
        return state
      }

    
    

    return (
    <div className="search-box" ref={searchBoxRef}>

                <input type="text" ref={searchInput} onChange={(e) => handleSearch(e)} className="search" name="search" id="search" placeholder="Search Users"/>
                <ul className="search-results" style={{
                    visibility: isSearch ? "visible" : "hidden",
                    opacity: isSearch ? 1 : 0,
                    transform: `translateY(${isSearch ? '0' : '-10%'})`,
                }}>
                    {
                    searchedUsers.length !== 0 
                    ?
                    searchedUsers.map( (user, index) => {
                        if (user.id === userInfo.id) {
                            return null;
                        }

                        //check if logged user send request ot another user
                        const check1 = checkRequestFromReceivedRequests(user.receivedRequests, userInfo.id)

                        //check if any user send request to logged user
                        const check2 = checkRequestFromReceivedRequests(notifications, user.id)

                        const check3 = checkIfInMyFriends(user.id);

                        let result = ""

                        if(check1) {
                            result = <button className="friend-request already-sent">already sent</button>
                        }
                        if(check2) {
                            result = <button className="friend-request already-sent">has send to you</button>
                        }
                        if(check3) {
                            result = <button onClick={() => handleRemoveFriend(userInfo.id, user.id)} className="friend-request">Remove From Friends</button>
                        }

                        return (
                        <li key={index}>
                            <img src={emptyImage} alt="profile" />
                            <p className="user-name">{user.userName}</p>
                            
                            {check1 || check2 || check3 ?
                            result
                            :
                            (
                                <button onClick={() => handleFriendRequest(user.id)} className="friend-request">Send Request</button>
                            )
                            }
                            
                        </li>
                        )
                    })
                    :
                    <li>There is no user like this</li>
                    }
                
                </ul>
            </div>
  )
}

// SearchBox.propTypes = {
//     stompClient: PropTypes.node
//   };

export default SearchBox