import axios from "axios"


const API_URL = 'http://localhost:8080/api/v1/message'

const getMessages = async (senderId) => {
    return await axios.get(API_URL + `/get-user-messages/${senderId}`, {
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

const MessageService = {
    getMessages,
    sendMessage

}

export default MessageService