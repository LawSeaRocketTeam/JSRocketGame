
import LocalPlayer from "./dzgames/modes/lobby/LocalPlayer";
import GameConfig from "./GameConfig";
import ToastView from "./dzgames/views/common/ToastView";
import LobbyView from "./dzgames/views/lobby/LobbyView";
import MaskView from "./dzgames/views/common/MaskView";
import { ui } from "./ui/layaMaxUI";
import Logger from "./dzgames/core/logmgr/Logger";
import NetworkMgr from "./dzgames/core/netmgr/NetworkMgr";
import { SoundManager } from "./dzgames/core/soundmgr/SoundManager";
import MainView from "./dzgames/views/common/MainView";
import BaseScene from "./dzgames/components/dzpage/BaseScene";
import BaseView from "./dzgames/components/dzpage/BaseView";
import PreloadView from "./dzgames/views/preload/PreloadView";
import LoadingView from "./dzgames/views/common/LoadingView";
import LobbyData from "./dzgames/modes/lobby/LobbyData";
import ResourceMgr from "./dzgames/core/resmgr/ResourceMgr";
import GameItem from "./dzgames/modes/lobby/GameItem";
import ProgressView from "./dzgames/views/common/ProgressView";
import { dzapp } from "./Main";
import EventDispatch from "./dzgames/core/eventmgr/EventDispatch";




/**
 * brief:game center presenter.
 * Author: wenzuoli
 * Date: 2019/04/08
 */
export default class AppPresenter{
    /**layer control start*/
    private ZORDER_LOADING:number = 11;
    private ZORDER_PROGRESS:number = 10;
    private ZORDER_TOAST:number = 9;
    private ZORDER_MASK:number = 8;
    private ZORDER_MESSAGE:number = 7;
    private ZORDER_LOBBY:number = 0;

    /**layer control end */
    private _enableLoading:boolean = true;
    private _log:Logger = null;
    private _event:EventDispatch=null;
    private _net:NetworkMgr = null;
    private _sound:SoundManager =null; 
    private _player:LocalPlayer=null; 

    private _mainView:Laya.Sprite = null;
    private _lobby:LobbyView = null;
    private _progressView:ProgressView = null;
    private _loadingView:LoadingView = null;

    private _games:Array<GameItem>=null;

     constructor(){
         this.regClass();
        this.moduleInitial();
        //this.gameStart();
    }

    private regClass():void{
       // Laya.ClassUtils.regClass("LanLobby",dzgames.LanLobbyView);
    }

    /**
     * starting game lobby.
     */
    public startGame():void{
       // GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
       let preload:PreloadView = new PreloadView();
       preload.name = "preload";
       this._mainView.addChild(preload);//enter lobby need to remove the preload view.
    }

    /**
     * close all open games and back to lobby.
     */
    public enterLobby():void{
        this.destroyGames();
        let preload = this._mainView.getChildByName("preload");
        if(preload){
            this._mainView.removeChild(preload);
        } 
        if(this._lobby==null){
            this._lobby = new LobbyView();
        }
        this._mainView.addChild(this._lobby);
    }

    /**
     * 
     * @param scene the main scene of the game you need to open.
     * @param res the new game resource list:system will help you load the resource list and management.
     */
    // public openGame2(url:string,res:Array<string>):void{
    //     let clas:any = Laya.ClassUtils.getClass(url);
    //     let scene:any = null;
    //     if(clas){
    //         scene = new clas();
    //     }
    //     if(scene==null){
    //         this.mLogger.error("can't find scene.");
    //         return;
    //     }

    //     if(res==null||res.length<1){
    //         this.mLogger.warn("system will open the new scene but no load any resource. pls confirm.");
    //     }
    //     this.showLoading();
    //     this.destroyGames();
    //     this._games.push(new GameItem(scene.mSceneKey,res,scene));
    //     let _completed:Laya.Handler = Laya.Handler.create(this,this.openNewScene,[scene.mSceneKey]);
    //     let _progress:Laya.Handler = Laya.Handler.create(this,this.showProgress,null,false);
    //     ResourceMgr.loadRes(res,_completed,_progress,null,0,true,scene.mSceneKey);
    // }

    /**
     * 
     * @param scene the main scene of the game you need to open.
     * @param res the new game resource list:system will help you load the resource list and management.
     */
    public openGame(scene:BaseScene,res:Array<string>):void{
        if(scene==null){
            this.Logger.error("error calling. the scene is null.");
            return;
        }
        if(res==null||res.length<1){
            this.Logger.warn("system will open the new scene but no load any resource. pls confirm.");
        }
        this.showLoading();
        this.destroyGames();
        this._games.push(new GameItem(scene.mSceneKey,res,scene));
        let _completed:Laya.Handler = Laya.Handler.create(this,this.openNewScene,[scene.mSceneKey]);
        let _progress:Laya.Handler = Laya.Handler.create(this,this.showProgress,null,false);
        ResourceMgr.loadRes(res,_completed,_progress,null,0,true,scene.mSceneKey);
    }

