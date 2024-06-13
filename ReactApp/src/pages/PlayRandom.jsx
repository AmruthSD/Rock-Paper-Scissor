import React, { useState, useEffect } from "react";
import { socket } from "../socket.js";
import { Cookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';
import WaitImg from '../assets/waiting.jpg'
import GameImg from '../assets/Game.jpg'
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
            <div className="flex items-center justify-center h-screen" style={{
        backgroundImage: `url(${WaitImg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}>
                <div >
                    <div className="flex justify-center items-center text-white font-black text-5xl pb-11 mb-32">
                        Waiting For Opponent .......
                    </div>
                </div>
        </div>
        </>);
    }
    return (
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
    );
}
