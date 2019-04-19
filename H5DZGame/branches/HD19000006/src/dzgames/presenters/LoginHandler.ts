import { dzapp } from "../../Main";

export default class LoginHandler{
    private mOnLogined:Laya.Handler=null;
    constructor(){ 
       
    }

    private eventListen():void{
        dzapp.Events.Listen(1,"RELG",this,this.onLogin);
    }

    /**
     * Login to system.
     * @param account account
     * @param pwd password
     */
    public login(account:string,pwd:string,site:number=0,onLogined:Laya.Handler):void{
        this.eventListen();
        this.mOnLogined = onLogined;
        dzapp.showLoading();
        dzapp.Net.loginToGC(account,pwd,site);
    }

    private onLogin(byte:Laya.Byte):void{
        dzapp.hideLoading();
        //off 
        dzapp.Events.off(0,"RELG",this);
        dzapp.Logger.info("login callback.");
        let statu:number = byte.getUint16();
        if(dzapp&&statu==1){
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
            this.afterLogin();
        }else{
           dzapp.showToast("login failed.");
           dzapp.showLoginPanel();
        }
    }
    /**
     * after login to system .success
     */
    private afterLogin():void{
        if(this.mOnLogined){
            this.mOnLogined.run();
        }else{
            dzapp.Logger.info("login success with no handler.");
        }
    }
}