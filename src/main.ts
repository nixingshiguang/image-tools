import './assets/main.css'
import 'uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { create, NMessageProvider } from 'naive-ui'

import App from './App.vue'
import router from './router'

const naive = create({
  components: [NMessageProvider]
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')
