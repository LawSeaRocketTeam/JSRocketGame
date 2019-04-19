import WebSocket from "./WebSocket";
import { dzapp } from "../../../Main";
import UserConfig from "../../configs/customcfg/UserConfig";
/**
 * brief:Network business instance
 * Author: wenzuoli
 * Date: 2019/04/02
 */
export default class NetworkMgr{
    /**socket communication */
    private mWebsocket:WebSocket=null;
    /**game server disconnect callback */
    private mIsDisconnect:boolean = true;
    /**game server connect callback */
    private mOnConnecting:Laya.Handler=null;
    /**game server connect callback */
    private mOnConnected:Laya.Handler=null;
    /**game server connect failed callback */
    private mOnConnectFailed:Laya.Handler=null;
    /**send message failed callback. */
    private mOnSendMsgFailed:Laya.Handler = null;
    /**the temp message buffer  */
    private mObjSplitMsg:object = {};
    /**message package module */
    private mMsgPackage:any = null;
 

    /**
     * network handler module:send message e.g.
     * @param onConnected connect callback
     */
    constructor(onConnected:Laya.Handler,onConnectFailed:Laya.Handler,onSendMsgFailed?:Laya.Handler){
        //todo:wenzuoli modify to use import to attach.
        this.mMsgPackage = Laya.Browser.window.msgpack5();
        this.mOnConnected = onConnected;
        this.mOnConnectFailed = onConnectFailed;
        let _startConnecting:Laya.Handler = Laya.Handler.create(this,this.startConnecting);
        let _afterConnect:Laya.Handler = Laya.Handler.create(this,this.afterConnected);
        let _afterConnectFailed:Laya.Handler = Laya.Handler.create(this,this.afterConnectFailed);
        let _afterDisconnect:Laya.Handler = Laya.Handler.create(this,this.afterDisconnected);
        let _afterMsg:Laya.Handler = Laya.Handler.create(this,this.receivedMsg,null,false);
        onSendMsgFailed && (this.mOnSendMsgFailed = onSendMsgFailed);
        this.mWebsocket = new WebSocket(_startConnecting,_afterConnect,_afterConnectFailed,_afterDisconnect,_afterMsg);
        this.mWebsocket.AutoReconnect=true;
        this.mWebsocket.connect(UserConfig.serverAddress,UserConfig.serverPort);
    }
     /**start connecting to game server */
     private startConnecting():void{
        dzapp.showLoading();
    }

    /**after connected to game server */
    private afterConnected():void{
        this.mIsDisconnect = false;
        dzapp.hideLoading();
        if(this.mOnConnected){
            this.mOnConnected.run();
        }
    }
    /**after connected to game server failed callback */
    private afterConnectFailed():void{
        dzapp.hideLoading();
        if(this.mOnConnectFailed){
            this.mOnConnectFailed.run();
        }
    }
    /**after game server disconnect */
    private afterDisconnected():void{
        if(!this.mIsDisconnect){
            this.mIsDisconnect = true;
            dzapp.showToast("网络断开");
        }
    }
    /**
     * after received message callback. 
     * @param data received data from websocket module[eventname:string,data:byte]
     */
    private receivedMsg(data):void{
        //prefix mean this message received from witch game server.
        let _prefix:string = data[0];
        let _msg:any =data;

        let eventName:string = "";
        try{
            let byte = new Laya.Byte(_msg);
            let _roomId:number = byte.getInt32();
            eventName = byte.getUTFString();
            if(_roomId==0X11041104){// gc connect & gs connect successfully.
                dzapp.Logger.info("connect gc/gs successfully..");
                //todo if need. 
            }
           
            if(this.isKickOff(eventName)){
                //TODO:wenzuoli
                return;
            } 

            switch(eventName){
                case "YOUKICK":
                    //TODO:wenzuoli
                break;
                case "MSGPACL_PROTOCOL":
                    eventName = byte.getUTFString();
                    var mpSize = byte.getInt32();
                    var mpArrByte: Uint8Array = byte.getUint8Array(byte.pos, mpSize);
                    this.msgPackageDispatch(_roomId,eventName,mpArrByte); 
                break;
                case "MSGPACL_PROTOCOL_SPLIT_START":
                    var cmd = byte.getUTFString();
                    this.mObjSplitMsg[cmd] = new Laya.Byte();
                break;
                case "MSGPACL_PROTOCOL_SPLIT":
                    var cmd = byte.getUTFString();
                    var size = byte.getInt32();
                    var splitByte = this.mObjSplitMsg[cmd];
                    splitByte.writeArrayBuffer(byte.buffer, byte.pos, size);
                break;
                case "MSGPACL_PROTOCOL_SPLIT_END":
                    var cmd = byte.getUTFString();
                    var splitByte = this.mObjSplitMsg[cmd];
                    var mpArrByte: Uint8Array = splitByte.getUint8Array(0, splitByte.length);
                    // this.gsOnMsgPackMsg(cmd, mpArrByte);
                    this.msgPackageDispatch(_roomId,cmd,mpArrByte); 
                    this.mObjSplitMsg[cmd] = null;
                break;
                default:
                    //event name need add the local protocol prefix.
                    this.normalMsgDispatch(_roomId,eventName,byte); 
                break;
            }
             
            byte.clear();
        }catch(e){
            dzapp.Logger.error(e.message);
        }
    }

