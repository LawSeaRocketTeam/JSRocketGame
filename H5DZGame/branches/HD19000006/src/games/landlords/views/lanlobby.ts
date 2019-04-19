import { ui } from "../../../ui/layaMaxUI";
import { dzapp } from "../../../Main";
import lanLobbyData from "../data/lanlobbydata";

export default class LanLobbyView extends ui.games.landrods.LanLobbyUI{
    constructor(){
        super();
    }
  
    onEnable():void{  
        this.eventListen();
        this.showRooms(); 
        this.eventBinding();
    }

    eventListen():void{
        dzapp.Events.Listen(1,"gs_conneted",this,this.startGame);
    }
    eventBinding():void{
        this.btnBack.on(Laya.Event.CLICK,this,this.gotoLobby);
        this.btnRoom.on(Laya.Event.CLICK,this,this.enterRoom);
    }

    showRooms():void{
        let servers:Array<any> = lanLobbyData.instance.getServers();
        this.lblTips.text = "Welcome "+dzapp.Player.mNickName+",id:"+dzapp.Player.mUserId+"\n Room List Count:"+servers.length;
    }

    gotoLobby():void{
        dzapp.enterLobby();
    }

    enterRoom():void{
        dzapp.Net.enterRoom("enter","ddz_free", parseInt(lanLobbyData.instance.getServers()[0].groupid));
    }
    private mRoomId:number=0;
    startGame(byte:Laya.Byte):void{
         this.mRoomId = byte.getInt32();
         let result:number = byte.getInt32();
         if(1==result){
             dzapp.showToast("进入房间...roomid:"+this.mRoomId);
             this.btnSend.on(Laya.Event.CLICK,this,this.sendMessage);
         }
    }

    sendMessage():void{
        dzapp.Net.sendMsgPackage(this.mRoomId,"xxxxx",1,2,3);
        dzapp.Net.sendMsg(this.mRoomId,"xxxxx",new Laya.Byte());
    }
}
