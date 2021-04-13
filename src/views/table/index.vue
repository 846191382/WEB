<template>
  <div class="app-container">
    <div class="hospitalized-top flex-center-between">
      <div align="left" style="width: 800px;display: inline">
        <el-button @click="batchPatientLeave">批量出院</el-button>
        <el-button disabled>批量入院</el-button>
        <el-button type="primary" @click="goToHospitalized">入院登记</el-button>
        <el-button type="primary" @click="goToSetAlarmPredetermined">设备报警预置</el-button>
      </div>
      <div align="right" style="width: 1200px;display: inline;margin-left: 60px">
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
      <el-table-column
        type="selection"
        width="150"
        align="center"
      />
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
    <!--    设置报警预置-->
    <el-dialog
      title="设置报警预值"
      :visible.sync="alarmPredeterminedVisible"
      width="40%"
      center
    >
      <el-form
        ref="alarmPredeterminedForm"
        :model="alarmPredeterminedInfo"
        label-width="120px"
        label-position="left"
        class="demo-form-inline margin-20-auto"
        :rules="alarmPredeterminedRules"
      >
        <el-form-item label="报警预值：" prop="num">
          <el-input
            v-model="alarmPredeterminedInfo.num"
            placeholder="请输入高温报警值"
            onkeydown="if(event.keyCode==32) return false"
            maxlength="10"
            style="width: 20vw;"
            clearable
          />
        </el-form-item>
      </el-form>
      <div align="center">
        <el-button @click="goToSetAlarmPredetermined">取消</el-button>
        <el-button type="primary" @click="setAlarmPredeterminedConfirm">确认</el-button>
      </div>
    </el-dialog>
    <!--    设置体温贴-->
    <el-dialog
      title="设置体温贴"
      :visible.sync="temperatureStickVisible"
      width="40%"
      center
    >
      <el-form
        ref="alarmPredeterminedForm"
        :model="temperatureStickInfo"
        label-width="120px"
        label-position="left"
        class="demo-form-inline margin-20-auto"
        :rules="temperatureStickRules"
      >
        <el-form-item label="体温贴编号：" prop="number">
          <el-input
            v-model="temperatureStickInfo.number"
            placeholder="请输入体温贴编号"
            onkeydown="if(event.keyCode==32) return false"
            maxlength="10"
            style="width: 20vw;"
            clearable
          />
        </el-form-item>
      </el-form>
      <div align="center">
        <el-button @click="goToTemperature">取消</el-button>
        <el-button type="primary" @click="updateTemperatureStick">确认</el-button>
      </div>
    </el-dialog>
    <!--    入院登记-->
    <el-dialog
      title="入院登记"
      :visible.sync="hospitalizedVisible"
      width="35%"
      center
      @close="cancelAddHospitalize"
    >
      <el-form
        ref="hospitalizedForm"
        :model="addHospitalizedInfo"
        label-width="120px"
        label-position="left"
        class="demo-form-inline margin-20-auto"
        :rules="hospitalizedRules"
      >
        <el-form-item label="病人姓名：" prop="patient_name">
          <el-input
            v-model="addHospitalizedInfo.patient_name"
            placeholder="请输入高温报警值"
            onkeydown="if(event.keyCode==32) return false"
            maxlength="10"
            style="width: 20vw;"
            clearable
          />
        </el-form-item>
        <el-form-item label="病人所属科室：" prop="department_id">
          <el-select
            v-model="addHospitalizedInfo.department_id"
            placeholder="请选择"
            style="width: 20vw;"
          >
            <el-option
              v-for="item in departmentOptions"
              :key="item.department_id"
              :label="item.department_name"
              :value="item.department_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="病人所属病区：" prop="area_id">
          <el-select
            v-model="addHospitalizedInfo.area_id"
            placeholder="请选择"
            style="width: 20vw;"
          >
            <el-option
              v-for="item in areaOptions"
              :key="item.area_id"
              :label="item.area_name"
              :value="item.area_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="病人所属床：" prop="bed_id">
          <el-select
            v-model="addHospitalizedInfo.bed_id"
            placeholder="请选择"
            style="width: 20vw;"
          >
            <el-option
              v-for="item in freeBedOption"
              :key="item.bed_id"
              :label="item.bed_name"
              :value="item.bed_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报警温度：" prop="highTemperatureAlarmNum">
          <el-input
            v-model="addHospitalizedInfo.highTemperatureAlarmNum"
            style="width: 20vw;"
          />
        </el-form-item>
        <el-form-item label="编号：" prop="number">
          <el-input
            v-model="addHospitalizedInfo.number"
            maxlength="10"
            style="width: 20vw;"
          />
        </el-form-item>
      </el-form>
      <div align="center">
        <el-button @click="cancelAddHospitalize">取消</el-button>
        <el-button type="primary" @click="confirmAddHospitalized">确认</el-button>
      </div>
    </el-dialog>
    <!--    分页-->
    <el-pagination
      v-if="totalCount"
      align="right"
      :current-page="searchInfo.pageIndex"
      :page-sizes="[2, 4, 5, 40]"
      :page-size="searchInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { getToken } from '@/utils/auth'
