//遍历模板， 将里面的插值表达式处理
//另外如果发现y-xx, @xx 做特别处理


class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);

    if (this.$el) {
      //1. $el 中的内容搬家到一个fragment， 提高操作效率
      this.$fregment = this.node2Fregment(this.$el);
      console.log(this.$fregment);
      //2. 编译fregment
      this.compile(this.$fregment);
      console.log("after compile", this.$fregment);

      //3. 将编译结果追加至数组中
      this.$el.appendChild(this.$fregment);
    }
  }

  // 遍历el, 把里面的内容搬到一个fragment
  node2Fregment(el) {
    const fregment = document.createDocumentFragment();

    let child;
    while ((child = el.firstChild)) { // 像链表的->next
      //由于appendChild是移动操作
      fregment.appendChild(child);
    }
    return fregment;
  }
  //把动态值替换， 把指令和事件做处理
  compile(el) {
    //遍历el， 拿出所有child
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      if (this.isElement(node)) {

        // console.log('编译元素' + node.nodeName);
        // 如果是元素节点， 要处理指令y-xxx, 事件@xx
        this.compileElement(node);
      } else if (this.isInterpolation(node)) {
        // console.log('编译文本' + node.textContent);

        this.compileTextNode(node);
      }
      //递归子元素
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }

  isElement(node) {
    return node.nodeType === 1;
  }

  isInterpolation(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }

  compileElement(node) {
    //查看node的特性中是否有y-xx @xx
    const nodeAttrs = node.attributes;
    Array.from(nodeAttrs).forEach(attr => {
      //获取属性的名称和值 y-text="abc"
      const attrName = attr.name;
      const exp = attr.value;
      //指令: y-xx
      if (attrName.indexOf('y-') === 0) {
        const dir = attrName.substring(2);//text
        //执行指令
        this[dir] && this[dir](node, this.$vm, exp);
      } else if (attrName.indexOf('@') === 0) {
        //事件 @click = "hadleClick"
        const eventName = attrName.substring(1);//click
        //exp : hadleClick
        this.eventHandler(node, this.$vm, exp, eventName);

      }
    })
  }

  eventHandler(node, vm, exp, eventName) {
    //获取回调函数
    const fn = vm.$options.methods && vm.$options.methods[exp];
    if (eventName && fn) {
      node.addEventListener(eventName, fn.bind(vm)); //绑定当前组件实例
    }
  }
  
  text(node, vm, exp) {
    this.update(node, vm, exp, 'text');
  }
  textUpdator(node, value) {
    //value: xxx
    node.textContent = value;
  }

  //双向数据的绑定
  model(node, vm, exp) {
    //数值变了改界面
    this.update(node, vm, exp, 'model');
    //界面变了改数值
    node.addEventListener('input', e => {
      vm[exp] = e.target.value;
    });
  }
  modelUpdator(node, value) {
    node.value = value;
  }

  html(node, vm, exp) {
    this.update(node, vm, exp, 'html');
  }
  htmlUpdator(node, value) {
    console.log("===================");

    node.innerHTML = value;
  }

  //把插值表达式替换为实际的内容
  compileTextNode(node) {
    //获取正则表达式中匹配的内容
    //{{xxx}} RegExp.$1 是匹配分组的部分
    console.log('compileTextNode RegExp.$1=', RegExp.$1);
    //node.textContent = this.$vm[RegExp.$1];
    const exp = RegExp.$1;
    this.update(node, this.$vm, exp, 'text');
  }


  //编写一个可复用的更新函数
  //exp 表达式 xxx
  //dir 具体操作  text, html, model
  update(node, vm, exp, dir) {
    const fn = this[dir + 'Updator'];
    console.log("===================00000 fn=", fn);
    //创建Watcher
    //
    // new Vue({
    //   data: {
    //     xxx: 'bla'
    //   }
    // })
    //exp 就是xxx
    new Watcher(vm, exp, function () { // Waecher中的update函数
      console.log("=======fn = ", fn);
      fn && fn(node, vm[exp]);
    })
  }


}