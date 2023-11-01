import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthService from "../../Service/AuthService"
import { useUserContext, useFriendsContext, useStompClientContext, useNotificationsContext } from "../../Components/UserContext"
import { Chat, Friend } from "../../Components"
import "./Home.css"
import MessageService from "../../Service/MessageService"
import UsersService from "../../Service/UsersService"
import FriendRequestService from "../../Service/FriendRequestService"




const Home = () => {
  const navigate = useNavigate()

  // const [chatsBoxOpened, setChatsBoxOpened] = useState(true)

  const [sendTo, setSendTo] = useState("")

  const {userInfo} = useUserContext()


  const { setNotifications} = useNotificationsContext()

  const {friends, setFriends} = useFriendsContext()

  const [messages, setMessages] = useState(null)

  const [newMessages, setNewMessages] = useState([])

  const [isWriting, setIsWriting] = useState([])

  const stompClient = useStompClientContext() 

  useEffect(() => {
    AuthService.IsLogged().then(res => {
      if(!res) {
        navigate("/signIn")
      }
    })    

    if(stompClient) {
      stompClient.connect({}, onConnected, onError)
    }

    const fetchAllMessages = async () => {

      const res = await MessageService.getUserAllMessagesIntoHashMap(userInfo.id)
      if (res.success) {
        setMessages(res.result)
      }
    }

    fetchAllMessages()
    

  }, [navigate, userInfo])

  const onConnected = () => {

    stompClient.subscribe("/user-auth/authenticate", onAuthentication)


    stompClient.subscribe("/user-message/send-message", onMessageSend)
    stompClient.subscribe("/user-message/writing-message", onMessageWriting)
    stompClient.subscribe("/user-message/check-reading-message", onCheckReadingMessage)

    stompClient.subscribe("/user-notification/send-notif", onNotifSent)
    stompClient.subscribe("/user-notification/accept-friend", onFriendAccepted)
    stompClient.subscribe("/user-notification/reject-friend", onFriendRejected)
    stompClient.subscribe("/user-notification/remove-friend", onFriendRemoved)
  }

  const onError = err => {
    console.log(err)
  }

  



  const onAuthentication = async () => {
    const friends = await UsersService.GetFriends(userInfo.id)
    setFriends(friends.result)

  }



  //the result when send friend request
  const onNotifSent = async (payload) => {
    let data = JSON.parse(payload.body)
    if (data.success) {
      let requests = await FriendRequestService.getUserRequests(userInfo.id)
      setNotifications(requests.result)
    }

  }

  //the result when accepted friend request
  const onFriendAccepted = async (payload) => {
    const data = JSON.parse(payload.body)
    if (data.success) {

      const requests = await FriendRequestService.getUserRequests(userInfo.id)
      setNotifications(requests.result)

      const friends = await UsersService.GetFriends(userInfo.id)
      setFriends(friends.result)
    }
  }

  const onFriendRejected = async (payload) => {
    const data = JSON.parse(payload.body)
    if (data.success) {



      const requests = await FriendRequestService.getUserRequests(userInfo.id)
      setNotifications(requests.result)
      
    }
  }

  const onFriendRemoved = async (payload) => {
    const data = JSON.parse(payload.body)
    if (data.success) {
      let requests = await FriendRequestService.getUserRequests(userInfo.id)
      setNotifications(requests.result)

      const friends = await UsersService.GetFriends(userInfo.id)
      setFriends(friends.result)

      setSendTo("")
    }
  }

  const onMessageSend = async (payload) => {
    let data = JSON.parse(payload.body)
    if (data.success) {
      const res = await MessageService.getUserAllMessagesIntoHashMap(userInfo.id)
      if (res.success) {
        setMessages(res.result)
      }
      
      //to make Typing text gone.
      setIsWriting(prevIsWriting => {
        let updatedSet = [...prevIsWriting];
        if (prevIsWriting.some(element => element.senderId === data.result.sender.id && element.receiverId === data.result.receiver.id)) {
          updatedSet = updatedSet.filter(element => element.senderId !== data.result.sender.id && element.receiverId !== data.result.receiver.id);
        }

          return updatedSet;
      });

    }
    
  }

  const onMessageWriting = payload => {
    let data = JSON.parse(payload.body);
    const setData = {
      senderId: data.senderId,
      receiverId: data.receiverId
    }
    //control is writing text
    if (data.message === " ") {
        
        setIsWriting(prevIsWriting => {
          let updatedSet = [...prevIsWriting];
          if (prevIsWriting.some(element => element.senderId === setData.senderId && element.receiverId === setData.receiverId)) {
            updatedSet = updatedSet.filter(element => element.senderId !== setData.senderId && element.receiverId !== setData.receiverId);
          }

            return updatedSet;
        });
      
    } else {
      setIsWriting(prevIsWriting => {
        const updatedSet = [...prevIsWriting];
          if (!prevIsWriting.some(element => element.senderId === setData.senderId && element.receiverId === setData.receiverId)) {
            updatedSet.push(setData);
          }

          return updatedSet;
      });
    }
  };


  //when user send message and otherwise side reading this messages state will be uploaded again
  const onCheckReadingMessage = async () => {
    const res = await MessageService.getUserAllMessagesIntoHashMap(userInfo.id)
    if (res.success) {
      setMessages(res.result)
    }
  }

  
  return (
    <div className="home">
      <div className="container">
        <div className="chat-section">
          <div className={`chats-box `}>
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
                    messagesState={{messages, setMessages}}
                    isWritingState={{isWriting, setIsWriting}}
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
                    messagesState={{messages, setMessages}}
                    isWritingState={{isWriting, setIsWriting}}
                    />
                  )
              })}
              

              
            </ul>
          </div>
          <Chat 
          receiverUser={{sendTo, setSendTo}} 
          newMessagesState={{newMessages, setNewMessages}} 
          messagesState={{messages, setMessages}}
          isWritingState={{isWriting, setIsWriting}}
          // chatsBoxState={{chatsBoxOpened, setChatsBoxOpened}
          
          />
          
        </div>
      </div>
    </div>
  )
}

export default Home