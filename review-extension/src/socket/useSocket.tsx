import React, { useEffect, } from 'react';
import { SocketIOService } from '../services/socket/socket.io';

import { storageKeys } from '../constants/storageKeys';
import { getFromAsyncStorage } from '../services/helper.service';
import { notificationTypes } from '../constants/notificationTypes';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ISocketState, IStore, IUserStore } from '../assets/interfaces/store.interface';


function SocketInitiator({
    navigation,
    reduxSocket,
    reduxUser
}: {
    navigation?: any;
    reduxSocket: ISocketState;
    reduxUser: IUserStore
}) {
    navigation = navigation ?? useNavigation();

    const navigateToHome = (bookingId: string, notificationType: string) => {
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [
                {
                    name: 'Main',
                    state: {
                        routes: [
                            {
                                name: 'HomeStack',
                                state: {
                                    routes: [
                                        {
                                            name: 'Home',
                                            params: {
                                                transactionData: {
                                                    notificationType,
                                                    bookingId,
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        }));
    };

    const navigateToSuccessfullTransaction = (bookingId: string) => {
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [
                {
                    name: 'Main',
                    state: {
                        routes: [
                            {
                                name: 'HomeStack',
                                state: {
                                    routes: [
                                        {
                                            name: 'SuccessfullTransaction',
                                            params: {
                                                transactionData: {
                                                    bookingId,
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        }));
    }


    async function socketConnectionHandler(){
        const token = await getFromAsyncStorage(storageKeys.TOKEN);
        if(token){

            let { socketConnection, status } = SocketIOService.getInstance(token);
            if(reduxSocket.connectionNeeded && socketConnection.isDisConnected()){
                socketConnection.newConnection()
            }
            if(status === "new") socketConnection.connect(onNotification);
    

            function onNotification(notify: any) {
                if (notify.type === notificationTypes.CHECK_IN_SUCCESSFULL) {
                    navigateToHome(notify.bookingId, notificationTypes.CHECK_IN_SUCCESSFULL);
                } else if (notify.type === notificationTypes.CHECK_IN_FAILED) {
                    navigateToHome(notify.bookingId, notificationTypes.CHECK_IN_FAILED);
                } else if (notify.type === notificationTypes.CHECK_OUT_SUCCESSFULL) {
                    navigateToSuccessfullTransaction(notify.bookingId);
                } else if (notify.type === notificationTypes.CHECK_OUT_FAILED) {
                    navigateToHome(notify.bookingId, notificationTypes.CHECK_OUT_FAILED);
                } 
            }
        }
    }

    function socketDisConnectionHandler(){
        const socketConnection = SocketIOService.getOldInstance();
        if(reduxUser.data){
            if(socketConnection  && socketConnection.isConnected()){
                socketConnection.disconnect();
            }  
        } else {
            socketConnection?.destroy()
        }
  
    }


    //establishes socket connection
    useEffect(()=>{
        if(reduxUser.data){
            socketConnectionHandler()
        } else if(reduxUser && reduxUser.data === null){
            socketDisConnectionHandler()
        }
    
    },[reduxUser])


    useEffect(()=>{
        console.log("Socket connection useeffect ", reduxSocket)

        if(!reduxSocket.isConnected){
            socketConnectionHandler()
        }
        
        if(reduxSocket.isConnected && !reduxSocket.connectionNeeded){
            socketDisConnectionHandler()
        }
    },[reduxSocket.isConnected, reduxSocket.connectionNeeded])


    return null;
}

function mapStateToProps(state: IStore) {
    return {
        reduxSocket: state.socket,
        reduxUser: state.user,
    };
}

export default connect(mapStateToProps, )(SocketInitiator);
