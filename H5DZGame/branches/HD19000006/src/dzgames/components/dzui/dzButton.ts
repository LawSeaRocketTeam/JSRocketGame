 

 /*[COMPILER OPTIONS:ForcedCompile]*/
export default class dzButton extends Laya.Button{
        /**button description */
        public description:string;
        /**sound */
        public mSoundPath:string=""; 

        constructor(){
            super();
            this.initSound();
            this.on(Laya.Event.MOUSE_UP,this,this.onMouseUp);
            this.on(Laya.Event.MOUSE_OVER,this,this.onMouseOver); 
            this.on(Laya.Event.MOUSE_OUT,this,this.onMouseOut);
        }

        public on(type:string,caller:any,listener:Function,args?:any[]):laya.events.EventDispatcher{
            return super.on(type,caller,listener,args);
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
            // if(UserConfig.enableEventLog){
            //     let flag:string = this.description==void 0?"":this.description;
            //     EventLog.PressButton(this.getButtonId(),this.description);
            // }
            laya.utils.Mouse.cursor = "pointer";
        }

        private getButtonId():string{
            let parent:Laya.View = this.findParent(this);
            if(parent!=null){
                return parent.name.concat("_").concat(this.name);
            }
            return this.name;
        }

        private findParent(ele:any):any{
            if(ele==null){
                return null;
            }
            if(ele.parent!=null&&ele.parent instanceof Laya.View){
                return ele.parent;
            }
            return this.findParent(ele.parent);
        }

        /**
         * initial the button click sound path.
         */
        private initSound():void{
           //this.mSoundPath = BaseSound.NormalClick;
        }

        /**
         * play sound effect 
         */
        private playerSoundEffect():void{
            // try{ 
            //     this.onMouseOut();
            //     if(dzapp&&dzapp.playerSoundEffect&&this.mSoundPath.length>0){
            //         dzapp.playerSoundEffect(this.mSoundPath);
            //     } 
            // }catch(err){
            //     dzapp.mLogger.error("play sound effect exception,will call laya.soundManager to play sound");
            //     if(this.mSoundPath.length>0){
            //          Laya.SoundManager.playSound(this.mSoundPath);
            //     } 
            // }
        }
}
//}