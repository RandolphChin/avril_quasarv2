<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated >
      <q-toolbar glossy class="bg-grey-1 text-black">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <BreadCrumbs />
<!--        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
        -->
      </q-toolbar>
      <q-toolbar glossy class="bg-grey-1 text-black">
        <TagHistory />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>
        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
          :children="link.children"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { mockRoutes } from '../mock'; // 引入 mockRoutes
import { useRouter } from 'vue-router';
import BreadCrumbs from 'components/BreadCrumbs.vue';
import TagHistory from "components/History.vue";
import { useHistoryStore } from '../stores/tagViewStore';

defineOptions({
  name: 'MainLayout'
})
const router = useRouter();
// 生成动态菜单项
const linksList = mockRoutes;
const leftDrawerOpen = ref(false)
// 切换左侧抽屉
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// 监听路由变化，根据需要添加历史记录
watch(
  () => router.currentRoute.value,
  (to) => {
    // 确保在点击没有子路由的菜单时才添加历史记录
    const historyStore = useHistoryStore();
    const route = mockRoutes.find(route => route.name === to.name);

    // 如果路由存在，并且没有 children，则添加到 history
    if (route && (!route.children || route.children.length === 0)) {
      historyStore.addRoute({ name: route.name, meta: route.meta, path: to.path });
    }
  }
);
</script>
