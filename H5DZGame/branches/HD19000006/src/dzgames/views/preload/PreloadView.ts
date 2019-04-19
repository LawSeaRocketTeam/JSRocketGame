import { dzapp } from "../../../Main";
import { ui } from "../../../ui/layaMaxUI";
import LoginHandler from "../../presenters/LoginHandler";

export default class PreloadView extends ui.dzgame.common.PreloadUI {
   
    constructor() {
        super();  
    }
  
    private enterLobby():void{
        dzapp.enterLobby();
    }

    public btnLogin:Laya.Button;

    // createChildren():void{
    //    // super.createChildren();
    // }

    onEnable(): void {
        this.eventListen();
        this.eventBind();
    } 

    private eventBind():void{
        this.btnLogin&&(this.btnLogin.visible=true)&&this.btnLogin.on(Laya.Event.CLICK,this,this.onClick);
    }

    private eventListen():void{
        //dzapp.mEvents.Listen(0,"RELG",this,this.afterLogin);
        
    }

    private afterLogin(byte:Laya.Byte):void{
        //off 
        dzapp.Events.off(0,"RELG", this);
        dzapp.Logger.info("login callback.");
        let statu:number = byte.getUint16();

        if(dzapp){
             // 更新玩家数据
            dzapp.Player.mClientLoadStep  = 3;
            dzapp.Player.mLastRoomName    = byte.getUTFString();
            dzapp.Player.mLastRoomId      = byte.getInt32();
            dzapp.Player.mUserId          = byte.getInt32();
            dzapp.Player.mGameKey         = byte.getUTFString();
            dzapp.Player.mMd5             = byte.getUTFString();
            dzapp.Player.mIsNewUser       = byte.getByte();
            dzapp.Player.mNickName        = byte.getUTFString();
            dzapp.Player.mBBSUrl          = byte.getUTFString(); 
            dzapp.Logger.error("UserID:"+dzapp.Player.mUserId);
            dzapp.enterLobby();
        }
    }

    onClick():void{
        //dzapp.Net.LoginToGC("111","11",0)
        let login:LoginHandler = new LoginHandler();
        login.login("11","11",0,Laya.Handler.create(this,this.enterLobby));
    }
}