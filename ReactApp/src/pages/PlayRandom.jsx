import React, { useState, useEffect } from "react";
import { socket } from "../socket.js";
import { Cookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';
import WaitImg from '../assets/waiting1.jpg'
import GameImg from '../assets/Game1.png'
import Stone from '../assets/stone.png'
import Scissor from '../assets/scissors.png'
import Paper from '../assets/paper.png'

export default function PlayRandom() {
    const navigate = useNavigate();
    const [waiting, setWaiting] = useState(true);
    const cookies = new Cookies();
    const [oppData, setOppData] = useState({});
    const [myTurn, setMyTurn] = useState(true);
    const [turn, setTurn] = useState('');
    const [oppTurn, setOppTurn] = useState(false);
    const [result, setResult] = useState(false);
    const [youWin, setYouWin] = useState(false);
    const [urScore, setUrScore] = useState(0);
    const [oppScore, setOppScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [oppChoice,setOppChoice] = useState('');
    const [roundLoad,setRoundLoad] = useState(true)
    const [pastResults,setPastResults] = useState([]);
    const [messages,setMessages] = useState([])
    useEffect(() => {
        if (!cookies.get('id') || !cookies.get('name')) {
            navigate('/login'); 
        }
    }, []);    
    useEffect(() => {
        socket.connect();
        setLoading(false);
        socket.emit('public-connect', {
            id: cookies.get('id'),
            name: cookies.get('name')
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const handelStopWaiting = (data) => {
            setLoading(true);
            setOppData(data);
            setWaiting(false);
            setLoading(false);
        };

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

        socket.on('Stop-Waiting', handelStopWaiting);
        socket.on('Result', handelResult);
        socket.on('Opponent-Finished', handelOppFin);
        socket.on('Round', handelRound);

        return () => {
            socket.off('Stop-Waiting', handelStopWaiting);
            socket.off('Result', handelResult);
            socket.off('Opponent-Finished', handelOppFin);
            socket.off('Round', handelRound);
        };
    }, []);

    useEffect(() => {
        if (!myTurn) {
            setLoading(true);
            socket.emit('Turn', { turn: turn });
            setLoading(false);
        }
    }, [myTurn]);

    if (loading) {
        return (<>
            Loading
        </>);
    }
    
    if (waiting) {
        return (<>

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
                    <div className="flex justify-center items-center text-black font-black text-5xl pb-11 mb-32">
                        Waiting For Opponent .......
                    </div>
                </div>
        </div>
        </div>
        </>);
    }
    return (
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
    );
}
