module dz.customUI
{
    export class ScaleButton extends Laya.Button{
         
        //缩放时间，单位为
        private scaleTime:number = 100;
        constructor(skin:string=null,label:string=""){
            super(skin, label);
            //设置按钮默认为单态按钮。
            this.stateNum = 1;
            //添加鼠标按下事件侦听。按时时缩小按钮。
            this.on(Laya.Event.MOUSE_DOWN, this, this.scaleSmall);
            //添加鼠标抬起事件侦听。抬起时还原按钮。
            this.on(Laya.Event.MOUSE_UP, this, this.scaleBig);
            //添加鼠标离开事件侦听。离开时还原按钮。
            this.on(Laya.Event.MOUSE_OUT, this, this.scaleBig);
        }
        private  scaleSmall():void{
         Laya.Tween.to(this, {scaleX:0.8, scaleY: 0.8}, this.scaleTime);
        }
        private  scaleBig():void{
         Laya.Tween.to(this, {scaleX:1, scaleY:1}, this.scaleTime);
        }
    }
}