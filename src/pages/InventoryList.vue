<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row q-mb-md justify-between">
        <div class="text-h5">库存列表</div>
        <div>
          <q-btn color="info" label="UPDATE Montrachet_Trade_Price_List" icon="update" @click="updateMontrachetTradePrice" class="q-mr-sm" />
          <q-btn color="primary" label="导入" icon="upload" @click="showImportDialog" class="q-mr-sm" />
          <q-btn color="negative" label="删除" icon="delete" @click="confirmDelete" :disable="!selected.length" />
        </div>
      </div>

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
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios'

export default {
  name: 'InventoryList',
  
  setup() {
    const $q = useQuasar();
    const rows = ref([]);
    const loading = ref(false);
    const selected = ref([]);
    const filter = ref('');
    const importDialog = ref(false);
    const deleteDialog = ref(false);
    
    // 添加 API URL 变量
    const apiUrl = import.meta.env.VITE_API_BASE_URL 
      ? `${import.meta.env.VITE_API_BASE_URL}/api/wine-stocks/import-with-aspose`
      : '/api/wine-stocks/import-with-aspose';
    const columns = [
      { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
      { name: 'firstLevelCategory', label: '一级分类', field: 'firstLevelCategory', sortable: true, align: 'left' },
      { name: 'secondLevelCategory', label: '二级分类', field: 'secondLevelCategory', sortable: true, align: 'left' },
      { name: 'productCode', label: '商品编号', field: 'productCode', sortable: true, align: 'left' },
      { name: 'productName', label: '商品名称', field: 'productName', sortable: true, align: 'left' },
      { name: 'englishName', label: '英文名', field: 'englishName', sortable: true, align: 'left' },
      { name: 'bookInventory', label: '账面库存', field: 'bookInventory', sortable: true, align: 'right' },
      { name: 'sellableInventory', label: '可销售库存', field: 'sellableInventory', sortable: true, align: 'right' },
      { name: 'cateringPrice', label: '餐饮售价', field: 'cateringPrice', sortable: true, align: 'right', format: val => `¥${val}` },
      { name: 'specification', label: '规格', field: 'specification', sortable: true, align: 'left' },
      { name: 'createdAt', label: '创建时间', field: 'createdAt', sortable: true, align: 'left' },
      { name: 'updatedAt', label: '更新时间', field: 'updatedAt', sortable: true, align: 'left' }
     
    ];

    // 获取数据
    const fetchData = async () => {
      loading.value = true;
      try {
        //const response = await api.get('http://127.0.0.1:8765/api/wine-stocks/all');
        const response = await api.get('/api/wine-stocks/all');
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
          //await api.delete(`http://127.0.0.1:8765/api/wine-stocks/${item.id}`);
          await api.delete(`/api/wine-stocks/${item.id}`);
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

    // 更新 Montrachet Trade Price List
    const updateMontrachetTradePrice = async () => {
      loading.value = true;
      try {
        //const response = await api.post('http://127.0.0.1:8765/api/wine-stocks/reNewWineInventory');
        const response = await api.post('/api/wine-stocks/reNewWineInventory');
        $q.notify({
          color: 'positive',
          message: '更新成功，请到Montrachet列表下载',
          icon: 'check'
        });
        // 刷新数据
        fetchData();
      } catch (error) {
        console.error('更新失败:', error);
        $q.notify({
          color: 'negative',
          message: '更新失败',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
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
      importDialog,
      deleteDialog,
      showImportDialog,
      confirmDelete,
      deleteSelected,
      onUploaded,
      onUploadFailed,
      updateMontrachetTradePrice,
      apiUrl // 添加这一行
    };
  }
};
</script>