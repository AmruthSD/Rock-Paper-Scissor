import React, { useState, useEffect } from "react";
import { socket } from "../socket.js";
import { Cookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';

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
            setMyTurn(true);
            setOppTurn(false);
            setLoading(false);
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
            <div className="flex justify-center items-center h-screen bg-cover bg-center" style={{backgroundImage: "url('https://img.freepik.com/free-vector/realistic-neon-lights-background_52683-59889.jpg?size=626&ext=jpg&ga=GA1.1.44546679.1717027200&semt=ais_user')"}}>

                <div >
                    <div className="flex justify-center items-center text-sky-500 font-black text-5xl pb-11">
                        Waiting For Opponent
                    </div>
                </div>
        </div>
        </>);
    }
    return (
        <>
            <div>
                {
                    (result) &&
                    <div>{youWin ? 'Congrats, you win!' : 'Better luck next time!'}</div>
                }

                <div>
                    <div>Name: {cookies.get('name')}</div>
                    <div>Score: {urScore}</div>
                    {(!result && myTurn) &&
                        <div>
                            <button onClick={() => { setLoading(true); setTurn('Rock'); setMyTurn(false); setLoading(false); }}>Rock</button>
                            <button onClick={() => { setLoading(true); setTurn('Paper'); setMyTurn(false); setLoading(false); }}>Paper</button>
                            <button onClick={() => { setLoading(true); setTurn('Scissor'); setMyTurn(false); setLoading(false); }}>Scissors</button>
                        </div>
                    }
                    {
                        (!result && !myTurn) &&
                        <div>
                            You chose: {turn}
                        </div>
                    }
                </div>

                <div>
                    <div>Name: {oppData.name}</div>
                    <div>Score: {oppScore}</div>
                    {
                        !result &&
                        <div>{oppTurn ? 'Opponent finished' : 'Waiting for opponent'}</div>
                    }
                </div>
            </div>
        </>
    );
}
