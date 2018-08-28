/**
 *
 */
export default class Lottery {
  constructor(el, options) {
    this.el = null;
    /**
     * 方向
     */
    this.direction = "";
    /**
     * 自动运动
     */
    this.autoStart = true;

    this._offset = 0;

    this.speed = 0;
    this.distance = 0;

    // 如果设置了自动移动，则进行
    if (this.autoStart) {
      this.start();
    }

    this.loop = () =>{
      
    }
  }

  get offset(){
    return this._offset;
  }
  set offset(value){
    
  }
  /**
   * 动画开始
   * @param {*} time 
   */
  start(time) {}

  stop() {}

  moveTo(index, time) {}

  destory() {}
}
