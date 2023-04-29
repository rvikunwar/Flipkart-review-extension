import { io } from "socket.io-client";

let SocketService: any;

export class SocketIOService {
    private socketRef;
    private socketRefTimeout: any;

    constructor(){
        this.socketRef = io('http://127.0.0.1:12345');
    }

    static getInstance() {
        if (!SocketService) {
            SocketService = new SocketIOService()
            return { socketConnection: SocketService, status: "new" }
        }
        return { socketConnection: SocketService, status: "old" }
    }

    static getOldInstance(){
        return SocketService
    }

    getreviews(){
        this.socketRef.emit("GET_REVIEWS", { url: "https://www.flipkart.com/iphone/product-reviews/itmd19127afbbce1?pid=MOBG9QWVZFNZDNMM&lid=LSTMOBG9QWVZFNZDNMMI0RIWZ&sortOrder=MOST_HELPFUL&certifiedBuyer=false&aid=overall&page="})
    }
    connect() {
           
        this.socketRef.on("connect", () => {
            console.log("*****************************")
            console.log("***********CONNECTED********")
            console.log("*****************************")
            this.getreviews()
        });

        this.socketRef.on("disconnect", (reason) => {
            if (reason === "io server disconnect") {
                // the disconnection was initiated by the server, 
                // you need to reconnect manually
                // this.socketRef.connect();
            }

            console.log("*****************************")
            console.log("********DIS-CONNECTED********")
            console.log("*****************************")
        });

        this.socketRef.on("connect_error", (error) => {
            console.log(error.message, 'connect_error')
            this.socketRef.disconnect();
            console.log("*****************************")
            console.log("********ERROR********")
            console.log("*****************************")
          
        });

        this.socketRef.on("RESPONSE", (data) => {
            console.log("*****************************")
            console.log("********DATA********")
            console.log("*****************************")
            console.log(data)
        });

        this.socketRef.on("exception", (data: any) => {
            console.log("*****************************")
            console.log("********EXCEPTION********")
            console.log("*****************************")
            console.log(data)
        });
    }

    async newConnection(){
        console.log("*****************************")
        console.log("********NEW-CONNECTION********")
        console.log("*****************************")

        clearTimeout(this.socketRefTimeout);
        this.socketRefTimeout = setTimeout(() => {
            console.log("***************", "TIMEOUT", "*****************")
            this.socketRef.disconnect();
        }, 10*60*1000)

        this.socketRef.connect();
    }

    isConnected(){
        return this.socketRef.connected;
    }

    isDisConnected(){
        return this.socketRef.disconnected;
    }

    destroy(){
        if(!this.socketRef?.isConnected){
            this.socketRef.disconnect();
        }
        SocketService = null;
    }

    disconnect() {
        this.socketRef.disconnect();
    }
}

