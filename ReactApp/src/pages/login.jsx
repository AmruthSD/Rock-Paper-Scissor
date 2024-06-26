import {useRef,useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {Cookies} from 'react-cookie';
import Img from '../assets/stone.png'
import LoginImg from '../assets/login1.png'
export default function LogIn(){
    const email = useRef()
    const password = useRef()
    const navigate = useNavigate()
    const [suc,setSuc] = useState('')
    const [er,setEr] = useState('')
    const [loading,setLoading] = useState(false)
    async function Submit(){
        setLoading(true)
        try {
            const { data } = await axios.post(
                import.meta.env.VITE_backend_url+"/login",
                {
                    email: email.current.value, 
                    password: password.current.value,
                },
                { withCredentials: true }
              );
              const { success, message,token,id,name } = data;
              if (success) {
                setSuc(message)
                const cookies = new Cookies();
                cookies.set('token',token,{ path: '/',expires: new Date(Date.now() + 3*24*60*60*100) })
                cookies.set('id',id,{ path: '/',expires: new Date(Date.now() + 3*24*60*60*100) });
                cookies.set('name',name,{ path: '/',expires: new Date(Date.now() + 3*24*60*60*100) });
                setEr('')
                setLoading(false)
                setTimeout(() => {
                  navigate("/");
                }, 1000);
              } else {
                setEr(message)
                setSuc('')
                setLoading(false)
              }
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
        
    }
    if(loading){
        return <>Loading</>
    }
    return(
        <>
        
<div className="flex items-center justify-center h-screen" style={{
        backgroundImage: `url(${LoginImg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}>
   <div className="backdrop-blur-sm p-6" style={{backgroundColor: "rgba(242, 103, 34, 0.5)",borderRadius: '0.5rem'}}>
    
            <div className="mx-auto max-w-sm space-y-10">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-white">Login</h1>
                <p className="text-white">Enter your credentials to access your account.</p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                <label
                    className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    for="email"
                >
                    Email
                </label>
                <input
                    ref={email}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="username"
                    placeholder="Enter your username"
                    required=""
                    type="email"
                />
                </div>
                <div className="space-y-2">
                <label
                    className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    for="password"
                >
                    Password
                </label>
                <input
                    ref={password}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="password"
                    placeholder="Enter your password"
                    required=""
                    type="password"
                />
                </div>
                <button
                onClick={(e)=>{e.preventDefault();Submit()}}
                className="inline-flex text-white items-center border-2 border-white justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                type="submit"
                >
                Login
                </button>
            </div>
            {suc!=='' && <div className="bg-green-500 text-white p-4">{suc}</div>}
            {er!=='' && <div className="bg-red-500 text-white p-4">{er}</div>}
            </div>
            <div className="flex justify-center items-center">
            <Link to='/signup' className="text-white mt-3">Need an Account <span className="text-blue-400">Signup</span></Link>
            </div>
  </div>
</div>
</>
    )
}