import { Header} from "./Sections"
import { Home , SignUp, SignIn} from "./Pages";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { UserProvider } from "./Components/UserContext";
import "./App.css"
import { Warning } from "./Components";
function App() {
  


  return (
    <Router>
      <UserProvider>
        <Header />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/signIn" element={<SignIn />} />
        </Routes>
        <Warning />
      </UserProvider>
    </Router>
  )
}

export default App
