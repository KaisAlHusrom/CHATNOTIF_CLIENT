import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthService from "../../Service/AuthService"
import { useUserContext, useFriendsContext } from "../../Components/UserContext"
import { Chat } from "../../Components"
import "./Home.css"
import MessageService from "../../Service/MessageService"



const Home = () => {
  const navigate = useNavigate()

  const [sendTo, setSendTo] = useState("")

  const {userInfo} = useUserContext()

  const {friends} = useFriendsContext()

  useEffect(() => {
    !AuthService.IsLogged() && navigate("/signIn")
    

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
              {friends.map(friend => {
                return (
                  <li onClick={() => setSendTo(friend)} key={friend.id}>{friend.userName}</li>
                )
              })}

              
            </ul>
          </div>
          <Chat receiverUser={{sendTo, setSendTo}}/>
          
        </div>
      </div>
    </div>
  )
}

export default Home