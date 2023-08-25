import { useEffect, useState } from "react";
import emptyImage from "./../../Assets/Images/emptyImageProfile.png"
import "./Friend.css"
import MessageService from "../../Service/MessageService";
import { useUserContext } from "../UserContext";

import PropTypes from 'prop-types';
const Friend = ({friend, sendToState, newMessagesState}) => {
    const [messages, setMessages] = useState([])
    const [newMessages, setNewMessages] = useState([])

    const {userInfo} = useUserContext()

    useEffect(() => {
        const fetchMessages = async () => {
            const allMessages = await MessageService.getMessages(userInfo.id, friend.id)
            if (allMessages.success) {
                setMessages(allMessages.result)
                setNewMessages(allMessages.result.filter(message => message.status === "NEW" && message.sender.id !== userInfo.id))
      
            }
          } 

        fetchMessages()

    }, [])

    const handleOpenFriendChat = async () => {
        sendToState.setSendTo(friend)

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
                <p className="last-message">{(messages[messages.length - 1]?.messageContent)}</p>
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
    newMessagesState: PropTypes.any
  }

export default Friend