import axios from "axios"
// import jwt from "jwt-decode"

const API_URL = 'http://localhost:8080/api/v1/auth'

const SignUp = async (userData) => {
    const res = await axios.post(API_URL + '/register', userData)
    return res.data
}

const SignIn = async (userData) => {
    
    const res = await axios.post(API_URL + '/authenticate', userData)
    if (res.data.response.Success) {
        // const decode = jwt(res.data.response.Token)
        // cookie.set("jwt_authorization", "123", {
        //     path: '/',
        //     expires: new Date(decode.exp * 1000),
        //     httpOnly: true,
        // })
        localStorage.setItem("user_token", res.data.response.Token)
        localStorage.setItem("user_token_expiration_date", res.data.response.ExpiredAt)
        localStorage.setItem("user_data", JSON.stringify(res.data.response.UserInfo))
    }
    return res.data
}

const SignOut = async () => {
    await axios.get(API_URL + '/logout', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("user_token")}`
            }
        }).then(() => {
            localStorage.removeItem("user_token")
            localStorage.removeItem("user_token_expiration_date")
            localStorage.removeItem("user_data")
          })
          .catch(error => {
            console.log(error)
          });

}

const IsLogged = () => {

    if (localStorage.getItem("user_token") && new Date(localStorage.getItem("user_token_expiration_date")) > new Date()) {
        return true
    }

    return false
}

const AuthService = {
    SignUp,
    SignIn,
    SignOut,
    IsLogged
}

export default AuthService