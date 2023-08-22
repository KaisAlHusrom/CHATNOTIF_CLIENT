import axios from "axios";

const API_URL = 'http://localhost:8080/api/v1/friend-request'

const addFriendRequest = async (friendRequestDTO) => {
    return await axios.post(API_URL + "/add-friend-request", friendRequestDTO, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(
        res => res.data,
        err => err
    )
}

const addRejectedNotification = async (friendRequestDTO) => {
    return await axios.post(API_URL + "/add-rejected-notification", friendRequestDTO, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(
        res => res.data,
        err => err
    )
}

const getUserRequests = async (userId) => {
    return await axios.get(API_URL + "/get-user_requests/" + userId, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(
        res => res.data
    ).catch(err => console.log(err))
}

const getUserFriendRequest = async (senderId, receiverId) => {
    return await axios.get(API_URL + `/get-user-request/${senderId}/${receiverId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(
        res => res.data
    ).catch(err => console.log(err))
}

const updateRequestStatusToAccepted = async (friendRequestId) => {
    return await axios.put(API_URL + `/update-request-status-accept/${friendRequestId}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(
        res => res.data
    ).catch(err => console.log(err))
}

const updateRequestStatusToRejected = async (friendRequestId) => {
    return await axios.put(API_URL + `/update-request-status-reject/${friendRequestId}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(
        res => res.data
    ).catch(err => console.log(err))
}

const updateRequestStatusToOld = async (friendRequestId) => {
    return await axios.put(API_URL + `/update-request-status-old/${friendRequestId}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
    }).then(
        res => res.data
    ).catch(err => console.log(err))
}

const FriendRequestService = {
    addFriendRequest,
    getUserRequests,
    getUserFriendRequest,
    updateRequestStatusToRejected,
    updateRequestStatusToAccepted,
    addRejectedNotification,
    updateRequestStatusToOld
}

export default FriendRequestService