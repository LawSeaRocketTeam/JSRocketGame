export default class GroupInfo{

    //房间ID
    public mId:number = 0;
    //房间名字
    public mName:string = "";
    //房间赔率
    public mGamePeilv:number = 0;
    //房间ip
    public mIp:string = ""
    //房间端口
    public mPort:number = 0;
    //当前在线人数
    public mCurrOnline:number = 0;
    //最大在线人数
    public mMaxOnline:number = 0;
    //是否公会房间
    public mIsGuildRoom:number = 0;
    //是否竞技场房间
    public mIsTourRoom:number = 0;
    //房间最小携带
    public mAtLeastGold:number = 0;
    //房间最大携带
    public mAtMostGold:number = 0;
    //是否能坐下
    public mIsCanSit:number = 0;
    //是否欢乐豆场
    public misHuanle:number = 0;
    //是否放作弊场
    public mNoCheat:number = 0;
    //房间抽水(无用参数，有些游戏是动态抽水)
    public mChoushui:number = 0;

    constructor(){
        
    }


    public setData(groupId:number, data:Laya.Byte){
        this.mId            = groupId;
        this.mName          = data.getUTFString();
        this.mGamePeilv     = data.getInt32();
        this.mIp            = data.getUTFString();
        this.mPort          = data.getInt32();
        this.mCurrOnline    = data.getInt32();
        this.mMaxOnline     = data.getInt32();
        this.mIsGuildRoom   = data.getInt32();
        this.mIsTourRoom    = data.getInt32();
        this.mAtLeastGold   = data.getInt32();
        this.mAtMostGold    = data.getInt32();
        this.mIsCanSit      = data.getInt32();
        this.misHuanle      = data.getInt32();
        this.mNoCheat       = data.getInt32();
        this.mChoushui      = data.getInt32();
    }
}