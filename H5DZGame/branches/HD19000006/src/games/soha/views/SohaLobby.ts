import { ui } from "../../../ui/layaMaxUI";
import { dzapp } from "../../../Main";
import GroupInfo from "../data/GroupInfo";

export default class SohaLobbyView extends ui.games.soha.SohaLobbyUI{
    //房间列表数据
    private mRoomList:Array<GroupInfo> = null;
    //场景是否加载完成
    private mLoadOK:Boolean = false;

    constructor(){
        super();

        this.eventListen();
    }
  
    onEnable():void{  
        this.mLoadOK = true;

        this.eventBinding();
        //场景加载完成，尝试显示房间列表
        this.showRooms(); 
    }

    private eventListen():void{
        dzapp.Events.Listen(1,"REGI",this,this.onRecvRoomList);
    }
    private eventBinding():void{
        this.btnBack.on(Laya.Event.CLICK,this,this.gotoLobby);
        // this.btnRoom.on(Laya.Event.CLICK,this,this.enterRoom);
    }

    private gotoLobby():void{
        dzapp.enterLobby();
    }

    private onRecvRoomList(data:Laya.Byte){
        this.mRoomList = new Array();
      
        let groupId:string = ""; 
        let groupInfo:GroupInfo;
        let name = data.getUTFString();
        while((groupId = data.getUTFString()) != "" && data.pos < data.length)
        {
            groupInfo = new GroupInfo();
            groupInfo.setData(Number(groupId), data)
            this.mRoomList.push(groupInfo);
        } 

        //收到数据完成，尝试显示房间列表
        this.showRooms();
    }

    private showRooms():void{
        if(!this.mLoadOK || !this.mRoomList)    return;

        
    }
}
