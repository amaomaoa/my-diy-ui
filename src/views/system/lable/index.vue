<template>
    <div class="app-container">
        <el-form
            :model="queryParams"
            ref="queryRef"
            :inline="true"
            v-show="showSearch"
            label-width="68px"
        >
            <el-form-item label="id" prop="id">
                <el-input
                    v-model="queryParams.id"
                    placeholder="请输入id"
                    clearable
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="标签名" prop="name">
                <el-input
                    v-model="queryParams.name"
                    placeholder="请输入标签名"
                    clearable
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery"
                    >搜索</el-button
                >
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                    type="primary"
                    plain
                    icon="Plus"
                    @click="handleAdd"
                    v-hasPermi="['system:lable:add']"
                    >新增</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="success"
                    plain
                    icon="Edit"
                    :disabled="single"
                    @click="handleUpdate"
                    v-hasPermi="['system:lable:edit']"
                    >修改</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="danger"
                    plain
                    icon="Delete"
                    :disabled="multiple"
                    @click="handleDelete"
                    v-hasPermi="['system:lable:remove']"
                    >删除</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="warning"
                    plain
                    icon="Download"
                    @click="handleExport"
                    v-hasPermi="['system:lable:export']"
                    >导出</el-button
                >
            </el-col>
            <right-toolbar
                v-model:showSearch="showSearch"
                @queryTable="getList"
            ></right-toolbar>
        </el-row>

        <el-table
            v-loading="loading"
            :data="lableList"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="id" align="center" prop="id" v-if="true" />
            <el-table-column label="标签名" align="center" prop="name" />
            <el-table-column
                label="操作"
                align="center"
                class-name="small-padding fixed-width"
            >
                <template #default="scope">
                    <el-button
                        type="text"
                        icon="Edit"
                        @click="handleUpdate(scope.row)"
                        v-hasPermi="['system:lable:edit']"
                        >修改</el-button
                    >
                    <el-button
                        type="text"
                        icon="Delete"
                        @click="handleDelete(scope.row)"
                        v-hasPermi="['system:lable:remove']"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>

        <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
        />

        <!-- 添加或修改标签管理对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form
                ref="lableRef"
                :model="form"
                :rules="rules"
                label-width="80px"
            >
                <el-form-item label="标签名" prop="name">
                    <el-input v-model="form.name" placeholder="请输入标签名" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button
                        :loading="buttonLoading"
                        type="primary"
                        @click="submitForm"
                        >确 定</el-button
                    >
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Lable">
import {
    listLable,
    getLable,
    delLable,
    addLable,
    updateLable,
} from "@/api/system/lable";

const { proxy } = getCurrentInstance();
const { diy_accessories_category_type } = proxy.useDict(
    "diy_accessories_category_type"
);

const lableList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: undefined,
        name: undefined,
    },
    rules: {
        name: [{ required: true, message: "标签名不能为空", trigger: "blur" }],
    },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询标签管理列表 */
function getList() {
    loading.value = true;
    listLable(queryParams.value).then((response) => {
        lableList.value = response.rows;
        total.value = response.total;
        loading.value = false;
    });
}

// 取消按钮
function cancel() {
    open.value = false;
    reset();
}

// 表单重置
function reset() {
    form.value = {
        id: null,
        name: null,
        type: null,
    };
    proxy.resetForm("lableRef");
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
    ids.value = selection.map((item) => item.id);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
    reset();
    open.value = true;
    title.value = "添加标签管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
    loading.value = true;
    reset();
    const _id = row.id || ids.value;
    getLable(_id).then((response) => {
        loading.value = false;
        form.value = response.data;
        open.value = true;
        title.value = "修改标签管理";
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["lableRef"].validate((valid) => {
        if (valid) {
            buttonLoading.value = true;
            if (form.value.id != null) {
                updateLable(form.value)
                    .then((response) => {
                        proxy.$modal.msgSuccess("修改成功");
                        open.value = false;
                        getList();
                    })
                    .finally(() => {
                        buttonLoading.value = false;
                    });
            } else {
                addLable(form.value)
                    .then((response) => {
                        proxy.$modal.msgSuccess("新增成功");
                        open.value = false;
                        getList();
                    })
                    .finally(() => {
                        buttonLoading.value = false;
                    });
            }
        }
    });
}

/** 删除按钮操作 */
function handleDelete(row) {
    const _ids = row.id || ids.value;
    proxy.$modal
        .confirm('是否确认删除标签管理编号为"' + _ids + '"的数据项？')
        .then(function () {
            loading.value = true;
            return delLable(_ids);
        })
        .then(() => {
            loading.value = true;
            getList();
            proxy.$modal.msgSuccess("删除成功");
        })
        .catch(() => {})
        .finally(() => {
            loading.value = false;
        });
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download(
        "system/lable/export",
        {
            ...queryParams.value,
        },
        `lable_${new Date().getTime()}.xlsx`
    );
}

getList();
</script>
