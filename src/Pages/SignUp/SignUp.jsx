import { useCallback, useState, useEffect } from "react"
import  AuthService from "./../../Service/AuthService"
import "./../../Assets/Style/FormStyle.css"
import { useNavigate } from "react-router-dom"

const SignUp = () => {
    const navigate = useNavigate()

    const [reqStatus, setReqStatus] = useState({})
    const [userData, setUserData] = useState({
        "email": "",
        "userName": "",
        "password": ""
    })

    const [formError, setFormError] = useState({
        "email": "",
        "userName": "",
        "password": ""
    })

    const handleUserDataChange = (input) => {
        setUserData({...userData, [input.target.name]: input.target.value})

    }

    const validation = useCallback(() => {
        let err = {}

        if (userData.email === "") {
            err.email = "Email is required"
        }
        

        if (userData.userName === "") {
            err.userName = "User name is required"
        }


        if (userData.password === "") {
            err.password = "Password is required"
        }

        setFormError({...err})

        return Object.keys(err).length === 0
    }, [userData])

    const handleSignUp = async (e) => {
        e.preventDefault()

        const isValid = validation()
        
        if (!isValid) {
            console.log("Form Error")
        } else {
            const res = await AuthService.SignUp(userData)
            console.log(res.response)
            setReqStatus(res.response)
            
        }
    }

    useEffect(() => {
        AuthService.IsLogged().then(res => {
            if (res) {
                navigate("/")
            }
        })
        
    })

    return (
        <div className="sign-section">

            <div className="container">
                <div className="title">
                    <h2>Sign Up</h2>
                </div>
                <form onSubmit={handleSignUp} className="sign-form">
                    <div className={`response ${!reqStatus.Success && "error-req"}`}>
                        {reqStatus.Message && reqStatus.Message + " You can login now"}
                    </div>
                    <div className="email">
                        <label htmlFor="email">Email</label>
                        <input type="text" name="email" placeholder="Email" id="email" onChange={handleUserDataChange}/>
                        <span className="error">{formError.email && formError.email}</span>
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
                        <button className="submit-button" type="submit">Sign Up</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SignUp