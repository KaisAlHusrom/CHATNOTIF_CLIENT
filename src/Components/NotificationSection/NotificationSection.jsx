import { useEffect, useRef, useState } from "react"
import emptyImage from "./../../Assets/Images/emptyImageProfile.png"
import "./NotificationSection.css"
import PropTypes from 'prop-types';
import UsersService from "../../Service/UsersService";
import FriendRequestService from "../../Service/FriendRequestService";
import { useFriendsContext, useUserContext, useStompClientContext, useNotificationsContext } from "../UserContext";

const NotificationSection = () => {
  const notificationBoardRef = useRef(null)
  const [state, setState] = useState(false)

  const handleClickOutside = (event) => {
    if (notificationBoardRef.current && !notificationBoardRef.current.contains(event.target)) {
      setState(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
  }, [])

  const {userInfo} = useUserContext()
  const {friends} = useFriendsContext()
  const stompClient = useStompClientContext() 
  const {notifications} = useNotificationsContext()


  const handleNotifications = async () => {
    if(state === false) {
      await Promise.all(notifications.map(async notification => {
        if (notification.status === "NEW") {
          const request = await FriendRequestService.updateRequestStatusToOld(notification.id)
          stompClient.send(`/api/v1/send-notif`, {}, JSON.stringify(request))
        }
      })) 

      

    }
    

    setState(prev => !prev)
  }

  const handleAcceptFriend = async (userId, friendWithId, reqId) => {
    if(stompClient) {

      const isMyFriend = checkIfInMyFriends(friendWithId)

      if(!isMyFriend) {
        const friend = await UsersService.AddFriend(userId, friendWithId)
        if (friend.success) {
          await FriendRequestService.updateRequestStatusToAccepted(reqId)
          stompClient.send(`/api/v1/accept-friend`, {}, JSON.stringify(friend))
        }
      } else {
        console.log("it's your friend already")
      }


    }
    
    
  }

  const handleRejectFriend = async (userId, senderId, reqId) => {
    if(stompClient) {
      const res = await FriendRequestService.updateRequestStatusToRejected(reqId)
      if(res.success) {
        let req = {
          senderId: userId,
          receiverId: senderId
        }
  
  
        const response = await FriendRequestService.addRejectedNotification(req)
  
        stompClient.send(`/api/v1/reject-friend`, {}, JSON.stringify(response))
      }
      
    }
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
    <li className="bell" ref={notificationBoardRef}>
        <i className="fa-solid fa-bell" onClick={handleNotifications}></i>
        {
          
          <ul className="notifications" style={{
            visibility: state ? "visible" : "hidden",
            opacity: state ? 1 : 0,
            transform: `translateY(${state ? '0' : '-10%'})`,
          }}>
            
            {
              notifications.length !== 0 
              ?
              notifications.slice().reverse().map((req, i) => {
                const dateObject = new Date(req.createdAt);
                return (
                  <li key={i} className={`notif ${req.status !== "PENDING_APPROVAL" && req.status !== "NEW" && "old-notif"}`} >
                      <img src={emptyImage} alt="profile" />
                      <p className="request">
                        {
                          req.content 
                          ?
                          req.content
                          :
                          `${req.requestSender.username} Send friend request for you`
                        }
                      </p>
                      {/* {req.status === "NEW" && (<p>NEW</p>)} */}
                      <div className="date-time">
                        <p className="date">
                        {`${dateObject.getFullYear()}.${dateObject.getMonth() + 1}.${dateObject.getDate()}`}
                        </p>
                        <p className="time">
                        {`${dateObject.getHours()}:${dateObject.getMinutes().toString().padStart(2, '0')}`}
                        </p>
                      </div>
                      {req.status === "ACCEPTED" 
                      ?
                      (
                        <div className="req-reponse-buttons">
                          <button className="friend-request-accept notif-btun">Accepted</button>
                        </ div>

                      )
                      :
                      req.status === "REJECTED"
                      ?
                      (
                        <div className="req-reponse-buttons">
                          <button className="friend-request-reject notif-btun">Rejected</button>
                        </ div>
                      )
                      :
                      req.status === "NEW" || req.status === "OLD"
                      ?
                      (
                        <div className="req-reponse-buttons">
                          <button className="friend-request-reject notif-btun">Rejected</button>
                        </ div>
                      )
                      :
                      (
                        <div className="req-reponse-buttons">
                        <button onClick={() => handleAcceptFriend(userInfo.id, req.requestSender.id, req.id)} className="friend-request-accept">accept</button>
                        <button onClick={() => handleRejectFriend(userInfo.id, req.requestSender.id, req.id)} className="friend-request-reject">Reject</button>
                        </ div>
                      )
                      }
                  </li>
                )
              })
              :
              <li  className="notif">
                      <p className="request">There is no notifications</p>
              </li>
            }
            
          </ul>
        }
        <span className="new-notif-count">
          {Array.isArray(notifications) && notifications.filter(req => req.status === "PENDING_APPROVAL" || req.status === "NEW").length}
        </span>
    </li>
  )
}

NotificationSection.propTypes = {
  notifications: PropTypes.any
}

export default NotificationSection