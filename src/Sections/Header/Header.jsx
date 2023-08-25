import "./Header.css"
import { NavLink, useNavigate } from "react-router-dom"
import AuthService from "../../Service/AuthService"
import {   useState } from "react"
import { NotificationSection, SearchBox } from "../../Components"
import { useStompClientContext, useUserContext } from "../../Components/UserContext"

const Header = () => {
  const {userInfo} = useUserContext()
  const navigate = useNavigate()
  const [logged] = useState(() => {
    return localStorage.getItem("user_token") && new Date(localStorage.getItem("user_token_expiration_date")) > new Date() ?  true : false
  })

  const stompClient = useStompClientContext()

  const handleSignOut = async () => {
    await AuthService.SignOut()
                      .then(() => {
                        if(stompClient) {
                          stompClient.send("/api/v1/authenticate", {}, "Signed Out")
                        }
                        navigate("/signIn")
                        window.location.reload()
                      }
                      )
  }


  return (
    <header>
        <div className="container">
            <div className="logo">
                <h1><span className="colored-logo">C</span>hat<span className="colored-logo">N</span>otif</h1>
            </div>
            {logged && <SearchBox />}
            {!logged
              ?
              <ul className="nav">
                <NavLink to="/"><li>Home</li></NavLink>
                <NavLink to="/signUp"><li>Sign Up</li></NavLink>
                <NavLink to="/signIn"><li>Log In</li></NavLink>
              </ul>
            :
              <ul className="nav">
                <NavLink to="/"><li>Home</li></NavLink>
                <NavLink onClick={handleSignOut}><li>Sign Out</li></NavLink>
                <li>{userInfo.username}</li>
                <NotificationSection />
              </ul>
            }
            
        </div>
    </header>
  )
}

export default Header