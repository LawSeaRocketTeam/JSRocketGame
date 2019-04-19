/*[COMPILER OPTIONS:ForcedCompile]*/
 /**
 * brief:common button
 * Author: wenzuoli
 * Date: 2018/06/22
 */
import Button = Laya.Button;  
module component { 
    /**
     * common button
     */
    export class ComButton extends Button { 
        public mSoundPath:string=""; 
        /**按钮说明 */
        public description:string;
        /**是否启用发送日志 */
        public enableLog:boolean;
        constructor(skin:string=null,label:string=""){
            super(skin, label);  
            this.initSound();
            this.on(Laya.Event.MOUSE_UP,this,this.onMouseUp);
            this.on(Laya.Event.MOUSE_OVER,this,this.onMouseOver); 
            this.on(Laya.Event.MOUSE_OUT,this,this.onMouseOut);
            
            // this.on(Laya.Event.MOUSE_MOVE,this,this.changeBg,[1.05]);
            // this.on(Laya.Event.MOUSE_OUT,this,this.changeBg,[1.0]);
        }

        /**
         * on mouse over
         */
        private onMouseOver():void{
            Laya.Mouse.cursor="pointer";
        }

        /**
         * on mouse out
         */
        private onMouseOut():void{
            Laya.Mouse.cursor="default";
        }

        /**
         * on mouse up
         */
        private onMouseUp():void{
            this.playerSoundEffect(); 
            // if(this.enableLog&&this.enableLog==true){
            //     let flag:string = this.description==void 0?"":this.description;
            //     bestapp.EventLog.PressButton(this.getButtonId(),this.description);
            // }
            laya.utils.Mouse.cursor = "pointer";
        }

        private getButtonId():string{
            // let parent:View = this.findParent(this);
            // if(parent!=null){
            //     return parent.name.concat("_").concat(this.name);
            // }
            return this.name;
        }

        private findParent(ele:any):any{
            // if(ele==null){
            //     return null;
            // }
            // if(ele.parent!=null&&ele.parent instanceof View){
            //     return ele.parent;
            // }
            // return this.findParent(ele.parent);
        }

        private changeBg(sc:number):void{
            this.scale(sc,sc,true);
        }

        /**
         * initial the button click sound path.
         */
        private initSound():void{
            try{
                // this.mSoundPath = cconfig.DDZSound.NORMAL_CLICK;
            }catch(err){
                console.log("init button sound faild.");
            }
        }

        /**
         * setup the sound path.
         * @param url sound path
         */
        public setSoundPath(url:string):void{
            this.mSoundPath = url;
        }
        
        /**
         * play sound effect 
         */
        private playerSoundEffect():void{
            // try{ 
            //     this.onMouseOut();
            //     if(theApp&&theApp.playerSoundEffect&&this.mSoundPath.length>0){
            //         theApp.playerSoundEffect(this.mSoundPath);
            //     } 
            // }catch(err){
            //     console.log("play sound effect exception,will call laya.soundManager to play sound");
            //     if(this.mSoundPath.length>0){
            //          Laya.SoundManager.playSound(this.mSoundPath);
            //     } 
            // }
        }
    }
}