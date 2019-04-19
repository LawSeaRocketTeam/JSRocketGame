import { dzapp } from "../../../Main";
import BaseScene from "./BaseScene";

/**
 * @desc : base view
 * @author: Wenzuoli
 * @Date: 2019/04/08
 */ 
 export default class BaseView extends Laya.View{
     private mExitTime:number = 1000*0.5; 
     /**current z-index for add child. */
     private zIndex:number = 0;
    /** 
     * Page's base view include all common functions.
     */
    constructor(){
        super();
        //this.on(Laya.Event.REMOVED,this,this.offAllListener);
    }

    onDestroy():void{
        this.offAllListener();
    }

    /**
     * Remove all the listeners of the current page
     */
    private offAllListener():void{
        dzapp.Events.offAllByCaller(this);
    }

    /**
     * Remove from parent container and destroy self.
     */
    public exitAndDestroy():void{ 
        this.exitSystem(this.destroy,[true]);
    }

    /**
     * exit system
     * @param callback callback function
     * @param args function arguments
     */
    private exitSystem(callback:Function,...args:any[]):void{
        Laya.Tween.to(this, {alpha:0.1,x:-2160},
            this.mExitTime, Laya.Ease.cubicOut, Laya.Handler.create(this,callback,args), 0
        );  
    }

    /**
     * back to last view
     */
    public goBack():void{
        this.exitAndDestroy();
    }

    /**
     * goto the target view ,must use the goBack to come back
     * @param v new view
     */
    public gotoView(v:laya.display.Node):laya.display.Node{
         return super.addChild(v);
         //remove the switch effect.
        // let _loading:BlackingUI = new BlackingUI();
        // this.addChild(_loading);
        // _loading.show(300,Laya.Handler.create(this,this.addView,[v,_loading]));
    }

    /**
     * Add child to view.
     * @param node child
     */
    public addChild(node:laya.display.Node):laya.display.Node{
        if(node instanceof BaseScene){
            throw "Cannot add scene in the view.";
            return;
        }
        if(this.zIndex==undefined){
            this.zIndex = 0;
        }
        if(node instanceof BaseView){
            node.zOrder = this.zIndex++;
            return this.gotoView(node);
        }           
        return super.addChildAt(node,this.zIndex++);
    }

    /**
     * Add childs to view.
     * @param args childs
     */
    public addChildren(...args:any[]):void{
        super.addChildren(...args);
    }
} 