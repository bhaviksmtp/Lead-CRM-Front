import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'sweetalert2/dist/sweetalert2.min.css'
import './assets/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import DataTable from './components/common/DataTable.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('DataTable', DataTable)
app.component('CommonDataTable', DataTable)

app.mount('#app')
