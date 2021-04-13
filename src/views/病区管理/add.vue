<template>
  <div v-loading="loading" class="Add padding-20">
    <p class="Add-titleArea">病区基本信息</p>
    <el-form
      ref="editForm"
      :model="editInfo"
      label-position="left"
      label-width="10vw"
      :rules="rules"
      style="margin-left: 4vw;"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="病区名：" prop="area_name">
            <el-input
              v-model="editInfo.area_name"
              onkeydown="if(event.keyCode==32) return false"
              placeholder="请填写病区名称"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属科室：" prop="department_name">
            <el-input
              v-model="editInfo.department_name"
              onkeydown="if(event.keyCode==32) return false"
              placeholder="请填写病区名称"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="病区负责人：" prop="chargeName">
            <el-input
              v-model="editInfo.chargeName"
              onkeydown="if(event.keyCode==32) return false"
              placeholder="请填写病区负责人名称"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话：" prop="telephone">
            <el-input
              v-model="editInfo.telephone"
              onkeydown="if(event.keyCode==32) return false"
              placeholder="请填写联系电话"
              maxlength="11"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="病区位置：" prop="address">
          <el-input
            v-model="editInfo.address"
            type="textarea"
            style="width: 20vw;"
            :rows="2"
            onkeydown="if(event.keyCode==32) return false"
            placeholder="请填写病区位置"
            clearable
          />
        </el-form-item>
      </el-row>
      <el-form-item>
        <el-button type="primary" @click="submit">{{ areaId !== undefined ? '确认保存' : '确认提交' }}</el-button>
      </el-form-item>
    </el-form>
    <p v-if="areaId !== -1" class="Add-titleArea">病房信息</p>
    <div
      v-if="areaId !== -1"
      ref="roomForm"
      style="margin-left: 4vw;"
    >
      <el-row type="flex" align="middle">
        <el-col :span="2">
          <el-button type="primary" @click="goToRoomAdd">添加病房</el-button>
        </el-col>
        <el-col :span="2">
          <span>病房数：{{ editInfo.roomNum }}</span>
        </el-col>
        <el-col :span="2">
          <span>病床数：{{ editInfo.bedNum }}</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col v-for="(item, index) in roomInfo" :key="index" :span="12">
          <el-card class="Add-card" shadow="hover">
            <el-row type="flex" justify="start" align="middle">
              <el-col>
                <svg-icon icon-class="room" style="font-size: 1vw;" />
                <span style="margin-left: 1vw;">病房名： {{ item.room_name }}</span>
              </el-col>
              <el-col>
                <svg-icon icon-class="bluetooth" style="font-size: 1.2vw;" />
                <span style="margin-left: 10px;">蓝牙网关编号： {{ item.blueToothNum }}</span>
              </el-col>
              <el-button align="right" type="danger" @click="goToDeleteRoom(item)">删除</el-button>
            </el-row>
            <el-row class="margin-20-auto" style="padding-left: 2vw;">
              <span>床位信息</span>
              <el-button type="primary" style="margin-left: 30px;" size="mini" @click="addBed(item.room_id)">添加床位</el-button>
            </el-row>
            <el-row>
              <el-col v-for="(bed, bedIndex) in item.bedInfo" v-cloak :key="bedIndex" :span="4" style="margin-top: 10px;margin-left: 0.5vw;">
                <div v-cloak class="Add-bedNum">{{ bed.bed_id +1 }}床</div>
                <!--                通过相对定位时刻保持 小蓝圈位置-->
                <el-badge class="item" style="position:relative; top:-5vh; right: -3.3vw;cursor: pointer" type="primary" value="×" @click.native="deleteBed(bed.bed_id)" />
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <!--    添加病房-->
    <el-dialog
      title="申请就餐人数"
      :visible.sync="roomAddVisible"
      width="40%"
      center
      @close="goCancel"
    >
      <el-form
        ref="applyInfo"
        :model="roomAddInfo"
        label-width="120px"
        label-position="left"
        class="demo-form-inline margin-20-auto"
        :rules="roomAddRules"
      >
        <el-form-item label="病房名：" prop="room_name">
          <el-input
            v-model="roomAddInfo.room_name"
            placeholder="请输入病房名"
            onkeydown="if(event.keyCode==32) return false"
            maxlength="10"
            clearable
          />
        </el-form-item>
        <el-form-item label="蓝牙网关编号：" prop="blueToothNum">
          <el-input
            v-model="roomAddInfo.blueToothNum"
            placeholder="请输入蓝牙网关编号"
            onkeydown="if(event.keyCode==32) return false"
            maxlength="10"
            clearable
          />
        </el-form-item>
      </el-form>
      <div align="center">
        <el-button @click="goToRoomAdd">取消</el-button>
        <el-button type="primary" @click="applyNew">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import axios from 'axios'

