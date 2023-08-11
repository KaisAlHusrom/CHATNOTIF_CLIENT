import "./Header.css"
import { NavLink, useNavigate } from "react-router-dom"
import AuthService from "../../Service/AuthService"
import {  useState } from "react"
// import Cookies from "universal-cookie"

// const cookies = new 

const Header = () => {
  const navigate = useNavigate()
  const [logged] = useState(() => {
    return localStorage.getItem("user_token") && new Date(localStorage.getItem("user_token_expiration_date")) > new Date() ?  true : false
  })



  const handleSignOut = async () => {
    await AuthService.SignOut()
                      .then(() => {
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
                <NavLink to="/profile"><li></li></NavLink>
                <NavLink onClick={handleSignOut}><li>Sign Out</li></NavLink>
              </ul>
            }
            
        </div>
    </header>
  )
}

export default Header