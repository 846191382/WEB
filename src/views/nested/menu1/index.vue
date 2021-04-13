<template>
  <div>
    <!-- 卡片视图区域 -->
    <el-card>
      <div style="width: 1400px;height:100px;margin-left: 80px;align:center">
      </div>
      <!-- 2. 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 1400px;height:600px;" />
    </el-card>
  </div>
</template>

<script>
// 1. 导入 echarts
import * as echarts from 'echarts'

export default {
  data() {
    return {}
  },
  created() {},

  mounted() {
    // 3. 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    var option = {
      xAxis: {
        type: 'category',
        data: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line'
      }]
    }
    myChart.setOption(option)
  },
  methods: {}
}
</script>

<style lang="less" scoped>
</style>
