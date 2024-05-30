import { useState } from 'react'
import {Route,Routes} from 'react-router-dom';
import Home from './pages/home';
import SignUp from './pages/signup';
import LogIn from './pages/login';
import PlayRandom from './pages/PlayRandom';


function App() {

  return (
    <>
      <Routes>

        <Route path='/' Component={Home}/>
        <Route path='/signup' Component={SignUp}/>
        <Route path='/login' Component={LogIn}/>
        <Route path='/playrandom' Component={PlayRandom}/>
        
      </Routes>
    </>
  )
}

export default App
