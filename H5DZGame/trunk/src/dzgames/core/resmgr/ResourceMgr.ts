/**
 * @brief : resource manager module.
 * @Author: Wenzuoli
 * @Date: 2019/04/09
 */ 
export default class ResourceMgr extends Laya.LoaderManager{
    private static groupRes:Laya.WeakObject=null;
    
    /**
     * 加载资源 允许：ResourceMgr.load(...).load(...)... 连接调用
     * @param url single resource url or url array。e.g.：["a.png","b.png"]；
     * @param complete	加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
     * @param progress	加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
     * @param type		资源类型。比如：Loader.IMAGE。
     * @param priority	(default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
     * @param cache		是否缓存加载结果。
     * @param group		分组，方便对资源进行管理。
     * @param ignoreCache	是否忽略缓存，强制重新加载。
     * @param useWorkerLoader(default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
     */
    public static loadRes(url:any,completed?:Laya.Handler,progress?:Laya.Handler,type?:string,priority?:number,cache?:boolean,group?:string,ignoreCache?:boolean,useWorkerLoader?:boolean):Laya.LoaderManager{
       //TODO:wenzuoli for laya library can't clear the res by group, so take a temp solution to management the resource.
        if(this.groupRes == null){
            this.groupRes = new Laya.WeakObject()
        }
        if(group&&group.length>0){
            this.groupRes.set(group,url);
        }
        return Laya.loader.load(url,completed,progress,type,priority,cache,group,ignoreCache,useWorkerLoader);
     } 

     /**
       * 清理指定资源地址缓存。
       * @param	url 资源地址。
      */
     public static clearRes(url:string):void{
        Laya.loader.clearRes(url);
     }

    /**
     * clear resource by group name。
     * @param group 分组名
     */
     public static clearResByGroup(groupName:string):void{
        Laya.loader.clearResByGroup(groupName);
        //TODO:wenzuoli . because the laya library clear by gorup has some question.e.g. can't clear. will check later.
        let resList:any = this.groupRes.get(groupName);
        if(resList){
            for(let i=0;i<resList.length;i++){
                if(resList[i] instanceof String){
                    this.clearRes(resList[i]);
                }else{
                    resList[i].url&&this.clearRes(resList[i].url);
                }
                
            }
        }
     }

     /**
     * 销毁Texture使用的图片资源，保留texture壳，如果下次渲染的时候，发现texture使用的图片资源不存在，则会自动恢复
     * 相比clearRes，clearTextureRes只是清理texture里面使用的图片资源，并不销毁texture，再次使用到的时候会自动恢复图片资源
     * 而clearRes会彻底销毁texture，导致不能再使用；clearTextureRes能确保立即销毁图片资源，并且不用担心销毁错误，clearRes则采用引用计数方式销毁
     * 【注意】如果图片本身在自动合集里面（默认图片小于512*512），内存是不能被销毁的，此图片被大图合集管理器管理
     * @param	url	图集地址或者texture地址，比如 Loader.clearTextureRes("res/atlas/comp.atlas"); Loader.clearTextureRes("hall/bg.jpg");
     */
     public static clearTextureRes(url:string):void{
        Laya.loader.clearTextureRes(url);
     }

     /**
     * 获取指定资源地址的资源。
     * @param	url 资源地址。
     * @return	返回资源。
     */
     public static getRes(url:string):any{
         return Laya.loader.getRes(url);
     }
     
}