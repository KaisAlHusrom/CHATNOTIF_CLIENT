import { useEffect, useRef, useState } from "react"
import ChatImage from "../../Assets/Images/chat.png"
import MessageService from "../../Service/MessageService"
import UsersService from "../../Service/UsersService"
import FriendRequestService from "../../Service/FriendRequestService"
import { useUserContext, useStompClientContext, useFriendsContext, useNotificationsContext } from "../../Components/UserContext"
import PropTypes from 'prop-types';
import emptyImage from "./../../Assets/Images/emptyImageProfile.png"

import "./Chat.css"

const Chat = ({receiverUser, messagesState}) => {
  const {sendTo, setSendTo} = receiverUser
  const messageInput = useRef()
  const messagesRef = useRef()
  const [settingBoardIsOpen, setSettingBoardIsOpen] = useState(false);
  const settingBoardRef = useRef(null);

  //close chat settings board if click outside of it.
  const handleSettingBoard = () => {
    setSettingBoardIsOpen(!settingBoardIsOpen)
  }
  const handleClickOutside = (event) => {
        if (settingBoardRef.current && !settingBoardRef.current.contains(event.target)) {
            setSettingBoardIsOpen(false);
        }
  };
  useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
  }, []);

  const stompClient = useStompClientContext() 
  const {userInfo} = useUserContext()
  const { setFriends} = useFriendsContext()
  const { setNotifications} = useNotificationsContext()
  const [messages, setMessages] = useState([])
  // let userMessages =  messages[sendTo.userName]


  useEffect(() => {
    //move scroll to bottom every message send
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }

    //convert the new messages to old when current chat keep open
    let timer;

    if (receiverUser.sendTo !== "") {
      const convertNesMessagesToOld = async () => {

        let newMessages = messages.filter(message => message.status === "NEW" && message.sender.id !== userInfo.id)

        await Promise.all(newMessages.map(async message => {
              await MessageService.updateMessageStatusToOld(message.id)
        }))
      }

      timer = setTimeout(() => {
          convertNesMessagesToOld()
      }, 1000)
    }


  // // Clear the timer if the chat closes or state changes
  return () => clearTimeout(timer);
    
  }, [messages])

  const [messageContent, setMessageContent] = useState("")

  //When open chat box...
  useEffect(() => {

     // Scroll to the bottom of the message list
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }

    const fetchMessages = async () => {
      const allMessages = await MessageService.getMessages(userInfo.id, receiverUser.sendTo.id)
      if (allMessages.success) {

        setMessages(allMessages.result)

      }
    } 

    


    if (receiverUser.sendTo !== "") {
      

      fetchMessages()
    }

    if(stompClient) {
      stompClient.connect({}, onConnected, onError)
    }

  }, [receiverUser.sendTo])

  const onConnected = () => {

    stompClient.subscribe("/user-auth/authenticate", onAuthentication)


    stompClient.subscribe("/user-message/send-message", onMessageSend)

    stompClient.subscribe("/user-notification/send-notif", onNotifSent)
    stompClient.subscribe("/user-notification/accept-friend", onFriendAccepted)
    stompClient.subscribe("/user-notification/reject-friend", onFriendRejected)
    stompClient.subscribe("/user-notification/remove-friend", onFriendRemoved)
  }

  const onError = err => {
    console.log(err)
  }



  const onAuthentication = async () => {
    const friends = await UsersService.GetFriends(userInfo.id)
    setFriends(friends.result)

  }



  //the result when send friend request
  const onNotifSent = async (payload) => {
    let data = JSON.parse(payload.body)
    if (data.success) {
      let requests = await FriendRequestService.getUserRequests(userInfo.id)
      setNotifications(requests.result)
    }

  }

  //the result when accepted friend request
  const onFriendAccepted = async (payload) => {
    const data = JSON.parse(payload.body)
    if (data.success) {

      const requests = await FriendRequestService.getUserRequests(userInfo.id)
      setNotifications(requests.result)

      const friends = await UsersService.GetFriends(userInfo.id)
      setFriends(friends.result)
    }
  }

  const onFriendRejected = async (payload) => {
    const data = JSON.parse(payload.body)
    if (data.success) {



      const requests = await FriendRequestService.getUserRequests(userInfo.id)
      setNotifications(requests.result)
      
    }
  }

  const onFriendRemoved = async (payload) => {
    const data = JSON.parse(payload.body)
    if (data.success) {
      let requests = await FriendRequestService.getUserRequests(userInfo.id)
      setNotifications(requests.result)

      const friends = await UsersService.GetFriends(userInfo.id)
      setFriends(friends.result)

      receiverUser.setSendTo("")
    }
  }

  const onMessageSend = async (payload) => {
    let data = JSON.parse(payload.body)
    if (data.success) {
      const allMessages = await MessageService.getMessages(data.result.sender.id, data.result.receiver.id)
      if (allMessages.success) {
        // userMessages.add(data.result)
        setMessages(allMessages.result)

        
      }
    }
  }

  

  const handleMessageChange = e => {
    setMessageContent(e.target.value)
  }

  const handleSendMessage = async () => {
    if(stompClient) {
      if(messageContent !== "") {
        const res = await MessageService.sendMessage(messageContent, userInfo.id, receiverUser.sendTo.id)
        if(res.success) {
          messageInput.current.value = ""
          stompClient.send("/api/v1/send-message", {}, JSON.stringify(res))
        }
      } 
      
    }
  }

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default Enter behavior (form submission)
      handleSendMessage();    // Trigger the button click event
    }
  }



  const handleRemoveFriend = async (userId, friendWithId) => {
    if (stompClient) {
            const result = await UsersService.removeFriend(userId, friendWithId);
            if(result.success) {
                stompClient.send(`/api/v1/remove-friend`, {}, JSON.stringify(result))
            }
    }
  }

  return (
    <div className="messages-box">
              {receiverUser.sendTo !== ""
              ? (
                <div className="messages-title">
                  <div className="user-info">
                    <img src={emptyImage} alt="profile" className="profile-image" />
                    <h2>{receiverUser.sendTo.userName}</h2>
                  </div>
                  <div className="options" ref={settingBoardRef}>
                    <i className="fa-solid fa-ellipsis-vertical" onClick={handleSettingBoard}></i>
                    <ul className="settings"  style={{
                      visibility: settingBoardIsOpen ? "visible" : "hidden",
                      opacity: settingBoardIsOpen ? 1 : 0,
                      transform: `translateY(${settingBoardIsOpen ? '0' : '-10%'})`,
                    }}>
                      <li onClick={() => handleRemoveFriend(userInfo.id, receiverUser.sendTo.id)}>Remove From Friends</li>
                      <li>view friend</li>
                    </ul>
                  </div>
                </div>
              )
              : (
              <div className="messages-title">
              
                <h2>Wellcome to ChatNotif!</h2>
              </div>
            )
              }
            
              {receiverUser.sendTo !== ""
              ? (
                <ul className="messages" ref={messagesRef}>
                  {messages.map((message,key) => {
                    const dateTime = new Date(message.createdAt);

                      return (
                        <li key={key} className={`message ${message.sender.id === userInfo.id && "me"}`}>
                          {message.messageContent}
                          <span className="time">{dateTime.getHours()}:{dateTime.getMinutes().toString().padStart(2, "0")}</span>
                        </li>
                      )
                    
                    
                  })}
                
                </ul>
              )
              : (
                <div className="no-body">
                  <img src={ChatImage} alt="chat" className="chat-image"/>
                  <h2><span className="colored-logo">C</span>hat<span className="colored-logo">N</span>otif</h2>
                  <p className="greeting">
                    You can talk with everybody you want
                  </p>
                </div>
              )
              }
            {receiverUser.sendTo !== ""
            && (
              <div className="send-message">
                <input 
                name="message" 
                id="message" 
                onChange={handleMessageChange} 
                ref={messageInput}
                onKeyDown={handleKeyDown} 
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            )
            }
          </div>
  )
}

Chat.propTypes = {
  receiverUser: PropTypes.any,
  messagesState: PropTypes.any
}

export default Chat