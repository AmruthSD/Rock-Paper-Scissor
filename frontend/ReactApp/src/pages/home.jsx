import React, { useEffect } from "react";
import {useCookies} from 'react-cookie'
import {useNavigate} from 'react-router-dom'
import 'axios'
import axios from "axios";
export default function Home(){
    const navigate = useNavigate();
    const [cookies, removeCookie] = useCookies([]);
    async function getRoomId(){
      try {
        const res = await axios.get("http://localhost:4000/pro/play",
            { withCredentials: true}
        )
        console.log(res);
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 400)) {
          navigate('/login');
        } else {
          console.error('An unexpected error occurred:', error);
        }
      }
    }
    return(
        <>
            <div>Home</div>
            <button onClick={()=>{}}>Play</button>
        </>
    )
}