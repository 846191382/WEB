<template>
  <div class="app-container" style="border:1px solid #c7c5c5;width: 1280px;margin-left: 20px;padding: 0px">
    <div class="inpatientArea-top flex-center-between">
      <div align="left" style="display:inline-block">
        <el-button type="primary" @click="goAdd(-1)">添加病区</el-button>
      </div>
      <div align="right" style="display:inline-block;margin-left: 650px">
        <el-select
          v-model="searchInfo.department_id"
          placeholder="请选择科室"
        >
          <el-option :key="0" label="全部科室" :value="0" />
          <el-option
            v-for="item in departmentOptions"
            :key="item.department_id"
            :label="item.department_name"
            :value="item.department_id"
          />
        </el-select>
        <el-select
          v-model="searchInfo.area_id"
          placeholder="请选择病区"
        >
          <el-option :key="0" label="全部病区" :value="0" />
          <el-option
            v-for="item in areaOptions"
            :key="item.area_id"
            :label="item.area_name"
            :value="item.area_id"
          />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="getInfo">搜索</el-button>
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      :data="inpatientAreaInfo"
      element-loading-text="Loading"
      fit
      :row-style="{height: '80px'}"
      :row-class-name="tableRowClassName"
      style="margin-top: 60px;font-size: 10px;cellspacing:0;cellpadding:0;align:left "
      :header-cell-style="{background:'#c7c5c5',align:'left '}"
    >
      <el-table-column label="病区名" width="150" style="border: none" align="center">
        <template slot-scope="scope" style="border: none">
          {{ scope.row.area_name }}
        </template>
      </el-table-column>
      <el-table-column label="所属科室" width="110">
        <template slot-scope="scope">
          {{ scope.row.department_name }}
        </template>
      </el-table-column>
      <el-table-column label="病房数" width="110">
        <template slot-scope="scope">
          <span>{{ scope.row.roomNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="病位数" width="110">
        <template slot-scope="scope">
          {{ scope.row.bedNum }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="病区负责人" width="120">
        <template slot-scope="scope">
          {{ scope.row.chargeName }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="联系电话" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.telephone }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="病区位置" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="360">
        <template slot-scope="scope">
          <el-button type="primary" align="left" @click="goAdd(scope.row.area_id)">查看详情</el-button>
          <el-button align="left">导入信息</el-button>
          <el-button type="danger" align="left" @click="deleteArea(scope.row.area_id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--    分页-->
    <el-pagination
      v-if="totalCount"
      align="right"
      :current-page="searchInfo.pageIndex"
      :page-sizes="[2, 4, 5, 40]"
      :page-size="searchInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total=1
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { getToken } from '@/utils/auth'

export default {
  name: 'Index',
  data() {
    return {
      searchInfo: {
        department_id: 0,
        area_id: 0,
        pageIndex: 20,
        pageSize: 6
      },
      inpatientAreaInfo: [],
      departmentOptions: [],
      areaOptions: [],
      totalCount: 1,
      loading: true

    }
  },
  created() {
    this.getSelectOption()
    this.getInfo()
  },
  methods: {
    getInfo() {
      this.loading = true
      const args = {
        args: this.searchInfo,
        token: 'E120_END'
      }
      axios({
        url: 'http://localhost:3000/api/inpatientGet',
        method: 'post',
        data: args
      })
        .then(res => {
          console.log(res)
          if (res.data.retCode === 1) {
            this.inpatientAreaInfo = res.data.data.obj
            this.totalCount = res.data.data.totalCount // 共计
            console.log(res.data.data.obj)
          } else this.$message.error(res.data.msg)
          this.loading = false
        })
    },
    // 修改size
    handleSizeChange(val) {
      this.searchInfo.pageSize = val
      this.getInfo()
    },
    // 修改当前页
    handleCurrentChange(val) {
      this.searchInfo.pageIndex = val
      this.getInfo()
    },
    goAdd(val) {
      this.$router.push({
        path: '/病区管理/add',
        query: { id: val }})
    },
    getSelectOption() {
      // 获得 departmentOption
      axios({
        url: 'http://localhost:3000/api/departmentGet',
        method: 'post',
        data: {
          token: 'E120_END'
        }
      })
        .then(res => {
          if (res.data.retCode === 1) {
            this.departmentOptions = res.data.data.obj
          } else this.$message.error(res.data.msg)
        })
        .catch(err => this.$message.error(err))
      // 获得 areaOption
      axios({
        url: 'http://localhost:3000/api/areaGet',
        method: 'post',
        data: {
          token: 'E120_END'
        }
      })
        .then(res => {
          if (res.data.retCode === 1) {
            this.areaOptions = res.data.data.obj
          } else this.$message.error(res.data.msg)
        })
        .catch(err => this.$message.error(err))
    },
    deleteArea(area_id) {
      this.loading = true
      const args = {
        area_id,
        token: 'E120_END'
      }
      axios({
        url: 'http://localhost:3000/api/deleteArea',
        method: 'post',
        data: args
      })
        .then(res => {
          if (res.data.retCode === 1) {
            this.$message.success(res.data.msg)
          } else this.$message.error(res.data.msg)
          this.loading = false
          this.getInfo()
        })
    }

  }
}
</script>

<style lang="less" scoped>
.inpatientArea{
  font-size: 1vw;
  .el-select {
    margin-right: 10px;
    max-width: 130px;
  }
  .el-input{
    width: 10vw;
    margin-right:10px;
  }
  .el-button{
    height: 80px;
  }
}
</style>
