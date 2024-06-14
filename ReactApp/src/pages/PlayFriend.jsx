import React, { useState, useEffect,useRef } from "react";
import { socket } from "../socket.js";
import { Cookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';

import GameImg from '../assets/Game.jpg'
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
                <button onClick={createRoom}>Create Room</button>
                <label
                    for="email"
                >
                    RoomID
                </label>
                <input
                    ref={joiningRoomID}
                    placeholder="Enter the roomID"
                />
                <button onClick={joinRoom}>Join Room</button>
                <div>{errorMessage}</div>
            </>
        )
    }
    if(state==='Waiting'){
        return(
            <>
                Waiting for Friend ask them to enter {roomID} as the room id
            </>
        )
    }
    return(
        <>
        <div className="flex text-white items-center justify-center h-screen text-3xl font-bold" style={{
        backgroundImage: `url(${GameImg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        
      }}
      >
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
        </>
    )
}