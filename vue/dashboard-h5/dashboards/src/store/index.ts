import { menuItem } from '@/api';
import { createStore } from 'vuex'

export default createStore({
  state: {
    menuList: new Array<menuItem>()
  },
  getters: {
  },
  mutations: {
    initMenuList(state, data: any) {
      state.menuList = data;
    }
  },
  actions: {
  },
  modules: {
  }
})
