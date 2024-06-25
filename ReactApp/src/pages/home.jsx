import React, { useEffect, useState } from "react";
import {Cookies} from 'react-cookie'
import {useNavigate} from 'react-router-dom'
import axios from "axios";
import HomeImg from '../assets/home1.jpg'
export default function Home(){
    const [userData,setData] =useState({}) 
    const [loading,setLoading]=useState(false)
    const navigate = useNavigate();
    useEffect(() => {
        setLoading(true)
        const cookies = new Cookies();
        if (!cookies.get('id') || !cookies.get('name')) {
            navigate('/login'); 
        }
        console.log(cookies.get('name'))
        const getData = async()=>{
        const res = await axios.post(
            import.meta.env.VITE_backend_url+`/pro`,
            {id:cookies.get('id')},
            { withCredentials: true }
          );
          setData(res.data)
        }
        try {
            getData();
        } catch (error) {
            console.log(error)
        }
        finally{
            setLoading(false)
        }
    }, []);
    function handelLogout(e){
        e.preventdefault;
        const cookies = new Cookies();
        cookies.remove('token')
        cookies.remove('id')
        cookies.remove('name')
        navigate('/login')
    }
    if(loading){
        return(<>
            Loading
        </>)
    }
    return(
        <>
       
        <div className="flex items-center justify-center h-full" style={{
        backgroundImage: `url(${HomeImg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        
      }}>
            <div className="">
                <div className="flex justify-center items-center text-black  font-black text-5xl pb-11">
                    Welome To RPS
                </div>
                <div className="px-10 py-4 text-3xl flex justify-center items-center text-black  ">
                    <div>UserName: {userData.username}</div>
                    
                </div>
                <div className="px-10 py-4 pb-10 text-3xl flex justify-center items-center text-black   ">
                <div>Rating: {userData.rating}</div>
                    
                </div>
                <div className="flex justify-center items-center pb-10">
                <button className="p-5 flex justify-center items-center text-white bg-black  border-2 rounded-lg border-black hover:bg-rose-950 " onClick={()=>{navigate('/playrandom')}}>Play Random</button>
                </div>
                <div className="flex justify-center items-center pb-10">
                <button className="p-5 flex justify-center items-center text-white bg-black   border-2 rounded-lg border-black hover:bg-rose-950 " onClick={()=>{navigate('/playfriend')}}>Play with Friends</button>
                </div>
                <div className="flex justify-center items-center pb-10">
                <button className="p-5 flex justify-center items-center text-white bg-black   border-2 rounded-lg border-black hover:bg-rose-950 " onClick={()=>{navigate('/leaderboard')}}>Leaderboard</button>
                </div>
                <div className="flex justify-center items-center">
                <button className="p-5 flex justify-center items-center text-white bg-black   border-2 rounded-lg border-black hover:bg-sky-950" onClick={(e)=>{handelLogout(e)}}>Logout</button>
                </div>
            </div>
        </div>
        </>

    )
}