import { useEffect, useRef, useState } from "react"
import ChatImage from "../../Assets/Images/chat.png"
import MessageService from "../../Service/MessageService"
import UsersService from "../../Service/UsersService"
import { useUserContext, useStompClientContext } from "../../Components/UserContext"
import Message from "../Message/Message"
import PropTypes from 'prop-types';
import emptyImage from "./../../Assets/Images/emptyImageProfile.png"
// import MenuIcon from '@mui/icons-material/Menu';
// import AutoSizer from "react-virtualized-auto-sizer"
// import { FixedSizeList as List } from "react-window"

import "./Chat.css"



const Chat = ({receiverUser, messagesState, isWritingState}) => {
  const {sendTo} = receiverUser
  const {isWriting} = isWritingState
  // const {chatsBoxOpened, setChatsBoxOpened} = chatsBoxState
  const messageInput = useRef()
  const messagesRef = useRef()
  const [settingBoardIsOpen, setSettingBoardIsOpen] = useState(false);
  const settingBoardRef = useRef(null);

  const stompClient = useStompClientContext() 
  const {userInfo} = useUserContext()
  const {messages} = messagesState
  const [myMessages, setMyMessages] = useState(() => {
    return sendTo !== "" ? messages[sendTo.userName] : []
  })

  //when messages change my message will update
  useEffect(() => {
    setMyMessages(() => {
      return sendTo !== "" ? messages[sendTo.userName] : []
    })

  }, [messages, sendTo])


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




  useEffect(() => {
    //move scroll to bottom every message send
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }

    //convert the new messages to old when current chat keep open
    if (sendTo !== "") {

      const convertNewMessagesToOld = async () => {

        let newRecievedMessages = myMessages ? myMessages.filter(message => message.status === "NEW" && message.sender.id !== userInfo.id) : []
        
        if(newRecievedMessages.length > 0) {

          await Promise.all(newRecievedMessages.map(async message => {
            await MessageService.updateMessageStatusToOld(message.id)
          }))

          if(stompClient) {
            //when send this the myMessages will set again and the useEffect will run again but because the condition it will run once
            stompClient.send("/api/v1/check-reading-message", {}, "Message Readed")
          }

          
        }

        

        // // Compare new messages with old messages
        // const haveMessagesChanged = !areArraysEqual(newMessages, messages);

        // if (haveMessagesChanged) {
        //     // Update the state only if the messages have changed
        //     setMessages(newMessages);
        //     setMyMessages(newMessages);
        // }

      }
      convertNewMessagesToOld()
    }



    
  }, [myMessages, sendTo, stompClient, userInfo.id]) //here chaanged if error show control 

  const [messageContent, setMessageContent] = useState("")

  //When open chat box...
  useEffect(() => {
     // Scroll to the bottom of the message list
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [receiverUser.sendTo])



  const handleMessageChange = e => {
    const value = e.target.value;
    setMessageContent(value)
    if (value !== "") {
      stompClient.send("/api/v1/writing-message", {}, JSON.stringify({
        message: value,
        receiverId: sendTo.id,
        senderId: userInfo.id
      }))
    } else {
      stompClient.send("/api/v1/writing-message", {}, JSON.stringify({
        message: " ",
        receiverId: sendTo.id,
        senderId: userInfo.id
      }))
    }
  }

  const handleSendMessage = async () => {
    if(stompClient) {
      if(messageContent !== "") {
        const res = await MessageService.sendMessage(messageContent, userInfo.id, sendTo.id)
        if(res.success) {
          messageInput.current.value = ""
          stompClient.send("/api/v1/send-message", {}, JSON.stringify(res))
        }else {
          console.log(res.error)
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
              {sendTo !== ""
              ? (
                <div className="messages-title">
                  {/* {
                    chatsBoxOpened && 
                    <div className="bars">
                    <MenuIcon />
                    </div>
                  } */}
                  <div className="user-info">
                    <img src={emptyImage} alt="profile" className="profile-image" />
                    <div className="name-isWriting">
                      <h2>{sendTo.userName}</h2>
                      {(isWriting.some(
                                      element => element.senderId === sendTo.id && element.receiverId === userInfo.id
                                      )) 
                                      && <p className="is-writing">Typing...</p>}
                    </div>
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
                  {/* {
                    chatsBoxOpened && 
                    <div className="bars">
                    <MenuIcon />
                    </div>
                  } */}
                <h2>Wellcome to WhatsApp!</h2>
              </div>
            )
              }
            
              {receiverUser.sendTo !== ""
              ? (
                <ul className="messages" ref={messagesRef}>
                  {/* <List
                  className="messages-list"
                  itemCount={messages.length}
                  itemSize={9}
                  height={150}
                  width={150}
                  >
                  {
                  ({index, style}) => (
                      
                        <Message style={style} key={index} message={messages[index]}/>
                      
                    
                    
                  )
                  }
                  </ List> */}

                  {
                  myMessages && myMessages.map((message, key) => <Message  key={key} message={message}/>)
                  }

                
                </ul>
              )
              : (
                <div className="no-body">
                  <img src={ChatImage} alt="chat" className="chat-image"/>
                  <h2><span className="colored-logo">W</span>hats<span className="colored-logo">App</span></h2>

                  <p className="greeting">
                    You can talk with everybody you want
                  </p>
                </div>
              )
              }
            {receiverUser.sendTo !== ""
            && (
              <div className="send-message">
                <textarea 
                rows={1}
                className="message-input"
                name="message" 
                id="message" 
                onChange={handleMessageChange} 
                ref={messageInput}
                onKeyDown={handleKeyDown} 
                ></textarea>
                <button onClick={handleSendMessage}>Send</button>
              </div>
            )
            }
          </div>
  )
}

//to clarify new messages
  // const [newMessages, setNewMessages] = useState(() => myMessages.filter(message => message.status === "NEW" && message.sender.id !== userInfo.id))
  // const [newMessagesIsStart, setNewMessagesIsStart] = useState(false)

  // useEffect(() => {
  //   if (sendTo === "") {
  //     setNewMessages(myMessages.filter(message => message.status === "NEW" && message.sender.id !== userInfo.id))
  //   }

  //   // Find if there's a new message with "NEW" status
  //   const hasNewMessage = myMessages.some(message => message.status === "NEW" && message.sender.id !== userInfo.id);

  //   // Update newMessagesIsStart state based on the presence of new messages
  //   setNewMessagesIsStart(hasNewMessage);
  // }, [messages]);


Chat.propTypes = {
  receiverUser: PropTypes.any,
  messagesState: PropTypes.any,
  isWritingState: PropTypes.object,
}

export default Chat