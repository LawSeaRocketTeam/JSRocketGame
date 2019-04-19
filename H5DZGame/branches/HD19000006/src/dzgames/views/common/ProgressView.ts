import { ui } from "../../../ui/layaMaxUI";
import { dzapp } from "../../../Main";

export default class ProgressView extends ui.dzgame.common.ProgressUI{
    constructor(){
        super(); 
    }
     
    public lblTips:Laya.Label;
    createChildren():void{
        super.createChildren();
    }
    onEnable():void{
         
    } 

    public progressChange(val:number):void{
        this.lblTips.text = "progress ".concat((val*100).toString(),"%");
        dzapp.Logger.info(this.lblTips.text);
    }
}