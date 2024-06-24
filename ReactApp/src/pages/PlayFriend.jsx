import React, { useState, useEffect,useRef } from "react";
import { socket } from "../socket.js";
import { Cookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';
import WaitImg from '../assets/waiting1.jpg'
import GameImg from '../assets/Game1.png'
import Stone from '../assets/stone.png'
import Scissor from '../assets/scissors.png'
import Paper from '../assets/paper.png'

export default function PlayFriend(){
    const cookies = new Cookies();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [state,setState] = useState('Initial')
    const [roomID,setRoomID] = useState('')
    const joiningRoomID = useRef()
    const [errorMessage,setErrorMessage] = useState('')
    const [oppData, setOppData] = useState({});

    const [myTurn, setMyTurn] = useState(true);
    const [turn, setTurn] = useState('');
    const [oppTurn, setOppTurn] = useState(false);
    const [result, setResult] = useState(false);
    const [youWin, setYouWin] = useState(false);
    const [urScore, setUrScore] = useState(0);
    const [oppScore, setOppScore] = useState(0);
    const [oppChoice,setOppChoice] = useState('');
    const [roundLoad,setRoundLoad] = useState(true)
    const [pastResults,setPastResults] = useState([]);
    useEffect(() => {
        if (!cookies.get('id') || !cookies.get('name')) {
            navigate('/login'); 
        }
    }, []); 
    useEffect(() => {
        socket.connect();
        setLoading(false);
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(()=>{
        const handelNewRoomId = (data) =>{
            setLoading(true)
            setState('Waiting')
            setRoomID(data.roomID)
            setLoading(false)
        } 
        const handelJoiningError = (data) =>{
            setLoading(true)
            setErrorMessage(data.message)
            setLoading(false)
        }   
        const handelStopWaiting = (data) => {
            setLoading(true);
            setOppData(data);
            setRoomID(data.roomID)
            setState('Started');
            setLoading(false);
        };

        socket.on('startGame',handelStopWaiting)
        socket.on('newRoomID',handelNewRoomId)  
        socket.on('joining-error',handelJoiningError)
        return ()=>{
            socket.off('startGame',handelStopWaiting)
            socket.off('newRoomID',handelNewRoomId)  
            socket.off('joining-error',handelJoiningError)
        }
    },[])

    useEffect(() => {
        const handelResult = (data) => {
            setLoading(true);
            setYouWin(data.youWin);
            setResult(true);
            if (data.youWin) {
                setUrScore(3);
            } else {
                setOppScore(3);
            }
            setLoading(false);
            const timerId = setTimeout(() => {
                navigate('/');
            }, 3000);
            return () => clearTimeout(timerId);
        };

        const handelOppFin = (data) => {
            setLoading(true);
            setOppTurn(data.oppfin);
            setLoading(false);
        };

        const handelRound = (data) => {
            setLoading(true);
            setUrScore(data.yourScore);
            setOppScore(data.oppScore);
            setOppChoice(data.oppTurn)
            const newPastHistory = pastResults
            newPastHistory.push({op:data.oppTurn,my:data.yourTurn})
            setPastResults(newPastHistory);
            setLoading(false);
            setRoundLoad(false)
            const roundOverTimeOut = setTimeout(() => {
                setLoading(true)
                setRoundLoad(true)
                setMyTurn(true);
                setOppTurn(false);
                setLoading(false)
            }, 1000);
            return ()=>clearTimeout(roundOverTimeOut)
            
            
        };

        socket.on('priResult', handelResult);
        socket.on('priOpponent-Finished', handelOppFin);
        socket.on('priRound', handelRound);

        return () => {
            socket.off('priResult', handelResult);
            socket.off('priOpponent-Finished', handelOppFin);
            socket.off('priRound', handelRound);
        };
    }, []);

    const createRoom = () => {
        socket.emit('create-room',{
            id: cookies.get('id'),
            name: cookies.get('name')
        });
    }

    const joinRoom = () => {
        socket.emit('join-room',{
            id: cookies.get('id'),
            name: cookies.get('name'),
            roomID: joiningRoomID.current.value
        });
    }

    useEffect(() => {
        if (!myTurn) {
            setLoading(true);
            socket.emit('priTurn', { turn: turn });
            setLoading(false);
        }
    }, [myTurn]);

    if(loading){
        return(
            <>Loading</>
        )
    }
    if(state==='Initial'){
        return(
            <>

<div className="relative min-h-screen">
      <button onClick={(e)=>{e.preventDefault();navigate('/');}} className="fixed top-0 right-0 m-4 p-2  text-white bg-black text-lg border-2 rounded-lg border-black hover:bg-rose-950 ">
        Home
      </button>
            <div className="" style={{
        backgroundImage: `url(${WaitImg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        
      }}>   
      
      <div className="flex text-black text-3xl font-bold items-center justify-center h-screen mx-28">
                <div className="grow flex-1 flex flex-col justify-center items-center my-10">
                    <button onClick={createRoom} className="p-6 text-white bg-black  border-2 rounded-lg border-black hover:bg-rose-950 ">Create New Room</button>
                </div>
                <div className="grow flex-1 flex flex-col justify-center items-center space-y-3 my-10">
                    <div>
                    <input
                        ref={joiningRoomID}
                        placeholder=" Enter the Room ID to Join"
                    />
                    </div>
                <button onClick={joinRoom} className="p-3 text-white bg-black text-lg border-2 rounded-lg border-black hover:bg-rose-950 ">Join Room</button>
                <div className="text-red-600">{errorMessage}</div>
                </div>
            </div>   
            </div>
            </div>
            </>
        )
    }
    if(state==='Waiting'){
        return(
            <>
            <div className="relative min-h-screen">
      <button onClick={(e)=>{e.preventDefault();navigate('/');}} className="fixed top-0 right-0 m-4 p-2  text-white bg-black text-lg border-2 rounded-lg border-black hover:bg-rose-950 ">
        Home
      </button>
            <div className="flex items-center justify-center h-screen" style={{
        backgroundImage: `url(${WaitImg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}>
                <div >
                    <div className="flex-col space-y-3 justify-center items-center text-black font-black text-3xl pb-11 mb-32">
                        <div>Waiting For Friend .......</div>
                        <div>Ask them to Enter {roomID} as the Room ID</div>
                    </div>
                </div>
        </div>
        </div>
        </>
        )
    }
    return(
        <>
        <div className="flex flex-col h-full" style={{
        backgroundImage: `url(${GameImg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        
      }}
      >
            <div className="flex-grow flex text-white items-center justify-center text-3xl font-bold">
            <div>
            {
                    (result) &&
                    <div>{youWin ? 'Congrats, you win!' : 'Better luck next time!'}</div>
            }
            </div>
            
                
                <div className=" grow flex-1 flex flex-col justify-center items-center space-y-10">
                    <div>Name: {cookies.get('name')}</div>
                    <div>Score: {urScore}</div>
                    {(!result && myTurn) &&
                        <div>

                            <button onClick={() => { setLoading(true); setTurn('Rock'); setMyTurn(false); setLoading(false); }}
                             style={{
                                backgroundImage: `url(${Stone})`,
                                width: '200px',
                                height: '200px',
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                
                                }}   
                            >Rock</button>
                            <button onClick={() => { setLoading(true); setTurn('Paper'); setMyTurn(false); setLoading(false); }}
                                style={{
                                    backgroundImage: `url(${Paper})`,
                                    width: '200px',
                                    height: '200px',
                                    backgroundPosition: 'center',
                                    backgroundSize: 'cover',
                                    
                                    }} 
                                
                                >Paper</button>
                            <button onClick={() => { setLoading(true); setTurn('Scissor'); setMyTurn(false); setLoading(false); }}
                                style={{
                                    backgroundImage: `url(${Scissor})`,
                                    width: '200px',
                                    height: '200px',
                                    backgroundPosition: 'center',
                                    backgroundSize: 'cover',
                                    
                                    }} 
                                
                                >Scissors</button>
                        </div>
                    }
                    {
                        (!result && !myTurn) &&
                        <div>
                            {
                                turn==='Rock'?<img src={Stone} width={200} height={200}/>:   turn==='Paper'?<img src={Paper} width={200} height={200}/>:<img src={Scissor} width={200} height={200}/>
                            }
                        </div>
                    }
                </div>

                <div className="grow flex-1 flex flex-col justify-center items-center space-y-10">
                    <div>Name: {oppData.name}</div>
                    <div>Score: {oppScore}</div>
                    {
                        !result &&
                        <div>{oppTurn ? 'Opponent finished' : 'Waiting for opponent ....'}</div>
                    }
                    {
                        !roundLoad && <div>
                            {
                                oppChoice==='Rock'?<img src={Stone} width={200} height={200}/>:   oppChoice==='Paper'?<img src={Paper} width={200} height={200}/>:<img src={Scissor} width={200} height={200}/>
                            }
                        </div>
                    }
                </div>
                </div>
                <div className="flex">
                <div className="w-1/2 p-10 flex" >
                    <div className=" flex-col ustify-center items-start text-white text-lg space-y-2">
                        <div className="h-1/2">Your Choices: </div>
                        <div className="h-1/2">Oppo Choices: </div>
                    </div>
                    {pastResults.map((e,i)=>{
                        return (<div className=" flex-col space-y-2">
                            <div key={i}>
                        {e.my==='Rock'?<img src={Stone} width={100} height={100}/>:   e.my==='Paper'?<img src={Paper} width={100} height={100}/>:<img src={Scissor} width={100} height={100}/>}
                        </div>
                        <div key={i}>
                    {e.op==='Rock'?<img src={Stone} width={100} height={100}/>:   e.op==='Paper'?<img src={Paper} width={100} height={100}/>:<img src={Scissor} width={100} height={100}/>}
                    </div>
                        </div>)
                    })}
                
                </div>
                <div className="w-1/2">
                    Messages
                </div>
                
                </div>
        </div>
        </>
    )
}