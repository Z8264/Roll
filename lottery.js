function Lottery(id) {
  this.cont = document.getElementById(id);
  this.el = this.cont.querySelector("ul");
  this.lis = this.cont.querySelectorAll("li");
  this.contWidth = parseInt(
    getComputedStyle(this.cont).width.replace("px", "")
  );
  this.length = this.lis.length;
  this.itemWidth = parseInt(
    getComputedStyle(this.el.querySelector("li")).width.replace("px", "")
  );
  this.width = this.length * this.itemWidth; // 横轴偏移量
  this.offset = 0; // 偏移量
  this.ani = null; // setInterval

  this.speed = 0; // 速度：单位时间内移动的单元格数量
  this.ismoving = false; //移动状态
  this.isdrawing = false; //抽奖状态

  this.FPS = 30; // 帧数

  this.distance = 0; // 滚动距离

  this._init();
}
Lottery.prototype._init = function() {
  let html = this.el.innerHTML;
  this.el.innerHTML = html + html;
};
/**
 * 开始移动
 * @param {Number} speed  速度
 * @param {Number} distance 限制移动的距离
 */
Lottery.prototype.start = function(speed = 1, distance) {
  if (this.ani) clearInterval(this.ani);

  if (distance !== undefined) {
    this.distance = this.offset;
  }

  this.ani = setInterval(() => {
    this.speed = speed;

    if (distance !== undefined) {
      if (this.distance >= distance) {
        this._setOffset(distance);
        this.stop(true);
      }
    }

    this._increase((this.itemWidth / this.FPS) * this.speed);
  }, 1000 / this.FPS);
};
/**
 * 停止移动
 * @param {} slow 默认为false，立刻停止。如果为true，则缓慢停止。
 */
Lottery.prototype.stop = function(slow = false) {
  if (!this.ani) return;

  clearInterval(this.ani);

  this.distance = 0;

  if (slow) {
    let offset = this.offset;
    this.ani = setInterval(() => {
      this.speed = 2;

      if (this.distance >= this.itemWidth * 2) {
        //立即停在中间
        this._setOffset(offset + this.itemWidth * 2);
        this.stop();
      }
      this._increase((this.itemWidth / this.FPS) * this.speed);
    }, 1000 / this.FPS);
  } else {
    this.ani = null;
    this.speed = 0;
  }
};

Lottery.prototype.draw = function(index = 0) {
  if (this.drawing) return;
  if (this.ani) {
    clearInterval(this.ani);
  }

  let distance = this.width * 5 + (index - 4) * this.itemWidth;
  this.start(10, distance);
};

Lottery.prototype._increase = function(value) {
  this.offset += value;
  this.distance += value;
  if (this.offset >= this.width) {
    this.offset -= this.width;
  }
  this.el.style = `transform:translateX(-${this.offset}px)`;
};
Lottery.prototype._setOffset = function(value) {
  this.offset = value % this.width;
  this.el.style = `transform:translateX(-${this.offset}px)`;
};
