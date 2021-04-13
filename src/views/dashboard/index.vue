<template>
  <div class="dashboard-container">
    <p>欢迎进入富阳妇幼保健院连续体温监护管理平台</p>
    <img :src="imgUrl" style="margin-left: 300px;margin-top: 80px">
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {
      imgUrl: require('./bg.jpg')
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
p{
  margin-left: 450px;
  font-family: SimHei;
  margin-top: 30px;
  font-size: 12px;
  position: absolute;
}
.dashboard {
  &-container {
    margin: 30px;
  }
  img{
    padding-left: 500px;
  }
  &-text {
    font-size: 50px;
    line-height: 46px;
  }
}
</style>

