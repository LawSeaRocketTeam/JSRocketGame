import GameConfig from "../../../GameConfig";
import { dzapp } from "../../../Main";
import BaseScene from "./BaseScene";
import BaseView from "./BaseView";

/**
 * @desc : 所有对话框的基类，主要用于对页面事件的管理，自动移除等
 * @author: Wenzuoli
 * @date: 2018/05/23
 */ 
export default class BaseDialog extends Laya.Dialog{
        constructor(){
            super();
            //this.on(Laya.Event.REMOVED,this,this.offAllListener);
        }

        /**current z-index for add child. */
        private zIndex:number = 0;

        onDestroy():void{
            this.offAllListener();
        }

        /**
         * remove all listens for current page.
         */
        private offAllListener():void{
            dzapp.Events.offAllByCaller(this);
        }
 
        /**
         * close
         */
        public exit():void {
            this.offAllListener();
            Laya.Tween.to(this, {x:GameConfig.width/2, y:GameConfig.height/2, scaleX:0.6, scaleY:0.6, alpha:0},
                280, Laya.Ease.backIn, Laya.Handler.create(this, this.destroy,[true]), 0
            );
        }

        /**
         * 关闭并带动画效果
         */
        public closeAndDestroy():void{
            Laya.Tween.to(this, {x:GameConfig.width/2, y:GameConfig.height/2, scaleX:0.6, scaleY:0.6, alpha:0},
                280, Laya.Ease.backIn, Laya.Handler.create(this, this.exit), 0
            );
        }

         /**
         * back to last view
         */
        public goBack():void{
            this.exit();
        }

        /**
         * goto the target view ,must use the goBack to come back
         * @param v new view
         */
        public gotoView(v:laya.display.Node):laya.display.Node{
           return super.addChild(v);
        } 

        public ShowEffect():void{
            this.alpha = 0.1;
            this.scale(0.1,0.1,true);
            Laya.Tween.to(this,{scaleX:1,scaleY:1,alpha:1},300,Laya.Ease["circOut"]);
        }

        /**
         * Add child to view.
         * @param node child
         */
        public addChild(node:laya.display.Node):laya.display.Node{
            if(node instanceof BaseScene){
                throw "Cannot add scene into the dailog.";
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
    } 