import xlsx from 'xlsx'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    const alarmValidator = (rule, value, cb) => {
      console.log(Number(value) < 40 && Number(value) > 30)

      if (!Number(value)) {
        cb(new Error('体温数据不合理'))
      } else if (!(Number(value) < 40 && Number(value) > 30)) {
        cb(new Error('体温数据不合理'))
      } else cb()
    }
    return {
      list: null,
      listLoading: true,
      searchInfo: {
        department_id: 0,
        area_id: 0,
        pageIndex: 20,
        pageSize: 6
      },
      hospitalizedInfo: [],
      inpatientAreaInfo: [],
      departmentOptions: [],
      areaOptions: [],
      totalCount: 1,
      loading: true,
      temperatureStickVisible: false,
      temperatureStickInfo: {
        number: null
      },
      temperatureStickRules: {
        number: [
          { required: true, message: '请输入高温报警值', trigger: 'blur' }
        ]
      },
      alarmDialogVisible: false,
      alarmInfo: {
        patientID: null,
        num: null
      },
      alarmRules: {
        num: [
          { required: true, message: '请输入高温报警值', trigger: 'blur' },
          { validator: alarmValidator, trigger: 'change' }
        ]
      },
      alarmPredeterminedVisible: false,
      alarmPredeterminedInfo: {
        num: null
      },
      alarmPredeterminedRules: {
        num: [
          { required: true, message: '请输入报警预值', trigger: 'blur' },
          { validator: alarmValidator, trigger: 'change' }
        ]
      },
      hospitalizedVisible: false,
      addHospitalizedInfo: {
        patient_name: null,
        number: null,
        bed_id: null,
        department_id: null,
        area_id: null,
        highTemperatureAlarmNum: null
      },
      hospitalizedRules: {
        patient_name: [
          { required: true, message: '请输入病人姓名', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '请输入病人编号', trigger: 'blur' }
        ],
        bed_id: [
          { required: true, message: '请选择床号', trigger: 'blur' }
        ],
        department_id: [
          { required: true, message: '请选择病人所属科室', trigger: 'blur' }
        ],
        area_id: [
          { required: true, message: '请选择病人所属病区', trigger: 'blur' }
        ],
        highTemperatureAlarmNum: [
          { required: true, message: '请输入高温报警值', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getInfo()
    this.getSelectOption()
  },
  methods: {
    goToAlarm(val) {
      if (val) {
        this.alarmInfo.patient_id = val.patient_id
        this.alarmInfo.num = val.highTemperatureAlarmNum
      }
      this.alarmPredeterminedVisible = !this.alarmPredeterminedVisible
    },
    handleSizeChange(val) {
      this.searchInfo.pageSize = val
      this.getInfo()
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
    goToTemperature(row) {
      this.temperatureStickInfo = row
      this.temperatureStickVisible = !this.temperatureStickVisible
    },
    getInfo() {
      this.loading = true
      const args = {
        args: this.searchInfo,
        token: 'E120_END'
      }
      axios({
        url: 'http://localhost:3000/api/getPatient',
        method: 'post',
        data: args
      })
        .then(res => {
          console.log(res)
          if (res.data.retCode === 1) {
            this.hospitalizedInfo = res.data.data.obj
            console.log(this.hospitalizedInfo)
            this.totalCount = res.data.data.totalCount
          } else this.$message.error(res.data.msg)
          this.loading = false
        })
    },
    goToHospitalized() {
      this.hospitalizedVisible = true
    },
    getFreeBed() {
      axios({
        url: 'http://localhost:3000/api/getFreeBed',
        method: 'post',
        data: {
          token: 'E120_END'
        }
      })
        .then(res => {
          console.log(res)
          if (res.data.retCode === 1) {
            this.freeBedOption = res.data.data.obj
            this.freeBedOption.map(i => {
              i.bed_name = i.bed_id + '床'
            })
          } else this.$message.error(res.data.msg)
        })
    },
    // 修改当前页
    handleCurrentChange(val) {
      this.searchInfo.pageIndex = val
      this.getInfo()
    }
  }
}
</script>
