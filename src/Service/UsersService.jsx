import axios from "axios"
// import jwt from "jwt-decode"

const API_URL = 'http://localhost:8080/api/v1/user'

const FindUsersByUserName = async (value) => {
    return await axios.post(API_URL + '/get-all-with-user-name', {userName: value}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(
        res => res.data,
        err => err
    )
}

const AddFriend = async (user_id, friend_with_id) => {
    return await axios.put(API_URL + `/add_friend/${user_id}/${friend_with_id}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))
}

const removeFriend = async (userId, friendWithId) => {
    return await axios.put(API_URL + `/remove_friend/${userId}/${friendWithId}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))
}

const GetFriends = async (user_id) => {
    return await axios.get(API_URL + `/${user_id}/get-friends`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))
}

const GetUser = async (userId) => {
    return await axios.get(API_URL + `/get-user/${userId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))
}

const UsersService = {
    FindUsersByUserName,
    AddFriend,
    removeFriend,
    GetFriends,
    GetUser
}

export default UsersService