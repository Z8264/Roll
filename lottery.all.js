/**
 *
 */
class Roll {
  constructor(selector, options) {
    if (!selector) return;
    /**
     * dom 对象
     */
    this.el = document.querySelector(selector);
    this.ul = this.el.querySelector("ul");
    this.li = this.ul.querySelector("li");
    /**
     * 合并默认配置
     */
    options = Object.assign(
      {
        speed: 1, // 默认移动速度
        direction: "horizontal", // horizontal vertical
        autoStart: true
      },
      options
    );
    this.options = options;
    /**
     * 抽奖数量
     */
    this.length = this.ul.querySelectorAll("li").length;
    /**
     * 方向
     */
    this.direction = options.direction;
    /**
     * 自动运动
     */
    this.autoStart = options.autoStart;
    /**
     * 当前运行速度
     * (60FPS)移动的单元格个数
     */
    this.speed = 0;
    /**
     * 默认移动速度
     * 不能将默认速度设置为0
     */
    this._speed = options.speed || 1;
    /**
     * 容器距离
     * @private
     */
    this._contentDistance = 0;
    /**
     * 每个子项(li)距离
     * @private
     */
    this._itemDistance = 0;
    /**
     * 能够偏移的最大距离
     * @private
     */
    this._maxDistance = 0;
    /**
     * 初始偏移量
     * @private
     */
    this._startOffset = 0;
    /**
     * 偏移量
     * 用于处理offset值
     * @private
     */
    this._offset = 0;
    /**
     * 记录当前移动的距离
     * @private
     */
    this._distance = 0;
    /**
     * 前一帧的时间戳
     */
    this._lastTime = performance.now();
    /**
     * 全局运行状态
     * @private
     */
    this._running = false;
    this._stopping = false;
    this._destroyed = false;

    this._speedListener = () => false;
    this._stopListener = () => false;

    // 渲染动画
    this.loop = () => {
      if (this._running) {
        let delta = (performance.now() - this._lastTime) * 0.06;

        this._speedListener(delta);
        if (this.speed <= 0 || this._stopListener(delta)) {
          this._drawing = false;
          this.stop();
          return;
        }

        let dist = ((this.speed * this._itemDistance) / 60) * delta;
        this.offset += dist;
        this._distance += dist;
        this._render();

        this._lastTime = performance.now();

        requestAnimationFrame(this.loop);
      }
    };

    this._init();

    if (this.autoStart) {
      this.start();
    }
  }

  /**
   * 初始化组建
   * @private
   */
  _init() {
    if (this.direction === "vertical") {
      this._contentDistance = this.el.offsetHeight;
      this._itemDistance = this.li.offsetHeight;
      this._maxDistance = this.length * this._itemDistance;
    } else {
      this._contentDistance = this.el.offsetWidth;
      this._itemDistance = this.li.offsetWidth;
      this._maxDistance = this.length * this._itemDistance;
    }

    this._startOffset =
      this._contentDistance / 2 - this._itemDistance / 2 - this._maxDistance;

    const html = this.ul.innerHTML;
    this.ul.innerHTML = html + html + html;

    this._render();
  }

  /**
   * 渲染dom
   * @private
   */
  _render() {
    const offset = this._startOffset - this.offset;
    if (this.direction === `vertical`) {
      this.ul.style.transform = `translate3d(0, ${offset}px, 0)`;
    } else {
      this.ul.style.transform = `translate3d(${offset}px, 0, 0)`;
    }
  }

  /**
   * offset get
   */
  get offset() {
    return this._offset;
  }

  /**
   * offset set
   */
  set offset(value) {
    this._offset =
      value > this._maxDistance ? value % this._maxDistance : value;
    return this._offset;
  }

  /**
   * 开始
   * @param {Function} cb
   */
  start() {
    if (!this._running) {
      this.speed = this._speed;
      this._running = true;
      this._lastTime = performance.now();
      requestAnimationFrame(this.loop);
    }
    return this;
  }

  /**
   * 停止
   * @param {Function} cb
   */
  stop() {
    if (this._drawing) return;
    if (this._running) {
      this.speed = 0;
      this._running = false;
      this._stopping = false;
      this._drawing = false;
      this._speedChange = () => false;
      this._stopListener = () => false;
    }
    return this;
  }

  /**
   * 停在指定位置
   * 如果参数为空，则直接执行stop方法
   * @param {Number} index
   */
  stopAt(index, cb = () => {}, hard = false) {
    if (!this._running || this._stopping) return;
    if (this._drawing && !hard) return;
    this._stopping = true;
    if (index !== undefined) {
      const targetOffset = index * this._itemDistance;
      const minDistance =
        this.offset > targetOffset ? this._maxDistance - this.offset : 0;
      this._distance = 0;
      this._stopListener = delta => {
        if (
          this._distance >= minDistance &&
          this.offset >= index * this._itemDistance
        ) {
          this.offset = index * this._itemDistance;
          this._render();
          cb();
          return true;
        }
        return false;
      };
    } else {
      this.stop();
    }
  }

  /**
   * 改变速度
   * @param {Number} speed 速度
   * @param {Number} time 时间 (s)
   * @param {Function} cb 回调函数
   */
  speedTo(speed, time = 0, cb = () => {}, hard = false) {
    if (speed == undefined) return;
    if (this._drawing && !hard) return;
    if (!this._running) this.start();
    const a = time == 0 ? 0 : (speed - this.speed) / time / 60;
    if (a == 0) {
      this.speed = speed;
      cb();
    } else {
      this._speedListener = delta => {
        this.speed += a * delta;
        if ((a > 0 && this.speed >= speed) || (a < 0 && this.speed <= speed)) {
          this.speed = speed;
          this._speedListener = () => {};
          cb();
        }
      };
    }
  }
  /**
   * 抽奖
   * @param {Number} index  中奖索引
   * @param {*} cb 回调函数
   */
  draw(index = Math.floor(Math.random() * this.length), cb = () => {}) {
    if (this._drawing) return;
    this._drawing = true;
    if (!this._running) this.start();
    this.speedTo(
      10,
      3,
      () => {
        this.speedTo(
          3,
          2,
          () => {
            this.stopAt(index, cb, true);
          },
          true
        );
      },
      true
    );
  }

  /**
   * 注销
   */
  destory() {
    this.stop();
    this.loop = null;
    this.el = null;
    this.ul = null;
    this.li = null;
  }
}
