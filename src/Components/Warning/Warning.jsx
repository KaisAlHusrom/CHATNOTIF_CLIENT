import { useEffect, useState } from "react";
import "./Warning.css"

const Warning = () => {
  const [isConnected, setIsConnected] = useState(true)

  const pingServer = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/connection/isConnected');
      if (response.status === 200) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    }
  };


  useEffect(() => {
    const pingInterval = setInterval(pingServer, 3000); // Ping every 5 seconds

    return () => clearInterval(pingInterval); // Clear interval on component unmount

  }, [])
  return (
    !isConnected ?
    <div className="connection-status-overlay">
        <div className="connection-status-message">
            <i className="fa-solid fa-globe"></i>
            <p className="warning-text">
            Connection Lost
            </p>
            <p className="warning-text">
            Please check your internet connection
            </p>
        </div>
      </div>
    :
      null
  )
}

export default Warning