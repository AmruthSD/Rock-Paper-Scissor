
import {Route,Routes,Navigate} from 'react-router-dom';
import Home from './pages/home';
import SignUp from './pages/signup';
import LogIn from './pages/login';
import PlayRandom from './pages/PlayRandom';
import { Cookies } from 'react-cookie';

function App() {
  function Proctect({children}){
    const cookies = new Cookies()
    return cookies.get('token')? children:<Navigate to="/login"/>
  }
  return (
    <>
      <Routes>

        <Route path='/' element={<Proctect><Home/></Proctect>}/>
        <Route path='/signup' Component={SignUp}/>
        <Route path='/login' Component={LogIn}/>
        <Route path='/playrandom' element={<Proctect><PlayRandom/></Proctect>}/>
        
      </Routes>
    </>
  )
}

export default App
