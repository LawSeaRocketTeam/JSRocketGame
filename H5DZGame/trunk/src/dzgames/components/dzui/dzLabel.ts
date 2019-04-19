import GameVerify from "../../utils/common";
import Label =Laya.Label;
module DZUI{ 
/**
     * Laya.Label控件
     */
    export class dzLabel extends Label {
        constructor(text?:string) {
            super();
            this.text = text||""; 
        
        }
        public get y() { return this._y; }
        public set y(_value:number) { 
            this._y = this.adjustY()==true?_value+8:_value;
        }
        public pos(x:number,y:number,speedMode:boolean):any{
            (speedMode===void 0)&& (speedMode=false);
            if (this._x!==x || this._y!==y) {
                if (this.destroyed)return this;
                let offset:boolean = this.adjustY();
                if (speedMode) {
                    super.pos(x,offset==true?y+5:y,speedMode);
                } else {
                    this.x=x;
                    this.y=offset==true?y+5:y;
                }
            }
            return this;
        }

        /**
         * 适配Y轴偏移
         */
        adjustY:Function = () => {
            let _ret:boolean = false;
            if (GameVerify.isMiniProgramMode()) {
                _ret = true;
            } else if (Laya.Browser.onFirefox) {
                _ret = true;
            } else {
                let navi = Laya.Browser.window.navigator;
                if (navi) {
                    let uagent:string = navi.userAgent.toString().toLowerCase();
                    let vendor:string = navi.vendor.toString().toLowerCase();
                    if (vendor.indexOf("google") > -1) {
                        let _num:number = uagent.indexOf("chrome");
                        let _tmp:string = uagent.slice(_num, uagent.indexOf(".", _num));
                        let _ver = Number(_tmp.slice(_tmp.indexOf("/")+1, _tmp.length));
                        if (typeof _ver === "number") {
                            if (71 <= _ver) {
                                _ret = true;
                            }
                        }
                    }
                }
            }
            return _ret;
        }
    }
}