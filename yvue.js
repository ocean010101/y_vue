
class YVue {
  constructor(options) {

    this.$options = options; // $ 与外部变区分
    this.$data = options.data;

    this.observer(this.$data);

    //测试代码
    new Watcher(this, 'test'); //把当前实例的test属性添加到Watcher
    this.test; //激活getter函数
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

    //创建Dep实例：Dep实例与key一对一对应
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      get: function () {
        //将Dep.target 指向Watcher 实例加入到Dep中
        Dep.target && dep.addDep(Dep.target);
        return val;
      },
      set: function (newVal) {
        if (newVal != val) {
          val = newVal;
          dep.notify();
          //console.log(`${key} 属性更新了`);
        }
      }
    })
  }

}

//Dep: 管理若干watcher， 它和key是一对一的关系//通知Watcher做更新
class Dep {
  constructor() {
    this.deps = [];
  }
  addDep(watcher) {
    this.deps.push(watcher);
  }
  notify() {
    this.deps.forEach(dep => dep.update())
  }


}

//保存UI中的依赖， 实现update 函数可以更新之
class Watcher {
  constructor(vm, key) {
    this.vm = vm;
    this.key = key;

    //将当前实例指向Dep.target
    Dep.target = this;

  }
  update() {
    console.log(`${this.key} 属性更新了`);
  }
}