import { useNavigate } from "react-router-dom"
import { useState, useCallback, useEffect } from "react"

import AuthService from "../../Service/AuthService"

const SignIn = () => {
    const navigate = useNavigate()

    const [error, setError] = useState("")

    const [userData, setUserData] = useState({
        "userName": "",
        "password": ""
    })

    const [formError, setFormError] = useState({
        "userName": "",
        "password": ""
    })

    const handleUserDataChange = (input) => {
        setUserData({...userData, [input.target.name]: input.target.value})

    }

    const validation = useCallback(() => {
        let err = {}        

        if (userData.userName === "") {
            err.userName = "User name is required"
        }


        if (userData.password === "") {
            err.password = "Password is required"
        }

        setFormError({...err})

        return Object.keys(err).length === 0
    }, [userData])

    const handleSignIn = async (e) => {
        e.preventDefault()

        const isValid = validation()
        
        if (!isValid) {
            console.log("Form Error")
        } else {
            await AuthService.SignIn(userData).then(
                (res) => {
                    if (res.response.Success) {

                        navigate("/")
                        window.location.reload();
                    } else {
                        setError(res.response.Message)
                    }
                    
                },
                error => {
                    console.log(error)
                    setError(error.message)
                }
            )
            

            
        }
    }


    useEffect(() => {
        if (AuthService.IsLogged()) {
            navigate("/")
            
        }
         
    })



    return (
        <div className="sign-section">

                <div className="container">
                    <div className="title">
                        <h2>Sign In</h2>
                    </div>
                    <form onSubmit={handleSignIn} className="sign-form">
                        <div className={`response ${error !== "" && "error-req"}`}>
                            {error !== "" && error}
                        </div>
                        <div className="user-name">
                            <label htmlFor="userName">User Name</label>
                            <input type="text" name="userName" placeholder="User Name" id="userName" onChange={handleUserDataChange}/>
                            <span className="error">{formError.userName && formError.userName}</span>
                        </div>
                        <div className="password">
                            <label htmlFor="password">Password</label>
                            <input type="password" name="password" placeholder="Password" id="password" onChange={handleUserDataChange}/>
                            <span className="error">{formError.password && formError.password}</span>
                        </div>
                        <div className="submit">
                            <button className="submit-button" type="submit">Sign In</button>
                        </div>
                    </form>
                </div>
            </div>
  )
}

export default SignIn