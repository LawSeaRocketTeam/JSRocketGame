import { ui } from "../../../ui/layaMaxUI";

export default class ToastView extends ui.dzgame.common.ToastUI{
    constructor(msg:string){
        super();
        this.mMessage = msg;
    }
    private mMessage:string="";
    public lblTips:Laya.Label;
    private mCloseHandler:Laya.Handler = null;
    private mDisplayTime:number =0.5;

    createChildren():void{
        super.createChildren();
    }
    onEnable():void{
        this.lblTips.text = this.mMessage;
        Laya.Tween.to(this.lblTips,{y:344,alpha:1},800,Laya.Ease.strongOut,Laya.Handler.create(this,this.delayClose));
    }

    /**
     * delay close the toast view
     */
    private delayClose():void{
        Laya.timer.once(1000*this.mDisplayTime,this,this.hideToast);
    }

    /**
     * exit toast view
     */
    private hideToast():void{
        Laya.Tween.to(this.lblTips,{alpha:0,y:152},900,Laya.Ease.strongOut,Laya.Handler.create(this,this.destroyMsg));
    }

    private destroyMsg(){
        this.destroy(true);
    }
}