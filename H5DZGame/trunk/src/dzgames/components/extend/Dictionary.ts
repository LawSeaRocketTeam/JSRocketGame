/**
 * @description Dictionary module.
 * @author wenzuoli
 * @date 2019/4/16
*/
export default class Dictionary<K,T>{
    constructor(){ 
        this.elements = new Array();
    }
    private elements:Array<any>=null;
    
    /**Length of Dictionary*/
    public get length(){
        return this.elements.length;
    }

    /**Check whether the Dictionary is empty*/
    public get isEmpty () {
        return this.elements.length<1;
    };
    /**remove all elements from the Dictionary*/
    public removeAll() {
        this.elements = new Array();
    };
    /**get specify element of the dictionary*/
    public getItemByIndex(index:number):T {
        let rlt:T = null;
        if (index >= 0 && index < this.elements.length) {
            rlt = this.elements[index];
        }
        return rlt;
    }
    /**check whether the Dictionary contains this key*/
    public Contain(key:K) {
        let rlt = false;
        try {
            for (let i = 0, iLen = this.length; i < iLen; i++) {
                if (this.elements[i].key == key) {
                    rlt = true;
                    break;
                }
            }
        }
        catch (ex) {
        }
        return rlt;
    };
    /**check whether the Dictionary contains this value*/
    public containsValue(value:T):boolean {
        let rlt:boolean = false;
        try {
            for (var i = 0, iLen = this.length; i < iLen; i++) {
                if (this.elements[i].value == value) {
                    rlt = true;
                    break;
                }
            }
        }
        catch (ex) {
        }
        return rlt;
    };
    /**remove this key from the Dictionary*/
    public removeByKey(key:K):boolean {
        let rlt:boolean = false;
        try {
            for (var i = 0, iLen = this.length; i < iLen; i++) {
                if (this.elements[i].key == key) {
                    this.elements.splice(i, 1);
                    rlt = true;
                    break;
                }
            }
        }
        catch (ex) {
        }
        return rlt;
    };
    /**add this key/value to the Dictionary,if key is exists,replace the value*/
    public add(key:K, value:T) {
        if(this.Contain(key)){
            throw "can't add same key into the dictionary.";
            return;
        } 
        this.elements.push({
            key: key,
            value: value
        });
    };

    private setValue(key:K,val:T):void{
        let item:T = this.getItemByKey(key);
        item = val;
    }
    /**add this key/value to the Dictionary,if key is exists then recover*/
    public set(key:K, value:T) {
        if(this.Contain(key)){
            this.setValue(key,value);
        }else{
            this.elements.push(key,value);
        }
    }
    /**get value of the key*/
    public getItemByKey(key:K):T {
        let rlt:T = null;
        try {
            for (var i = 0, iLen = this.length; i < iLen; i++) {
                if (this.elements[i].key == key) {
                    rlt = this.elements[i].value;
                    break;
                }
            }
        }
        catch (ex) {
        }
        return rlt;
    };
    /**get all keys of the dictionary*/
    public keys():Array<K> {
        var arr:Array<K> = [];
        for (var i = 0, iLen = this.length; i < iLen; i++) {
            arr.push(this.elements[i].key);
        }
        return arr;
    }
    /**get all values of the dictionary*/
    public values():Array<T> {
        var arr:Array<T> = [];
        for (var i = 0, iLen = this.length; i < iLen; i++) {
            arr.push(this.elements[i].value);
        }
        return arr;
    }
}