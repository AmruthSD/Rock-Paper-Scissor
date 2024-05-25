import { useState } from 'react'
import {Route,Routes} from 'react-router-dom';
import Home from './pages/home';
import SignUp from './pages/signup';
import LogIn from './pages/login';
function App() {

  return (
    <>
      <Routes>

        <Route path='/' Component={Home}/>
        <Route path='/signup' Component={SignUp}/>
        <Route path='/login' Component={LogIn}/>
      
      </Routes>
    </>
  )
}

export default App
