import React, { useEffect, useState } from "react";
import {Cookies} from 'react-cookie'
import {useNavigate} from 'react-router-dom'
import axios from "axios";
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
            `http://localhost:4000/pro`,
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
        <div className="flex justify-center items-center h-screen bg-cover bg-center" style={{backgroundImage: "url('https://img.freepik.com/free-vector/realistic-neon-lights-background_52683-59889.jpg?size=626&ext=jpg&ga=GA1.1.44546679.1717027200&semt=ais_user')"}}>

            <div >
                <div className="flex justify-center items-center text-sky-500 font-black text-5xl pb-11">
                    Welome To RPS
                </div>
                <div className="px-10 py-4 text-3xl flex justify-center items-center text-sky-200 ">
                    <div>UserName: {userData.username}</div>
                    
                </div>
                <div className="px-10 py-4 text-3xl flex justify-center items-center text-sky-200  ">
                <div>Rating: {userData.rating}</div>
                    
                </div>
                <div className="flex justify-center items-center">
                <button className="my-10 px-10 py-4 flex justify-center items-center text-sky-200 border-2 rounded-lg border-sky-200 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]" onClick={()=>{navigate('/playrandom')}}>Play Random</button>
                </div>
                <div className="flex justify-center items-center">
                <button className="mt-32 px-10 py-4 flex justify-center items-center text-sky-200 border-2 rounded-lg border-sky-200 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]" onClick={(e)=>{handelLogout(e)}}>Logout</button>
                </div>
            </div>
        </div>
        </>

    )
}