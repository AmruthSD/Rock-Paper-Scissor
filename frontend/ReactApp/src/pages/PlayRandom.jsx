import React,{useState,useEffect} from "react";
import { socket } from "../socket.js";
import { useCookies } from "react-cookie";
import {useNavigate} from 'react-router-dom'
export default function PlayRandom(){
    const navigate = useNavigate()
    const [waiting,setWaiting] = useState(true)
    const [cookies,setCookie] = useCookies([])
    const [oppData,setOppData] = useState({})
    const [myTurn,setMyTurn] = useState(true)
    const [turn,setTurn] = useState('')
    const [oppTurn,setOppTurn] = useState(true)
    const [result,setResult] = useState(false)
    const [youWin,setYouWin] = useState(false)
    const [urScore,setUrScore] = useState(0)
    const [oppScore,setOppScore] = useState(0)
    useEffect(() => {
        socket.connect();
        socket.emit('public-connect',{
            id: cookies.id,
            name:cookies.name
        })
        return () => {
          socket.disconnect();
        };
    }, []);
    useEffect(()=>{
        const handelStopWaiting=(data)=>{
            setOppData(data)
            setWaiting(false)
        }
        socket.on('Stop-Waiting',handelStopWaiting)

        const handelResult=(data)=>{
            setYouWin(data.youWin);
            setResult(true);
            alert(`You ${youWin?'Win':'Loose'}`)
            navigate('/')
        }
        socket.on('Result',handelResult)

        const handelOppFin=(data)=>{
            setOppTurn(data.oppfin)
        }
        socket.on('Opponent-Finished',handelOppFin)

        const handelRound=(data)=>{
            setUrScore(data.yourScore)
            setOppScore(data.oppScore)
            setMyTurn(true)
            setOppTurn(false)
        }
        socket.on('Round',handelRound)
        return ()=>{
            socket.off('Stop-Waiting',handelStopWaiting)
            socket.off('Result',handelResult)
            socket.off('Opponent-Finished',handelOppFin)
            socket.off('Round',handelRound)
        }
    },[])
    useEffect(()=>{
        if(!myTurn){
            socket.emit('Turn',{turn:turn})            
        }
    },[myTurn])

    if(waiting){
        return(<>
            Waiting for opponent
        </>)
    }
    return(
        <>
            <div>
                
                <div>
                    <div>Name {cookies.name}</div>
                    <div>Score {urScore}</div>
                    { myTurn &&
                        <div>
                            <button onClick={()=>{setTurn('Rock');setMyTurn(false)}}>Rock</button>
                            <button onClick={()=>{setTurn('Paper');setMyTurn(false)}}>Paper</button>
                            <button onClick={()=>{setTurn('Scissor');setMyTurn(false)}}>Scissor</button>
                        </div>
                    }
                    {
                        !myTurn && 
                        <div>
                            You Choose {turn}
                        </div>
                    }
                </div>
                
                <div>
                    <div>Name {oppData.name}</div>
                    <div>Score {oppScore}</div>
                    <div>{oppTurn?'Opponent Finised':'Waiting for Opponent'}</div>
                </div>
            </div>
        </>
    )
}