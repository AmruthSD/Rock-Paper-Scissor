import React, { useEffect } from "react";
import {useCookies} from 'react-cookie'
import {useNavigate} from 'react-router-dom'
import 'axios'
import axios from "axios";
export default function Home(){
    const navigate = useNavigate();
    
    return(
        <>
            <div>Home</div>
            <button onClick={()=>{navigate('/playrandom')}}>Play Random</button>
            <button onClick={()=>{navigate('/playprivate')}}>Play with Friend</button>
        </>

    )
}