
import { dzapp } from "../../../Main"; 
import Dictionary from "../../components/extend/Dictionary";
/**
 * @description 事件监听与派发
 * @author wenzuoli
 * @date: 04/18/2019
 */
export default class EventDispatch{
    constructor(){
        this.mDic = new Dictionary<number,Dictionary<any,Dictionary<string,ListenEntity>>>();
    }

    private mDic:Dictionary<number,Dictionary<any,Dictionary<string,ListenEntity>>> = null;

    /**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知。
     * @param roomId 服务器ID 由你连接的游戏确定
     * @param type 事件类型 如 “CLICK” 之类 参考 Laya.Event.CLICK
     * @param caller 事件侦听函数的执行域
     * @param listener 事件侦听函数
     */
    public Listen(roomId:number,type:string,caller:any,listener:Function):void{
        let _room:Dictionary<any,Dictionary<string,ListenEntity>> = this.mDic.getItemByKey(roomId);
        let _item:ListenEntity = new ListenEntity(roomId,caller,type,listener);

        if(_room){
            let _cl:Dictionary<string,ListenEntity> = _room.getItemByKey(caller);
            if(_cl){
                _cl.add(type,_item);
            }else{ 
                _cl = new Dictionary<string,ListenEntity>();
                _cl.add(type,_item);
                _room.add(caller,_cl);
            }
        }else{
            _room = new Dictionary<any,Dictionary<string,ListenEntity>>();
            let _cl:Dictionary<string,ListenEntity> =new Dictionary<string,ListenEntity>();
            _cl.add(type,_item);
            _room.add(roomId,_cl);
            this.mDic.add(roomId,_room);
        }
        dzapp.Logger.info("Add listen for:"+roomId+":"+type);
    }

    /**
     * 派发事件
     * @param roomId 服务器ID 由你连接的游戏确定
     * @param type 事件类型 如 “CLICK” 之类 参考 Laya.Event.CLICK
     * @param data （可选）回调数据。<b>注意：</b>如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p ，且 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
     */
    public Event(roomId:number,type:string,data?:any):void{
        let _room:Dictionary<any,Dictionary<string,ListenEntity>> = this.mDic.getItemByKey(roomId);
        if(_room){
            let _cls:Array<any> = _room.keys();
            for(let i=0;i<_cls.length;i++){
                let _cl:Dictionary<string,ListenEntity> = _room.getItemByKey(_cls[i]);
                let _lst:ListenEntity = _cl.getItemByKey(type);
                if(_lst){
                    _lst.Listener.runWith(data);
                }else{
                    dzapp.Logger.warn("Network event no handler:"+roomId+":"+type);
                }
            }
        }else{
            dzapp.Logger.warn("Network event no handler:"+roomId+":"+type);
        }
    }

    /**
     * 从 EventDispatcher 对象中删除侦听器。
     * @param roomId 要删除哪个服务器的监听器
     * @param type 要删除的事件类型
     * @param caller 要删除的函数的执行域
     */
    public off(roomId:number,type:string,caller:any):void{
        let _room:Dictionary<any,Dictionary<string,ListenEntity>> = this.mDic.getItemByKey(roomId);
        if(_room){
            let _cl:Dictionary<string,ListenEntity> = _room.getItemByKey(caller);
            if(_cl){
                let _lst = _cl.getItemByKey(type);
                _lst && _cl.removeByKey(type);
            }
        }
    }

    /**
     * 根据事件类删除事件监听
     * @param type 要删除的事件类型
     */
    public offAllByType(type:string):void{
        let _rkeys:Array<number> = this.mDic.keys();
        for(let i = 0;i<_rkeys.length;i++){
            let _cls:Dictionary<any,Dictionary<string,ListenEntity>>  = this.mDic.getItemByKey(_rkeys[i]);
            let _clskeys:Array<any> = _cls.keys();
            for(let j=0;j<_clskeys.length;j++){
                let _cl:Dictionary<string,ListenEntity> = _cls.getItemByKey(_clskeys[j]);
                if(_cl.Contain(type)){
                    _cl.removeByKey(type);
                } 
            }
        }
    }

    /**
     * 根据执行域删除所有监听
     * @param caller 执行域
     */
    public offAllByCaller(caller:any):void{
        let _rkeys:Array<number> = this.mDic.keys();
        for(let i = 0;i<_rkeys.length;i++){
            let _cls:Dictionary<any,Dictionary<string,ListenEntity>>  = this.mDic.getItemByKey(_rkeys[i]);
            let _cl:Dictionary<string,ListenEntity> = _cls.getItemByKey(caller);
            if(_cls.Contain(caller)){
                _cls.removeByKey(caller);
            } 
        }
    }

    /**
     * 删除所有监听
     */
    public offAll():void{
         this.mDic = new Dictionary<number,Dictionary<any,Dictionary<string,ListenEntity>>>();
    }
}
export class ListenEntity{
    constructor(rid:number,caller:any,type:string,listener:Function){
        this.mRoomId = rid;
        this.mCaller = caller;
        this.mType = type;
        this.mListener = Laya.Handler.create(caller,listener,null,false);
    }
    private mRoomId:number =0;
    private mCaller:any = null;
    private mType:string = null;
    private mListener:Laya.Handler = null; 

    public get Listener(){
        return this.mListener;
    }

    public get Caller(){
        return this.mCaller;
    }
        
}
