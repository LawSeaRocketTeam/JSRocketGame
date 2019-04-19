import { ui } from "../../../ui/layaMaxUI";

/**
 * @brief : loading view
 * @Author: Wenzuoli
 * @Date: 2019/04/08
 */ 
    export default class LoadingView extends ui.dzgame.common.LoadingUI{
    constructor(){
        super();
    }

    public lblTips:Laya.Label;
    public short:boolean = true;

    createChildren():void{
        super.createChildren();
    }

    onEnable():void{
        Laya.timer.loop(500,this,this.changeFont);
    }

    changeFont():void{
        this.short = !this.short;
        let msg:string = "Loading"; 
        this.lblTips.text = this.short?"Loading.":".Loading";
    }

    onDestroy():void{
        Laya.timer.clear(this,this.changeFont);
    }
}