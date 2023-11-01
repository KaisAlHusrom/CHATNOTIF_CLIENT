import PropTypes from 'prop-types';
import { useUserContext } from '../UserContext';
import "./Message.css"
import DoneAllIcon from '@mui/icons-material/DoneAll';


const Message = ({message}) => {
    
    const {userInfo} = useUserContext()
    const messageDate = new Date(message.createdAt)
    return (
        <li  className={`message ${message.sender.id === userInfo.id && "me"}`}>
            <p className="message-content">
            {message.messageContent}
            </p>
            <span className="time">
                {messageDate.getHours()}:{messageDate.getMinutes().toString().padStart(2, "0")}
                {
                message.sender.id === userInfo.id &&
                (
                    <span className="is-readed">
                        {
                            message.status === "NEW"
                            ?
                            <DoneAllIcon />
                            :
                            <DoneAllIcon color='primary'/>
                        }
                    </span>
                )
            }
            </span>
            
            
        </li>
    )
}

Message.propTypes = {
    message: PropTypes.object
  }

export default Message