    /**
     * message package dispatch
     * @param eventName event name
     * @param mpByte received buffer
     */
    private msgPackageDispatch(roomId:number,eventName:string,mpByte:Uint8Array):void{
        let data = this.mMsgPackage.decode(mpByte);  
        this.normalMsgDispatch(roomId,eventName,data);
    }

    /**
     * normal message dispatch(byte)
     * @param eventName event name
     * @param data need dispatch data(byte)
     */
    private normalMsgDispatch(roomId:number,eventName:string,data:any):void{
        dzapp.Logger.info("received message:"+eventName);
        dzapp.Events.Event(roomId,eventName,data);
    }

    /**
     * Send message package.
     * @param command protocol event name
     * @param args other parameters
     */
    public sendMsgPackage(roomId:number,command:string,...args:any[]){
        var data = this.mMsgPackage.encode(args);
            var byte:Laya.Byte = new Laya.Byte();
            byte.writeInt32(roomId);
            byte.writeUTFString("MSGPACL_PROTOCOL");
            byte.writeUTFString(command);
            byte.writeInt32(data.length);
            byte.writeArrayBuffer(data,0); 
            // for(let i = 0; i< data.length; i++){
            //     byte.writeByte(data[i]);
            // }
            this.sendMessage(byte);
    }

    /**
     * Send normal message.
     * @param byte send buffer
     */
    private sendMessage(byte:Laya.Byte):void{
        try{
            if(null != this.mWebsocket){
                // if(timeout>0){
                //     this.onTurnonDelay(timeout);
                // } 
                this.sendSocketMsg(byte);
            }
        }catch(e){
            dzapp.Logger.error(e.message);
        }
    }

    /**
     * check is kickoff by server
     * @param eventName event name
     */
    private isKickOff(eventName:string):boolean{
        return eventName.indexOf("YOUKICK")>-1;
    }

    public enterRoom(eventName:string,gameType:string,roomId:number){
        //0x11041104, "query", "ddz_free"
        var byte:Laya.Byte = new Laya.Byte();
        byte.writeInt32(0X11041104);
        byte.writeUTFString(eventName);
        byte.writeUTFString(gameType);
        byte.writeInt32(roomId);
        this.sendSocketMsg(byte);
    }

    /**
     * 
     * @param eventName event name
     * @param gameType game type :ddz_free
     */
    public enterGame(eventName:string,gameType:string){
        //0x11041104, "query", "ddz_free"
        var byte:Laya.Byte = new Laya.Byte();
        byte.writeInt32(0X11041104);
        byte.writeUTFString(eventName);
        byte.writeUTFString(gameType);
        this.sendSocketMsg(byte);
    }

    /**
     * send message
     * @param roomId roomid
     * @param eventName event name
     * @param data data
     */
    public sendMsg(roomId:number,eventName:string,data:Laya.Byte):void{
        var byte:Laya.Byte = new Laya.Byte();
        byte.writeInt32(roomId); 
        byte.writeUTFString(eventName);
        byte.writeArrayBuffer(data,0);
        this.sendMessage(byte);
    }

    /**
     * login to gc
     * @param acc account
     * @param pwd pwd
     * @param site default 0
     */
    public loginToGC(acc:string,pwd:string,site:number=0):void{
        if (typeof acc !== "string") { acc = ""; }
            if (typeof pwd !== "string") { pwd = ""; }
            if (typeof site !== "number") { site = 0; }

            if (0 >= acc.length) { acc = "119"; }

            let byte:Laya.Byte = new Laya.Byte();
            byte.writeInt32(1);
            byte.writeUTFString("RQLG");
            byte.writeUTFString(acc);
            byte.writeUTFString(pwd);
            byte.writeInt32(site);
            byte.writeUTFString("");
            byte.writeUTFString("");
            byte.writeUTFString("");
            //this.mWebsocket.sendMsg(byte);
            this.sendSocketMsg(byte);
    } 

    /**send message to server */
    private sendSocketMsg(byte:Laya.Byte):void{
        if(this.mWebsocket && this.mWebsocket.connected){
            this.mWebsocket.sendMsg(byte);
        }else{
            this.mOnSendMsgFailed&&this.mOnSendMsgFailed.run();
        }
    }
}