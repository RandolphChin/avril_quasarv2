<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row q-mb-md justify-between">
        <div class="text-h5">Montrachet列表</div>
        <div>
          <q-btn color="primary" label="导入" icon="upload" @click="showImportDialog" class="q-mr-sm" />
          <q-btn color="secondary" label="导出" icon="download" @click="exportData" class="q-mr-sm" />
          <q-btn color="negative" label="删除" icon="delete" @click="confirmDelete" :disable="!selected.length" />
        </div>
      </div>

      <q-tabs
        v-model="tab"
        class="text-primary q-mb-md"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="latest" label="最新" />
        <q-tab name="previous" label="上次" />
      </q-tabs>

      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        selection="multiple"
        v-model:selected="selected"
        :filter="filter"
      >
        <template v-slot:top-right>
          <q-input
            dense
            debounce="300"
            v-model="filter"
            placeholder="搜索"
            class="q-mr-sm"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        
        <!-- 移除这部分代码
        <template v-slot:body-cell-izChanged="props">
          <q-td :props="props">
            <span :style="{ color: props.value == '10' ? 'green' : 'inherit' }">
              {{ props.value }}
            </span>
          </q-td>
        </template>
        -->
      </q-table>
    </div>

    <!-- 导入对话框 -->
    <q-dialog v-model="importDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">导入Excel文件</div>
        </q-card-section>

        <q-card-section>
          <q-uploader
            :url="apiUrl"
            accept=".xlsx"
            label="上传Excel文件"
            color="primary"
            field-name="file"
            @uploaded="onUploaded"
            @failed="onUploadFailed"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">确定要删除选中的 {{ selected.length }} 条记录吗？</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="删除" color="negative" @click="deleteSelected" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios'

export default {
  name: 'MontrachetList',
  
  setup() {
    const $q = useQuasar();
    const rows = ref([]);
    const loading = ref(false);
    const selected = ref([]);
    const filter = ref('');
    const tab = ref('latest');
    const importDialog = ref(false);
    const deleteDialog = ref(false);
    
    // 添加 API URL 变量
    const apiUrl = import.meta.env.VITE_API_BASE_URL 
      ? `${import.meta.env.VITE_API_BASE_URL}/api/wine-inventories/import-with-aspose`
      : '/api/wine-inventories/import-with-aspose';

    const columns = [
      { name: 'wineType', label: 'wineType', field: 'wineType', sortable: true, align: 'left' },
      { name: 'winery', label: 'winery', field: 'winery', sortable: true, align: 'left' },
      { name: 'cuveeName', label: 'Cuvée名称', field: 'cuveeName', sortable: true, align: 'left' },
      { name: 'chineseName', label: 'chineseName', field: 'chineseName', sortable: true, align: 'left' },
      { name: 'vintage', label: 'vintage', field: 'vintage', sortable: true, align: 'left' },
      { name: 'region', label: 'region', field: 'region', sortable: true, align: 'left' },
      { name: 'country', label: 'country', field: 'country', sortable: true, align: 'left' },
      { name: 'format', label: 'format', field: 'format', sortable: true, align: 'left' },
      { name: 'tradePrice', label: 'tradePrice', field: 'tradePrice', sortable: true, align: 'right' },
      { name: 'quantity', label: 'quantity', field: 'quantity', sortable: true, align: 'right' },
      { name: 'retailPrice', label: 'retailPrice', field: 'retailPrice', sortable: true, align: 'right' },
      { name: 'distributorPrice', label: 'distributorPrice', field: 'distributorPrice', sortable: true, align: 'right' },
      { name: 'costPrice', label: 'costPrice', field: 'costPrice', sortable: true, align: 'right' },
      { name: 'subWineType', label: 'SUB_WINE_TYPE', field: 'subWineType', sortable: true, align: 'left' },
      { name: 'subWinery', label: 'SUB_WINERY', field: 'subWinery', sortable: true, align: 'left' },
      { name: 'createdAt', label: '创建时间', field: 'createdAt', sortable: true, align: 'left' },
      { name: 'updatedAt', label: '更新时间', field: 'updatedAt', sortable: true, align: 'left' },
      { name: 'status', label: '状态', field: 'status', sortable: true, align: 'left' },
      { name: 'lineIndex', label: '行排序', field: 'lineIndex', sortable: true, align: 'right' },
      { 
        name: 'izChanged', 
        label: '是否变化', 
        field: 'izChanged', 
        sortable: true, 
        align: 'left',
        format: (val) => val
      },
    ];

    // 监听tab变化，加载不同数据
    watch(tab, (newVal) => {
      fetchData();
    });

    // 获取数据
    const fetchData = async () => {
      loading.value = true;
      try {
        const status = tab.value === 'latest' ? '1' : '0';
        //const response = await api.get('http://127.0.0.1:8765/api/wine-inventories/all', {
        const response = await api.get('/api/wine-inventories/all', {
          params: { status }
        });
        rows.value = response.data;
      } catch (error) {
        console.error('获取数据失败:', error);
        $q.notify({
          color: 'negative',
          message: '获取数据失败',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    // 显示导入对话框
    const showImportDialog = () => {
      importDialog.value = true;
    };

    // 导出数据
    const exportData = async () => {
      try {
        //const response = await api.get('http://127.0.0.1:8765/api/wine-inventories/export', {
        const response = await api.get('/api/wine-inventories/export', {
          responseType: 'blob'
        });
        
          // 从响应头中获取文件名，后端设备的Content-Disposition，这里浏览器显示的是content-disposition
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'montrachet_list.xls'; // 默认文件名
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
        if (fileNameMatch && fileNameMatch[1]) {
          // 解码文件名（处理URL编码和UTF-8情况）
          fileName = decodeURIComponent(fileNameMatch[1].replace(/"/g, ''));
        }
      }
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        $q.notify({
          color: 'positive',
          message: '导出成功',
          icon: 'check'
        });
      } catch (error) {
        console.error('导出失败:', error);
        $q.notify({
          color: 'negative',
          message: '导出失败',
          icon: 'error'
        });
      }
    };

    // 确认删除
    const confirmDelete = () => {
      if (selected.value.length > 0) {
        deleteDialog.value = true;
      }
    };

    // 删除选中项
    const deleteSelected = async () => {
      try {
        for (const item of selected.value) {
          // await api.delete(`http://127.0.0.1:8765/api/wine-inventories/${item.id}`);
          await api.delete(`/api/wine-inventories/${item.id}`);
        }
        
        $q.notify({
          color: 'positive',
          message: '删除成功',
          icon: 'check'
        });
        
        // 刷新数据
        fetchData();
        selected.value = [];
      } catch (error) {
        console.error('删除失败:', error);
        $q.notify({
          color: 'negative',
          message: '删除失败',
          icon: 'error'
        });
      }
    };

    // 上传成功回调
    const onUploaded = () => {
      $q.notify({
        color: 'positive',
        message: '导入成功',
        icon: 'check'
      });
      importDialog.value = false;
      fetchData();
    };

    // 上传失败回调
    const onUploadFailed = () => {
      $q.notify({
        color: 'negative',
        message: '导入失败',
        icon: 'error'
      });
    };


    onMounted(() => {
      fetchData();
    });

    return {
      rows,
      columns,
      loading,
      selected,
      filter,
      tab,
      importDialog,
      deleteDialog,
      showImportDialog,
      exportData,
      confirmDelete,
      deleteSelected,
      onUploaded,
      onUploadFailed,
      apiUrl
    };
  }
};
</script>
<style scoped>
.row-green {
  background-color: #d0f5d0 !important; /* 可以根据需求更换颜色 */
}
</style>
