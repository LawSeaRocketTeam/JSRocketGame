import { dzapp } from "../../../Main";

//module DZUI{ 
/**
 * 龙骨动画扩展
 */
export default class dzSkeleton extends Laya.Skeleton {
    /** 动画路径 */
    private _aniPath:string;
    /** 完成回调 */
    private _complete:Laya.Handler;
    /** 是否循环播放 */
    private _aniLoop:boolean = true;
    /** 动画播完回调 */
    private _playedout:Laya.Handler;
    /**动画编号/或名字 */
    private _aniIndex:any = 0;

    constructor() {
        super();
        this._aniLoop = true;
    }

    /**
     * 通过加载直接创建动画
     * @param path 要加载的动画文件路径
     * @param complete 加载完成的回调函数
     */
    private loadEx(path:string, complete?:Laya.Handler, aniMode?:number):void {
        (aniMode===void 0)&& (aniMode=0);
		this._aniPath=path;
		this._complete=complete;
		Laya.loader.load([{url:path,type:"arraybuffer"}],Laya.Handler.create(this,this.onLoadedEx));
    }

    private onLoadedEx():void {
        var arraybuffer=Laya.Loader.getRes(this._aniPath);
		if (arraybuffer==null)return;
		if (Laya.Templet.TEMPLET_DICTIONARY==null){
			Laya.Templet.TEMPLET_DICTIONARY={};
		};
		var tFactory;
		tFactory=Laya.Templet.TEMPLET_DICTIONARY[this._aniPath];
		if (tFactory){
			if (tFactory.isParseFail){
				this.parseFailEx();
				}else {
				if (tFactory.isParserComplete){
					this.parseCompleteEx();
					}else {
					tFactory.on(/*laya.events.Event.COMPLETE*/"complete",this,this.parseCompleteEx);
					tFactory.on(/*laya.events.Event.ERROR*/"error",this,this.parseFailEx);
				}
			}
			}else {
			tFactory=new Laya.Templet();
			tFactory._setUrl(this._aniPath);
			Laya.Templet.TEMPLET_DICTIONARY[this._aniPath]=tFactory;
			tFactory.on(/*laya.events.Event.COMPLETE*/"complete",this,this.parseCompleteEx);
			tFactory.on(/*laya.events.Event.ERROR*/"error",this,this.parseFailEx);
			tFactory.isParserComplete=false;
			tFactory.parseData(null,arraybuffer);
		}
    }

    private parseCompleteEx():void {
        var tTemple=Laya.Templet.TEMPLET_DICTIONARY[this._aniPath];
		if (tTemple){
			this.init(tTemple);
            this.visible = true;
			this.play(this._aniIndex,this._aniLoop);
		}
		this._complete && this._complete.runWith(this);
        this._complete = null;
    }

    private parseFailEx():void {
        dzapp.Logger.error("[Error]:"+this._aniPath+"解析失败");
    }

    /**
     * 动画播完回调
     */
    private onPlayedOut():void {
        this.off(Laya.Event.STOPPED, this, this.onPlayedOut);
        this._playedout && this._playedout.runWith(this);
        this._playedout = null;
    }

    /**
     * 播放动画
     * @param aniIndex 要播放的动画编号
     * @param path 要加载的动画文件路径
     * @param loop 是否循环播放
     * @param complete 动画播完回调
     */
    public playExWithIndex(aniIndex:any,path:string, loop?:boolean, complete?:Laya.Handler):void {
        if (typeof loop !== "boolean") loop = true;
        if(aniIndex){
            this._aniIndex = aniIndex;
        }
        this._aniLoop = loop;
        if (!loop && complete) {
            this.on(Laya.Event.STOPPED, this, this.onPlayedOut);
            this._playedout = complete;
        }
        this.load(path);
    }

    /**
     * 播放动画
     * @param path 要加载的动画文件路径
     * @param loop 是否循环播放
     * @param complete 动画播完回调
     */
    public playEx(path:string, loop?:boolean, complete?:Laya.Handler):void {
        if (typeof loop !== "boolean") loop = true;
        this._aniLoop = loop;
        if (!loop && complete) {
            this.on(Laya.Event.STOPPED, this, this.onPlayedOut);
            this._playedout = complete;
        }
        this.load(path);
    }
}
//}