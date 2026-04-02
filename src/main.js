import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'

import router from './router'
import App from './App.vue'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
authStore.init()

app.mount('#app')
