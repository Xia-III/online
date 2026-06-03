import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // 状态
  state: () => ({
    token: '',
    userInfo: {}
  }),
  
  // getters
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  
  // actions
  actions: {
    setToken(token) {
      this.token = token
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    logout() {
      this.token = ''
      this.userInfo = {}
    }
  },
  
  // 持久化配置
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user_store',
        storage: localStorage
      }
    ]
  }
})