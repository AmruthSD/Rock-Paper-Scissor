import React, { useState, useEffect } from "react";
import { socket } from "../socket.js";
import { useCookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';

export default function PlayRandom() {
    const navigate = useNavigate();
    const [waiting, setWaiting] = useState(true);
    const [cookies, setCookie] = useCookies(['id', 'name']);
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
        if (!cookies.id || !cookies.name) {
            navigate('/login'); 
        }
    }, [cookies, navigate]);    
    useEffect(() => {
        console.log("Component mounted. Initial cookie values: ", cookies);
        socket.connect();
        setLoading(false);
        socket.emit('public-connect', {
            id: cookies.id,
            name: cookies.name
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
            Waiting for opponent
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
                    <div>Name: {cookies.name}</div>
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
