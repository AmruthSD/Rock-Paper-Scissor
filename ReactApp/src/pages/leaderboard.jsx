import React,{useState,useEffect} from "react";
import axios from "axios";
import LeaderBoardImg from '../assets/leaderboard.webp'
import {useNavigate} from 'react-router-dom'



export default function Leaderboard(){

    const [loading,setLoading] = useState(false)
    const navigate = useNavigate()
    const [data,setData] = useState([])
    useEffect(()=>{
        setLoading(true)
        const getInfo = async()=>{
            const res = await axios.get(
                import.meta.env.VITE_backend_url+`/leader`,
                { withCredentials: true }
              );
              setData(res.data.info)
        }
        try {
            getInfo()
        } catch (error) {
            console.log(error)
        }
        finally{
            setLoading(false)
        }
    },[])
    if(loading){
        return(
            <>Loading</>
        )
    }
    return(
    <>  
    <div className="relative min-h-screen">
      <button onClick={(e)=>{e.preventDefault();navigate('/');}} className="fixed top-0 right-0 m-4 p-2  text-white bg-black text-lg border-2 rounded-lg border-black hover:bg-rose-950 ">
        Home
      </button>
        <div className="flex flex-col items-center justify-center h-full pb-16 text-white" style={{
        backgroundImage: `url(${LeaderBoardImg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        
      }}>
        <div className="text-3xl pb-5">Leaderboard</div>
        <table>
            <thead>
                <tr>
                    <th className="px-5 py-3">Rank</th>
                    <th className="px-5 py-3">UserName</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">PlayingFrom</th>
                </tr>
            </thead>
            <tbody>
            {
                data.map((e,i)=>{
                    const formattedDate = new Date(e.createdAt).toLocaleDateString()
                    return(
                        <tr>
                            <td className="px-5 py-3">{i+1}</td>
                            <td className="px-5 py-3">{e.username}</td>
                            <td className="px-5 py-3">{e.rating}</td>
                            <td className="px-5 py-3">{formattedDate}</td>
                        </tr>
                    )
                })
            }

            </tbody>
        </table>
        
            
        </div>
        </div>
    </>
    )
}