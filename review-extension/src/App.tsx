import { useEffect, useState } from 'react'
import './App.css'
import { SocketIOService } from './socket/socket.io';

function App() {


    useEffect(()=>{
        socketConnectionHandler()
    },[])


    async function socketConnectionHandler(){
        let { socketConnection } = SocketIOService.getInstance();
        socketConnection.connect();
    }

    return (
        <>
        </>
    )
}

export default App
