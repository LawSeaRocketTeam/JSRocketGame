export default class LocalPlayer{
 
    /**
     * 网络加载步骤：0未进行加载；1加载预加载资源完毕；2：加载游戏资源完毕；3：进入游戏
     */
    public mClientLoadStep:number=0;

    public mLoginPlat:string="";
    public mAccount:string=""; 
    public mPassword:string="";
    public mRegSite:string="";

    public mSiteNum:number=0;
    /** 玩家Id */
    public mUserId:number = 0;
    /** 玩家昵称 */
    public mNickName:string = "";
    /**YY帐号 */
    public mYYAccount:string="";
    /** 玩家头像 */
    public mFace:string = "";
    /** 玩家金币/金豆 */
    public mGold:number = 0;
    public mDZCash:number = 0;
    /**
     * 礼券
     */
    public mLiQuan:number = 0; 
    public mBean:number = 0;
    public mHomePeas:number = 0;
    /** 玩家性别 */
    public mSex:number = 0;
    public mLastRoomName:string = "";
    public mLastRoomId:number = 0; 
    public mGameKey:string = "";
    public mPortKey:string = "";
    public mMd5:string = "";
    public mIsNewUser:number = 0;
    public mBBSUrl:string = "";
    /** 所在城市 */
    public mCity:string = "";
    public mChannelId:number = 0;
    /** 玩家经验 */
    public mGameExp:number = 0;
    /** 能否坐下 */
    public mCanSit:number = 0;
    public mTourPoint:number = 0;
    
    constructor() {
        // theApp.events.on(protocol.land.GC2C_PLAYERINFO,this, this.refreshUserInfoByGC);
        // theApp.events.on(protocol.land.GC2C_PLAYERINFOEX,this, this.refreshUserInfoByGCEx);
        // theApp.events.on(protocol.land.GS2C_USERDATA, this, this.refreshUserInfoByGS);
        // theApp.events.on(protocol.land.GS2C_LIQUAN_NUM,this,this.refreshLiQuanByGS);
        // theApp.events.on(protocol.land.GS2C_REGB,this,this.refreshUserGold);
    }

    /**
     * show user gold as short string.
     */
    public getShortGoldString():string{
        return Number.ToShortString(this.mGold);
    }

    /**
     * show user LiQuan as short string.
     */
    public getShortLiQuanString():string{
        return Number.ToShortString(this.mLiQuan);
    }

    /**
     * 刷新金币
     * @param data 数据流
     */
    private refreshUserGold(data:Laya.Byte):void{
        this.mGold = data.getInt32();
        this.mDZCash = data.getInt32();
        this.mBean = data.getInt32();
        this.mHomePeas = data.getInt32();
    }
  
    /**
     * 更新玩家数据by gc
     */
    private refreshUserInfoByGC(message:Laya.Byte):void {
        this.mUserId    = message.getInt32();
        this.mNickName  = message.getUTFString();
        this.mFace      = message.getUTFString();
        this.mGold      = message.getInt32();
        this.mDZCash    = message.getInt32();
        this.mBean      = message.getInt32();
        this.mHomePeas  = message.getInt32();
        this.mSex       = message.getInt32();
    }

    /**
     * 更新玩家数据by gc Ex
     */
    private refreshUserInfoByGCEx(message:Laya.Byte):void {
        this.mUserId    = message.getInt32();
        this.mNickName  = message.getUTFString();
        this.mFace      = message.getUTFString();
        this.mGold      = message.getInt32();
        this.mDZCash    = message.getInt32();
        this.mBean      = message.getInt32();
        this.mHomePeas  = message.getInt32();
        this.mSex       = message.getInt32();
        this.mYYAccount  = message.getUTFString();
    }

    /**
     * 更新玩家数据by gs
     */
    private refreshUserInfoByGS(message:Laya.Byte):void {
        this.mPortKey   = message.getUTFString();
        this.mSex       = message.getByte();
        this.mNickName  = message.getUTFString();
        this.mFace      = message.getUTFString();
        this.mGold      = message.getInt32();
        this.mDZCash    = message.getInt32();
        this.mBean      = message.getInt32();
        this.mHomePeas  = message.getInt32();
        this.mCity      = message.getUTFString();
        this.mChannelId = message.getInt32();
        this.mUserId    = message.getInt32();
        this.mMd5       = message.getUTFString();
        this.mGameExp   = message.getInt32();
        this.mCanSit    = message.getInt32();
        this.mTourPoint = message.getInt32();
    }

    /**
     * 更新玩家礼券数据by gs
     */
    private refreshLiQuanByGS(message:Laya.Byte):void { 
        this.mLiQuan      = message.getInt32(); 
        //theApp.events.event(protocol.land.GS2C_LIQUAN_NUM_CHANGE);
    }

    /**
     * get the head image of the current player.
     */
    public getHeadImage(){
        return this.mSex<1?"game/landlords/head/girl.png":"game/landlords/head/boy.png";
    }
}