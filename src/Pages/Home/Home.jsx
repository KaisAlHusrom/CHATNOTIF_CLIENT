import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthService from "../../Service/AuthService"
import { useUserContext, useFriendsContext } from "../../Components/UserContext"
import { Chat, Friend } from "../../Components"
import "./Home.css"
import MessageService from "../../Service/MessageService"




const Home = () => {
  const navigate = useNavigate()

  const [sendTo, setSendTo] = useState("")

  const {userInfo} = useUserContext()

  const {friends} = useFriendsContext()

  const [messages, setMessages] = useState({})

  const [newMessages, setNewMessages] = useState([])


  useEffect(() => {
    !AuthService.IsLogged() && navigate("/signIn")

    // const fetchMessages = async () => {
    //   let friends_messages_res = await MessageService.getUserAllMessagesIntoHashMap(userInfo.id)
    //   if (friends_messages_res.success) {
    //     console.log(friends_messages_res.result)
    //   }
    // }

    // fetchMessages()
    // console.log(messages)
    

  }, [navigate, userInfo])
  
  return (
    <div className="home">
      <div className="container">
        <div className="chat-section">
          <div className="chats-box">
            <div className="chats-title">
              <h2>Chats</h2>
            </div>
            <ul className="chats">
              <li className="connected">
                Connected Friends
              </li>
              {friends.filter(friend => friend.connectStatus === "CONNECTED").map(friend => {
                  
                  return (
                    <Friend 
                    key={friend.id} 
                    friend={friend} 
                    sendToState={{sendTo, setSendTo}} 
                    newMessagesState={{newMessages, setNewMessages}}
                    />
                  )
              })}
              <li className="unconnected">
                Unconnected Friends
              </li>
              {friends.filter(friend => friend.connectStatus !== "CONNECTED").map(friend => {
                  return (
                    <Friend 
                    key={friend.id} 
                    friend={friend} 
                    sendToState={{sendTo, setSendTo}} 
                    newMessagesState={{newMessages, setNewMessages}}
                    />
                  )
              })}
              

              
            </ul>
          </div>
          <Chat receiverUser={{sendTo, setSendTo}} newMessagesState={{newMessages, setNewMessages}} messagesState={{messages, setMessages}} />
          
        </div>
      </div>
    </div>
  )
}

export default Home