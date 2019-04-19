// import { dzapp } from "../../../Main";
// import Dictionary = DZGame.Dictionary;

// export default class EventDispatch{
//     constructor(){
//         this.mDic = new Dictionary<number,Dictionary<any,Dictionary<string,ListenEntity>>>();
//     }

//     private mDic:Dictionary<number,DZGame.Dictionary<any,Dictionary<string,ListenEntity>>> = null;

//     public Listen(roomId:number,type:string,caller:any,listener:Function):void{
//         let _room:Dictionary<any,Dictionary<string,ListenEntity>> = this.mDic.getItemByKey(roomId);
//         let _item:ListenEntity = new ListenEntity(roomId,caller,type,listener);

//         if(_room){
//             let _cl:Dictionary<string,ListenEntity> = _room.getItemByKey(caller);
//             if(_cl){
//                 _cl.add(type,_item);
//             }else{ 
//                 _cl = new Dictionary<string,ListenEntity>();
//                 _cl.add(type,_item);
//                 _room.add(caller,_cl);
//             }
//         }else{
//             _room = new Dictionary<any,Dictionary<string,ListenEntity>>();
//             let _cl:Dictionary<string,ListenEntity> =new Dictionary<string,ListenEntity>();
//             _cl.add(type,_item);
//             _room.add(roomId,_cl);
//             this.mDic.add(roomId,_room);
//         }
//         dzapp.mLogger.info("Add listen for:"+roomId+":"+type);
//     }

//     public onEvent(roomId:number,type:string,data:any):void{
//         let _room:DZGame.Dictionary<any,DZGame.Dictionary<string,ListenEntity>> = this.mDic.getItemByKey(roomId);
//         if(_room){
//             let _cls:Array<any> = _room.keys();
//             for(let i=0;i<_cls.length;i++){
//                 let _cl:DZGame.Dictionary<string,ListenEntity> = _room.getItemByKey(_cls[i]);
//                 let _lst:ListenEntity = _cl.getItemByKey(type);
//                 _lst && _lst.Listener.runWith(data);
//             }
//         }else{
//             dzapp.mLogger.info("Network event no handler:"+roomId+":"+type);
//         }
//     }

//     public off(roomId:number,type:string,caller:any):void{
//         let _room:DZGame.Dictionary<any,DZGame.Dictionary<string,ListenEntity>> = this.mDic.getItemByKey(roomId);
//         if(_room){
//             let _cl:Dictionary<string,ListenEntity> = _room.getItemByKey(caller);
//             if(_cl){
//                 let _lst = _cl.getItemByKey(type);
//                 _lst && _cl.removeByKey(type);
//             }
//         }
//     }

//     public offAllByType(type:string):void{
//         let _rkeys:Array<number> = this.mDic.keys();
//         for(let i = 0;i<_rkeys.length;i++){
//             let _cls:Dictionary<any,Dictionary<string,ListenEntity>>  = this.mDic.getItemByKey(_rkeys[i]);
//             let _clskeys:Array<any> = _cls.keys();
//             for(let j=0;j<_clskeys.length;j++){
//                 let _cl:Dictionary<string,ListenEntity> = _cls.getItemByKey(_clskeys[j]);
//                 if(_cl.Contain(type)){
//                     _cl.removeByKey(type);
//                 } 
//             }
//         }
//     }
//     public offAllByCaller(caller:any):void{
//         let _rkeys:Array<number> = this.mDic.keys();
//         for(let i = 0;i<_rkeys.length;i++){
//             let _cls:Dictionary<any,Dictionary<string,ListenEntity>>  = this.mDic.getItemByKey(_rkeys[i]);
//             let _cl:Dictionary<string,ListenEntity> = _cls.getItemByKey(caller);
//             if(_cls.Contain(caller)){
//                 _cls.removeByKey(caller);
//             } 
//         }
//     }

//     public offAll():void{
//          this.mDic = new Dictionary<number,Dictionary<any,Dictionary<string,ListenEntity>>>();
//     }
// }
// class ListenEntity{
//     constructor(rid:number,caller:any,type:string,listener:Function){
//         this.mRoomId = rid;
//         this.mCaller = caller;
//         this.mType = type;
//         this.mListener = Laya.Handler.create(caller,listener,null,false);
//     }
//     private mRoomId:number =0;
//     private mCaller:any = null;
//     private mType:string = null;
//     private mListener:Laya.Handler = null; 

//     public get Listener(){
//         return this.mListener;
//     }

//     public get Caller(){
//         return this.mCaller;
//     }
        
// }
