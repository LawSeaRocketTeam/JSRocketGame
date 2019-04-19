import BaseScene from "../../components/dzpage/BaseScene";

export default class GameItem{
    constructor(key:string,res:Array<any>,scene:BaseScene){
        this.mGameKey = key;
        this.mGameRes = res;
        this.mGameView = scene;
    }

    public mGameKey:string;
    public mGameRes:Array<any>;
    public mGameView:BaseScene;
}