<template>
  <n-config-provider :theme="lightTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-layout class="layout-container">
        <!-- 顶部导航栏 -->
        <n-layout-header bordered class="header-shadow">
          <div class="header-content">
            <div class="logo-container">
              <n-gradient-text type="primary" size="24">图片处理工具</n-gradient-text>
            </div>
            <div class="nav-menu">
              <n-menu :value="activeKey" mode="horizontal" :options="menuOptions" @update:value="handleMenuUpdate" />
            </div>

          </div>
        </n-layout-header>

        <!-- 主内容区域 -->
        <n-layout-content class="content-container">
          <n-card class="content-card">
            <router-view />
          </n-card>
        </n-layout-content>

        <!-- 页脚 -->
        <n-layout-footer bordered>
          <div class="footer-content">
            <n-text depth="3">© 2025 逆行时光</n-text>
          </div>
        </n-layout-footer>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  NConfigProvider, NLayout, NLayoutHeader, NLayoutContent, NLayoutFooter,
  NMenu, NCard, NGradientText, NMessageProvider, NText
} from 'naive-ui'
import { lightTheme } from 'naive-ui'

// 路由相关
const route = useRoute()
const router = useRouter()
const activeKey = computed(() => route.path)

// 导航菜单点击处理
function handleMenuUpdate(key: string) {
  router.push(key)
}

// 主题覆盖配置
const themeOverrides = computed(() => {
  return {
    common: {
      bodyColor: '#f5f5f5',
      primaryColor: '#8b5cf6',
      primaryColorHover: '#7c3aed',
      primaryColorPressed: '#6d28d9',
      primaryColorSuppl: '#a78bfa'
    }
  }
})

// 导航菜单配置
const menuOptions = [
  {
    label: '圆角处理',
    key: '/',
    icon: () => h('div', { class: 'i-carbon-image' })
  },
  {
    label: '图片裁剪',
    key: '/crop',
    icon: () => h('div', { class: 'i-carbon-crop' })
  },
  {
    label: '格式转换',
    key: '/convert',
    icon: () => h('div', { class: 'i-carbon-repeat' })
  },
  {
    label: '图片压缩',
    key: '/compress',
    icon: () => h('div', { class: 'i-carbon-compress' })
  },
  {
    label: 'Favicon生成',
    key: '/favicon',
    icon: () => h('div', { class: 'i-carbon-favorite' })
  }
]
</script>

<style scoped>
.layout-container {
  background-color: var(--color-background);
}

.header-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
}

.logo-container {
  flex-shrink: 0;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}



.content-container {
  padding: 32px;
  min-height: calc(100vh - 128px);
  width: 100%;
}

.content-card {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.footer-content {
  text-align: center;
  padding: 16px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 12px;
  }

  .nav-menu {
    margin: 12px 0;
  }

  .content-container {
    padding: 16px;
  }
}
</style>
