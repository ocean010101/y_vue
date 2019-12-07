
class YVue {
  constructor(options) {

    this.$options = options; // $ 与外部变区分
    this.$data = options.data;

    this.observer(this.$data);
  }
  //使传递进来的数据响应化
  observer(value) {
    if (!value || typeof value !== 'object') {
      return;
    }
    Object.keys(value).forEach(key => {
      //对key做响应式处理
      this.defineReactive(value, key, value[key])
      //app.$data.test ==> app.test 代理
      this.proxyData(key);
    })
  }
  //3 代理到vm
  proxyData(key) {
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newVal) {
        this.$data[key] = newVal;
      }
    })
  }
  defineReactive(obj, key, val) {
    //2. 递归给所有属性添加getter/setter
    this.observer(val);
    Object.defineProperty(obj, key, {
      get: function () {
        return val;
      },
      set: function (newVal) {
        if (newVal != val) {
          val = newVal;
          console.log(`${key} 属性更新了`);
        }
      }
    })
  }

}