import { dzapp } from "../../../Main";


/**
 * brief:Base Socket module
 * Author: wenzuoli
 * Date: 2019/04/02
 */
export default class WebSocket extends Laya.Socket {
    //message distribution
    private _onEvent:Laya.Handler=null;
    /**on server connecting. */
    private _onConnecting:Laya.Handler=null;
    /**on server connect successfully. */
    private _onConnected:Laya.Handler=null;
    /**on connect to server failed. */
    private _onConnectFailed:Laya.Handler=null;
    //on server disconnect
    private _onDisConnected:Laya.Handler=null;
    //if auto reconnect
    private _autoReconnect:boolean = true;
    // connection address            
    public mAddress:string = "127.0.0.1";    
    // connect port.            
    public mPort:number = 443;     
    //retry each 2 seconds.
    private mReconnectTimeout:number=1000*2; 
    //max retry time when connect failed. -1 not limit.
    private _ReconnectTime:number=3;       
    /**disconnect ty game server*/
    private mServerKicked:boolean = false; 
    /**disconnect time */
    private mKickedTime:Date;
    /**current is reconnect：not first time to connect to game server */
    private mIsReconnect:boolean=false;

    /**
     * web socket entry.
     * @param onConnecting start reconnecting callback
     * @param onConnected on connected successfully.
     * @param onDisconnected on game server disconnect.
     * @param onRecMsg on received new message.
     */
    constructor(onConnecting:Laya.Handler,onConnected:Laya.Handler,onConnectFailed:Laya.Handler,onDisconnected:Laya.Handler,onRecMsg:Laya.Handler) {
        super();
        this.endian = Laya.Byte.LITTLE_ENDIAN; 

        this.on(Laya.Event.OPEN, this, this.onOpenHandler);
        this.on(Laya.Event.CLOSE, this, this.onCloseHandler);
        this.on(Laya.Event.MESSAGE, this, this.onRecvHandler);
        this.on(Laya.Event.ERROR, this, this.onErrorHandler); 

        this._onConnecting = onConnecting;
        this._onConnected = onConnected;
        this._onConnectFailed = onConnectFailed;
        this._onDisConnected = onDisconnected;
        this._onEvent = onRecMsg;
    }
 
    /**set auto reconnect status. */
    public set AutoReconnect(autoReconnect:boolean){
        this._autoReconnect = autoReconnect;
    }


    /**
     * connect to server
     * @param ip connect address: support ip/
     * @param port port
     */
    public connect(address:string, port:number):void {
        this.mAddress = address;
        this.mPort = port;
        if(address.indexOf("wss://")>-1||address.indexOf("ws://")>-1){
            let url:string = address + ":" + port;
            super.connectByUrl(url);
        }else{
            super.connect(this.mAddress,this.mPort);
        }
    }

    /**
     * send buffer
     * @param byte byte buffer
     */
    public sendMsg(byte:Laya.Byte):void {
        byte.endian = Laya.Byte.LITTLE_ENDIAN;
        this.send(byte.buffer);
        byte.clear();
    } 
    
    /**
     * 接收数据
     * @param message 网络数据
     */
    private onRecvHandler(message:any):void {
        try {
            if (!(message instanceof ArrayBuffer)) {
                let err:string ="Socket error: Message type is not a standard arraybuffer";
                dzapp.Logger.error(err); 
                return;
            }
            if(this._onEvent){
                this._onEvent.runWith(message);
            } 

        } catch (err) {
            dzapp.Logger.error("Socket error: read buffer exception.", err);
        }
    }

    /**
     * connect successfully.
     * @param message received message data.
     */
    private onOpenHandler(message:any):void {
        //clear the reconnect timer
        Laya.timer.clear(this,this.reconnect);
        //reset the retry time
        this._ReconnectTime = 3; 
        //print connected log.
        this.printLog("):Connection server successful"); 

        //connected callback.
        if(this.mIsReconnect&&this._onConnected){
            this.mIsReconnect = false;
            this._onConnected.run();
        }
    }

    /**
     * connection was interrupted 
     */
    private onCloseHandler():void {
        if(this._autoReconnect){
            if(this._ReconnectTime>0||this._ReconnectTime==-1){
                this.mIsReconnect = true;
                this.mReconnectTimeout=this.resetReconectTime();
                //delay retry.
                Laya.timer.once(this.mReconnectTimeout,this,this.reconnect);
            }
        }
    }

    /**
     * reconnect timeout reset login here.
     */
    private resetReconectTime():number{
            return this.mReconnectTimeout*1;
    }

    /**
     * current is kick time
     * @param date1 
     * @param date2 
     */
    private isKickTime(date1:Date,date2:Date):boolean{
        let n1:number = date1.getTime();
        let n2:number = date2.getTime();
        return ((n2-n1)/1000/60)<5;
    }

    /**
     * connect failed.
     */
    private onErrorHandler():void {
        if(this._onConnectFailed){
            this._onConnectFailed.run();
        }else{
            //print failed log
            this.printLog("Connection server failed"); 
        }
    }

    /**
     * reconnect to game server.
     */
    public reconnect():void{ 
        if(this.connected){
            this.printLog("Discovering that the socket is connected when trying to reconnect. system will close it first.");
            try{
                this.close();
            }catch(e){
                this.printLog("An error occurred while closing the connection.")
            }
        }
        if(this._ReconnectTime>0){
            this._ReconnectTime--;
        }
        this.printLog("try to reconnect...");
        this.connect(this.mAddress,this.mPort); 
    }

    
    public serverKickOff():void{
        this.mServerKicked = true;
        this.mKickedTime = new Date();
    }

    /**
     * print log
     * @param msg message
     */
    private printLog(msg:string):void{
            //shoud be call eventlog module to handler this event. 
        dzapp.Logger.info(msg);
    }
}