export default {
  name: 'Add',
  data() {
    return {
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
  created() {
    // 修改面包屑title,以及接收路由 router
    this.areaId = this.$route.query.id
    this.roomAddInfo.area_id = this.$route.query.id
    if (this.areaId === -1) {
      this.$router.options.routes[3].children[1].meta.title = '病区添加'
    } else {
      this.$router.options.routes[3].children[1].meta.title = '病区详情'
      this.getDetail()
      this.getBedInfo()
      // this.getDepartment()
      // this.getAreaInfo()
    }
  },
  methods: {
    getDetail() {
      this.loading = true
      const args = {
        areaId: this.$route.query.id,
        token: 'E120_END'
      }
      axios({
        url: 'http://localhost:3000/api/inpatientGetDetail',
        method: 'post',
        data: args
      })
        .then(res => {
          console.log(res)
          if (res.data.retCode === 1) {
            this.editInfo = res.data.data.obj[0]
          } else this.$message.error(res.data.msg)
          this.loading = false
        })
    },
    submit() {
      this.$refs.editForm.validate((e) => {
        if (e) {
          this.addNewArea()
          // if (this.$route.query.id === -1) this.addNewArea()
          // else this.updateNewArea()
        }
      })
    },
    addNewArea() {
      const args = {
        editInfo: this.editInfo,
        token: 'E120_END'
      }
      axios({
        url: 'http://localhost:3000/api/addArea',
        method: 'post',
        data: args
      })
        .then(res => {
          if (res.data.retCode === 1) {
            this.$message.success(res.data.msg)
            this.$router.go(-1) // 成功后返回
          } else this.$message.error(res.data.msg)
        })
    },
    updateNewArea() {},
    getBedInfo() {
      this.loading = true
      const args = {
        area_id: this.$route.query.id,
        token: 'E120_END'
      }
      axios({
        url: 'http://localhost:3000/api/getRoom',
        method: 'post',
        data: args
      })
        .then(res => {
          console.log(res)
          if (res.data.retCode === 1) {
            this.roomInfo = res.data.data.obj
            // 当roomInfo 长度小于1时会map不适用
            if (this.roomInfo.length > 1) {
              this.roomInfo.map(i => {
                res.data.data.objBedInfo.forEach(item => {
                  if (i.room_id === item[0].room_id) i.bedInfo = item
                })
              })
            } else this.roomInfo[0].bedInfo = res.data.data.objBedInfo
          } else {
            if (res.data.msg !== 'Query was empty') this.$message.error(res.data.msg)
          }
          this.loading = false
        })
    },
    goCancel() {},
    goToRoomAdd() {
      this.roomAddVisible = !this.roomAddVisible
    },
    applyNew() {
      this.$refs.applyInfo.validate((e) => {
        if (e) {
          this.loading = true
          this.roomAddInfo.area_id = this.areaId
          const args = {
            args: this.roomAddInfo,
            token: 'E120_END'
          }
          console.log(args)
          axios({
            url: 'http://localhost:3000/api/addRoom',
            method: 'post',
            data: args
          })
            .then(res => {
              if (res.data.retCode === 1) {
                this.$message.success(res.data.msg)
                this.goToRoomAdd()
                this.getBedInfo()
                this.getDetail()
              } else this.$message.error((res.data.msg))
              this.loading = false
            })
        }
      })
    },
    goToDeleteRoom(val) {
      console.log(val)
      if (val.bedInfo === undefined || val.bedInfo === null || val.bedInfo === []) {
        this.loading = true
        const args = {
          args: {
            room_id: val.room_id,
            area_id: this.areaId
          },
          token: 'E120_END'
        }
        axios({
          url: 'http://localhost:3000/api/deleteRoom',
          method: 'post',
          data: args
        })
          .then(res => {
            if (res.data.retCode === 1) {
              this.$message.success(res.data.msg)
              this.getDetail()
              this.getBedInfo()
            } else this.$message.error(res.data.msg)
            this.loading = false
          })
      } else this.$message.error('请先删除所有床位')
    },
    addBed(val) {
      this.loading = true
      const args = {
        args: {
          room_id: val,
          area_id: this.areaId
        },
        token: 'E120_END'
      }
      console.log(args)
      axios({
        url: 'http://localhost:3000/api/deleteRoom/api/addBed',
        method: 'post',
        data: args
      })
        .then(res => {
          if (res.data.retCode === 1) {
            this.$message.success(res.data.msg)
            this.getBedInfo()
            this.getDetail()
          } else this.$message.error(res.data.msg)
          this.loading = false
        })
    },
    deleteBed(val) {
      this.loading = true
      const args = {
        args: {
          bed_id: val,
          area_id: this.areaId
        },
        token: 'E120_END'
      }
      axios({
        url: 'http://localhost:3000/api/deleteRoom/api/deleteBed',
        method: 'post',
        data: args
      })
        .then(res => {
          if (res.data.retCode === 1) {
            this.$message.success(res.data.msg)
            this.getBedInfo()
            this.getDetail()
          } else this.$message.error(res.data.msg)
          this.loading = false
        })
    },
    getAreaInfo(area_id) {
      axios({
        url: 'http://localhost:3000/api/deleteRoom/api/areaGet',
        method: 'post',
        data: {
          area_id,
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
    getDepartment(department_id) {
      const args = {
        department_id,
        token: 'E120_END'
      }
      console.log(args)
      axios({
        url: 'http://localhost:3000/api/deleteRoom/api/departmentGet',
        method: 'post',
        data: args
      })
        .then(res => {
          console.log(res)
          if (res.data.retCode === 1) {
            this.departmentOptions = res.data.data.obj
          } else this.$message.error(res.data.msg)
        })
        .catch(err => this.$message.error(err))
    },
    newArea() {
      this.editInfo.ifNewArea = true
    },
    newDepartment() {
      this.editInfo.ifNewDepartment = true
    }
  }
}
</script>

<style lang="scss" scoped>
.Add{
  font-size: 1vw;
  &-titleArea{
    height: 3vh;
    line-height: 3vh;
    padding-left: 1vw;
    border-left: 5px solid #b1d5fd;
  }
  &-card{
    margin-top: 20px;
    width: 38vw;
    font-size: 1vw;
  }
  &-bedNum{
    width: 4vw;
    height: 5vh;
    border:1px solid #20a0ff;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .el-input,.el-select{
    width: 20vw;
  }
  [v-cloak] {
    display: none;
  }
}
</style>
