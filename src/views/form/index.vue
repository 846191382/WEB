<template>
  <div class="app-container">
    <div align="right" style="width: 1200px;display: inline;margin-left: 60px">
      <el-select
        v-model="searchInfo.department_id"
        placeholder="请选择科室"
        style="width: 150px"
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
        style="width: 150px"
      >
        <el-option :key="0" label="全部病区" :value="0" />
        <el-option
          v-for="item in areaOptions"
          :key="item.area_id"
          :label="item.area_name"
          :value="item.area_id"
        />
      </el-select>
      <el-select
        v-model="searchInfo.area_id"
        placeholder="请选择体温贴状态"
        style="width: 150px"
      >
        <el-option :key="0" label="全部体温贴状态" :value="0" />
        <el-option
          v-for="item in areaOptions"
          :key="item.area_id"
          :label="item.area_name"
          :value="item.area_id"
        />
      </el-select>
      <el-select
        v-model="searchInfo.area_id"
        placeholder="请选择病区"
        style="width: 150px"
      >
        <el-option :key="0" label="全部电量" :value="0" />
        <el-option
          v-for="item in areaOptions"
          :key="item.area_id"
          :label="item.area_name"
          :value="item.area_id"
        />
      </el-select>
      <el-select
        v-model="searchInfo.area_id"
        placeholder="请选择病区"
        style="width: 150px"
      >
        <el-option :key="0" label="全部报警状态" :value="0" />
        <el-option
          v-for="item in areaOptions"
          :key="item.area_id"
          :label="item.area_name"
          :value="item.area_id"
        />
      </el-select>
      <el-input
        v-model="searchInfo.bed_id"
        placeholder="请输入床号"
        clearable
        style="width: 200px"
        onkeydown="if(event.keyCode==32) return false"
      />
      <el-input
        v-model="searchInfo.keyWords"
        placeholder="姓名/病人编号"
        clearable
        style="width: 200px"
        onkeydown="if(event.keyCode==32) return false"
      />
      <el-input
        v-model="searchInfo.temperaturePasteNum"
        placeholder="体温上限"
        clearable
        style="width: 200px"
        onkeydown="if(event.keyCode==32) return false"
      />
      <el-button type="primary" icon="el-icon-search" @click="getInfo">搜索</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="hospitalizedInfo"
      element-loading-text="Loading"
      :row-class-name="tableRowClassName"
      border
      fit
      highlight-current-row
      :header-cell-style="{background:'#c7c5c5',align:'left '}"
      style="margin-top: 60px;font-size: 10px;cellspacing:0;cellpadding:0;align:left "
      :row-style="{height: '80px'}"
    >
      <el-table-column align="center" label="床号" width="150">
        <template slot-scope="scope" style="border: none">
          {{ scope.row.bed_id }}
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.patient_name }}
        </template>
      </el-table-column>
      <el-table-column label="病人编号" width="400" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="高温报警值" width="300" align="center">
        <template slot-scope="scope">
          <p v-if="scope.row.highTemperatureAlarmNum">{{ scope.row.highTemperatureAlarmNum }}</p>
          <p v-else>- -</p>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="440">
        <template slot-scope="scope">
          <el-button @click="patientLeave(scope.row)">出院</el-button>
          <el-button type="warning" @click="goToTemperature(scope.row)">{{ scope.row.custodyStatus === 3 ? '设置体温贴' : '切换体温贴' }}</el-button>
          <el-button type="primary" @click="goToAlarm(scope.row)">设置报警</el-button>
          <el-button v-if="scope.row.custodyStatus !== 3" type="danger" @click="updateCustody(scope.row)">{{ scope.row.custodyStatus === 1 ? '停止监护' : '开始监护' }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchInfo: {
        department_id: 0,
        area_id: 0,
        bed_id: '',
        keyWords: '',
        temperaturePasteNum: ''
      },
      editInfo: {
        area_id: null,
        area_name: null,
        department_name: null,
        department_id: 0,
        chargeName: null,
        telephone: null,
        address: null,
        roomNum: 0,
        bedNum: 0
      },
      loading: false,
      roomInfo: [],
      rules: {
        area_name: [
          { required: true, message: '请输入病区名', trigger: 'blur' }
        ],
        department_name: [
          { required: true, message: '请输入所属科室', trigger: 'blur' }
        ],
        chargeName: [
          { required: true, message: '请输入负责人姓名', trigger: 'blur' }
        ],
        telephone: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          { min: 11, max: 11, message: '请输入11位手机号', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入病区位置', trigger: 'blur' }
        ]
      },
      areaId: null,
      roomAddVisible: false,
      roomAddInfo: {},
      roomAddRules: {
        room_name: [
          { required: true, message: '请输入病房名', trigger: 'blur' }
        ],
        blueToothNum: [
          { required: true, message: '请输入蓝牙网关编号', trigger: 'blur' }
        ]
      },
      departmentOptions: [],
      areaOptions: []
    }
  },
  methods: {
    onSubmit() {
      this.$message('submit!')
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