    /**
     * destroy current games.
     */
    private destroyGames():void{
        let len:number = this._games.length;
        while(len>0){
            let _tem:GameItem = this._games.pop();
            this._mainView.removeChild(_tem.mGameView);
            _tem.mGameView.exitAndDestroy();
            ResourceMgr.clearResByGroup(_tem.mGameKey);
            _tem = null;
            len = this._games.length;
        }
    }

    /**
     * open scene for new game.
     * @param args game key
     */
    private openNewScene(key:string):void{
        let view:BaseScene = null;
        for(let i=0;i<this._games.length;i++){
            if(this._games[i].mGameKey==key){
                view = this._games[i].mGameView;break;
            }
        }
        if(view){
            this._mainView.addChild(view);
            let node:laya.display.Node = this._mainView.removeChild(this._lobby);
            this._lobby = null;
            node.destroy(true);
            this.hideLoading();
        }else{
            this.showToast("Can't find scene.");
        }
    }
 
 
    /**
     * initial relative modules.
     */
    private moduleInitial():void{
        this._mainView = Laya.Scene.root;
        this._games = new Array<GameItem>();
        this._player = new LocalPlayer();
        this._event = new EventDispatch();
        this._log = new Logger();
        let _onconnected:Laya.Handler = Laya.Handler.create(this,this.onConnected); 
        let _onConnectFailed:Laya.Handler = Laya.Handler.create(this,this.onConnectFailed);
        let _onSendMsgFailed:Laya.Handler = Laya.Handler.create(this,this.onSendMsgFailed,null,false);
        this._net = new NetworkMgr(_onconnected,_onConnectFailed,_onSendMsgFailed);
        this._sound = new SoundManager();
    }

    public get Net(){
        return this._net;
    }
 
    /**Sound manager */
    public get Sound(){
        return this._sound;
    }

    /**
     * event dispatch module.
     */
    public get Events(){
        return this._event;
    }
    /**
     * Logger module
     */
    public get Logger(){
        return this._log;
    }
    /**
     * game player data
     */
    public get Player(){
        if(this._player==null){
            this._player = new LocalPlayer();
        }
        return this._player;
    }

    /**
     * switch the loading status.
     * true: enable show loading view. show loading view when system in loading res.
     * false: hide the loading view when system in loading.
     */
    public set enableLoading(enable:boolean){
        this._enableLoading = enable;
    }
    
    /**
     * show toast message.
     * @param msg message string
     */
    public showToast(msg:string):void{
        let toast:ToastView = new ToastView(msg);
        toast.zOrder=this.ZORDER_TOAST;
        Laya.Scene.root.addChild(toast);
    }

    /**
     * Show message window
     * @param message display message
     * @param okCallback ok callback    
     * @param cancelCallback cancel callback    
     */
    public showMsg(message:string,okCallback?:Laya.Handler,cancelCallback?:Laya.Handler):void{
        //TODO:wenzuoli
        if(confirm(message)){
            okCallback&&okCallback.run();
        }else{
            cancelCallback&&cancelCallback.run();
        }
    }

    /**
     * Show mask for disable any touch/click event.
     */
    public showMask():void{
        let mask:MaskView = new MaskView();
        mask.zOrder=this.ZORDER_MASK;
        Laya.Scene.root.addChild(mask);
    }


    /**
     * hide the loading view.
     */
    public hideLoading():void{
        if(this._enableLoading&&this._loadingView){
            let node:any = this._mainView.removeChild(this._loadingView);
            this._loadingView = null;
            node.destroy(true);
        }
    }

    /**
     * show loading view. use for transition or switching the scenes
     */
    public showLoading():void{
        if(this._enableLoading){
            if(!this._loadingView){
                this._loadingView = new LoadingView();
                this._loadingView.zOrder = this.ZORDER_LOADING;
                this._mainView.addChild(this._loadingView);
            }
        }
    }

    /**
     * show loading progress.
     * @param val progress for loading
     */
    public showProgress(val:number):void{
        if(!this._progressView){
            this._progressView = new ProgressView();
            this._progressView.zOrder = this.ZORDER_PROGRESS;
            this._mainView.addChild(this._progressView);
        }
        if(!this._progressView.visible){
            this._progressView.visible = true;
        }
        if(val==1){
            this._progressView.visible = false;
        }else{
            this._progressView.progressChange(val); 
        }   
    }

    public showLoginPanel():void{
        dzapp.Logger.warn("function 'showLoginPanel' not implemented.")
    }

    /**
     * connect to forward result.
     * @param data received data
     */
    public onConnected(data):void{
        //connect to forward success.
        LobbyData.init();
    }

    /**
     * connect to forward result.
     * @param data received data
     */
    public onConnectFailed(data):void{
        //connect to forward success.
        this.showToast("Connect to server failed.");
    }

    private onSendMsgFailed():void{
        this.showToast("Message send failed.");
    }

    /**
     * play sound
     * @param url path
     * @param loops loops,optional
     * @param complete callback
     */
    public playerSoundEffect(url: string, loops?: number, complete?:Laya.Handler):void{
        this._sound.playSound(url,loops,complete);  
    }
}