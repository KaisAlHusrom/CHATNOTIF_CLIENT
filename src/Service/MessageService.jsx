import axios from "axios"


const API_URL = 'http://localhost:8080/api/v1/message'

const getMessages = async (senderId, receiverId) => {
    return await axios.get(API_URL + `/get-user-messages/${senderId}/${receiverId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))
} 

const getUserAllMessagesIntoHashMap = async (userId) => {
    return await axios.get(API_URL + `/get-user-messages-into-hash-map/${userId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))
}

const sendMessage = async (messageContent, senderId, receiverId) => {
    return await axios.post(API_URL + `/send-message/${senderId}/${receiverId}`,
    {
        messageContent: messageContent
    }, 
    {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))
}

//send message with old status
const sendOldMessage = async (messageContent, senderId, receiverId) => {
    return await axios.post(API_URL + `/send-old-message/${senderId}/${receiverId}`,
    {
        messageContent: messageContent
    }, 
    {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))
}



const updateMessageStatusToOld = async (messageId) => {
    return await axios.put(API_URL + `/update-message-status-to-old/${messageId}`, {
        
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))
}

const MessageService = {
    getMessages,
    sendMessage,
    sendOldMessage,
    updateMessageStatusToOld,
    getUserAllMessagesIntoHashMap

}

export default MessageService