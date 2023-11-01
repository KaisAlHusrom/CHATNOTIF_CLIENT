import {  useEffect, useState } from "react";
import emptyImage from "./../../Assets/Images/emptyImageProfile.png"
import "./Friend.css"
import MessageService from "../../Service/MessageService";
import { useUserContext } from "../UserContext";

import PropTypes from 'prop-types';
const Friend = ({friend, sendToState, messagesState, isWritingState}) => {
    const {messages} = messagesState

    const {sendTo, setSendTo} = sendToState

    const {isWriting} = isWritingState

    const [myMessages, setMyMessages] = useState(() => {
        return messages ? messages[friend.userName] : []
    })
    
      //when messages change my message will update
    useEffect(() => {
        setMyMessages(() => {
            return  messages ? messages[friend.userName] : []
        })
    
    }, [friend.userName, messages])


    const {userInfo} = useUserContext()

    const [newMessages, setNewMessages] = useState(() => {
        return myMessages ? myMessages.filter(message => message.status === "NEW" && message.sender.id !== userInfo.id) : []
    })

    useEffect(() => {
        if (friend.id !== sendTo.id && myMessages) {
            setNewMessages(myMessages.filter(message => message.status === "NEW" && message.sender.id !== userInfo.id))
        }
    }, [friend.id, myMessages, sendTo.id, userInfo.id])



    const handleOpenFriendChat = async () => {
        setSendTo(friend)

        if (newMessages.length !== 0) {
            await Promise.all(newMessages.map(async message => {
                await MessageService.updateMessageStatusToOld(message.id)
            }))
            
            setNewMessages([])
        }
    }



    const dateObject = new Date(friend.updatedAt); 
    return (
        <li className={`connected-friend ${friend.connectStatus !== "CONNECTED" && "unconnected-friend"} ${sendToState.sendTo.id === friend.id  && "opened-chat"}`} onClick={handleOpenFriendChat}>
            <img src={emptyImage} alt="profile" className="profile-image"/>
            <div className="userName-lastMessage">
                <h6 className="user-name">{friend.userName}</h6>
                {(isWriting.some(
                    element => element.senderId === friend.id && element.receiverId === userInfo.id
                )) 
                ? <p className="is-writing">Typing...</p> 
                : <p className="last-message">{myMessages && (myMessages[myMessages.length - 1]?.messageContent)}</p>
                }
               
            </div>
            <div className="date-time">
                <p className="date">
                {dateObject.getFullYear()}.{dateObject.getMonth() + 1}.{dateObject.getDate()}
                </p>
                <p className="time">
                {dateObject.getHours()}:{dateObject.getMinutes().toString().padStart(2, '0')}
                </p>
            </div>
            {newMessages.length > 0 && (
                <span className="new-messages-count">
                    {newMessages.length}
                </span>
            )}
            
            
        </li>
    )
}

Friend.propTypes = {
    friend: PropTypes.any,
    sendToState: PropTypes.any,
    messagesState: PropTypes.any,
    isWritingState: PropTypes.object
  }

export default Friend