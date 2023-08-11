import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AuthService from "../../Service/AuthService"
import { useUserContext } from "../../Components/UserContext"
import "./Home.css"

const Home = () => {
  const navigate = useNavigate()

  const {userInfo} = useUserContext()

  useEffect(() => {
    !AuthService.IsLogged() && navigate("/signIn")
    console.log(userInfo)

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
              <li>ahmet</li>
              <li>kais</li>
            </ul>
          </div>
          <div className="messages-box">
            <div className="messages-title">
              <h2>Ahmet</h2>
            </div>
            <ul className="messages">
              <li className="message me">
                hello
                <span className="time">05:18</span>
              </li>
              <li className="message ">
              hello my frien
                <span className="time">05:19</span>
              </li>
              <li className="message me">
              how are you?
                <span className="time">05:22</span>
              </li>
              <li className="message ">
              how are you?
                <span className="time">05:23</span>
              </li>
            </ul>
            <div className="send-message">
              <input name="message" id="message" />
              <button>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home