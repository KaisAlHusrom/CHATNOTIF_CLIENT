import { useEffect, useRef, useState } from "react"
import ChatImage from "../../Assets/Images/chat.png"
import MessageService from "../../Service/MessageService"
import UsersService from "../../Service/UsersService"
import FriendRequestService from "../../Service/FriendRequestService"
import { useUserContext, useStompClientContext, useFriendsContext, useNotificationsContext } from "../../Components/UserContext"
import PropTypes from 'prop-types';

import "./Chat.css"

const Chat = ({receiverUser}) => {
  const messageInput = useRef()
  const messagesRef = useRef()

  const stompClient = useStompClientContext() 
  const {userInfo} = useUserContext()
  const { setFriends} = useFriendsContext()
  const { setNotifications} = useNotificationsContext()

  const [messages, setMessages] = useState([])
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages])

  const [messageContent, setMessageContent] = useState("")


  useEffect(() => {

     // Scroll to the bottom of the message list
     if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }

    const fetchMessages = async () => {
      const allMessages = await MessageService.getMessages(userInfo.id)
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
    stompClient.subscribe("/user-message/send-message", onMessageSend)

    stompClient.subscribe("/user-notification/send-notif", onNotifSent)
    stompClient.subscribe("/user-notification/accept-friend", onFriendAccepted)
    stompClient.subscribe("/user-notification/reject-friend", onFriendRejected)
    stompClient.subscribe("/user-notification/remove-friend", onFriendRemoved)
  }

  const onError = err => {
    console.log(err)
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
    console.log("we in response")
    let data = JSON.parse(payload.body)
    if (data.success) {
      const allMessages = await MessageService.getMessages(userInfo.id)
      if (allMessages.success) {
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
        console.log(res)
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

  return (
    <div className="messages-box">
            <div className="messages-title">
              {receiverUser.sendTo !== ""
              ? (<h2>{receiverUser.sendTo.userName}</h2>)
              : (<h2>Wellcome To ChatNotif</h2>)
              }
              
            </div>
              {receiverUser.sendTo !== ""
              ? (
                <ul className="messages" ref={messagesRef}>
                  {messages.map((message,key) => {
                    const dateTime = new Date(message.createdAt);
                    if(message.sender.id === receiverUser.sendTo.id || message.receiver.id === receiverUser.sendTo.id) {
                      return (
                        <li key={key} className={`message ${message.sender.id === userInfo.id && "me"}`}>
                          {message.messageContent}
                          <span className="time">{dateTime.getHours()}:{dateTime.getMinutes()}</span>
                        </li>
                      )
                    }
                    
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
}

export default Chat