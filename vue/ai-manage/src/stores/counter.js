import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// export const useCounterStore = defineStore('counter', () => {
//     // 定义容器数据（state)
//     const count = ref(0)
//     // 定义修改数据的方法(action 同步+异步)
//     function increment() {
//         count.value++
//     }
//     // getter定义
//     const doubleCount = computed(() =>
//         count.value * 2
//     )

//     return { count, increment, doubleCount }
// })


// 定义并导出容器
// 参数1：容器ID,必须唯一，在vuedevtools中显示，将来pinia会把所有的容器挂载到根容器
// 参数2：选项对象
export const useCounterStore = defineStore('counter', {
    // 类似组件data，用来储存全局状态
    // 1.必须是函数，防止后端变量污染
    // 2.必须是箭头函数
    state: () => {
        return {
            count: 100
        }
    },
    // 类似于组件的computed，用来封装计算属性，有缓存功能
    // 函数接收一个可选参数：state 状态对象，也可以用this(ts要指定类型)
    getters: {
        count10(state) {
            return state.count + 10  //始终返回+10的数据，而且可缓存
        }
    },
    // 类似组件中的methods,封装业务逻辑，修改state
    // 不能写成箭头函数，因为要利用this,指向state
    actions: {
        changeState(num) {
            thus.count += num
        }
    }
})
