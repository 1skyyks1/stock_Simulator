

<template>
  <div v-loading.fullscreen="isLoading">
    <nav-menu style="margin-bottom: 15px"></nav-menu>
    <div class="search-container">
      <el-input class="search-input" v-model="searchCode" placeholder="输入股票代码"></el-input>
      <el-input class="search-input-name" v-model="searchName" placeholder="输入股票名称"></el-input>
      <el-select v-model="searchType" placeholder="选择股票类型" style="width: 20%" clearable>
        <el-option
            v-for="type in stockTypeOptions"
            :key="type"
            :label="type"
            :value="type">
        </el-option>
<!--        <el-option label="取消"  value=""></el-option> &lt;!&ndash; 取消选项 &ndash;&gt;-->

      </el-select>
<!--      <el-button type="primary" @click="reset" plain >重置</el-button>-->
      <el-button type="primary" @click="getStockList" plain icon="el-icon-search">搜索</el-button>
    </div>
    <div class="stock-container">
      <el-card class="stock-card" v-for="(stock, index) in stocks" :key="index" @click.native="goDetail(stock.stockId)">
        <div class="stock-title">
         <span class="title">
    {{ stock.stockName }} ({{ stock.stockCode }})
    <span class="stock-type" style="font-size: 18px;">{{ stock.stockCompany.stockType }}</span>
  </span>
          <span class="current-price" :class="priceClass(stock)">{{ stock.price }}</span>
        </div>
        <div class="stock-info">
          <p class="info">昨收 {{ stock.closingPrice }}</p>
          <p class="info">今高 {{ stock.maxPrice }}</p>
          <p class="info">今低 {{ stock.minPrice }}</p>
          <p class="info">今日成交量 {{ stock.volume }}</p>
          <span class="change-percent" :class="priceClass(stock)">{{ stock.changePercent.toFixed(2) }}%</span>
        </div>
        <div>
          <span style="font-size: 18px;">AI投资建议: {{ stock.investment || '无' }}</span>
        </div>
      </el-card>
    </div>
    <div class="pagination-container">
      <el-pagination
          background
          layout="prev, pager, next"
          :current-page.sync="currentPage"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange">
      </el-pagination>
    </div>
    <el-backtop></el-backtop>
  </div>
</template>

<script>
import navMenu from "@/components/navmenu.vue";
import { stockList } from "@/api/stock";

export default {
  name: "homePage",
  components: {
    'nav-menu': navMenu
  },
  data() {
    return {
      stocks: [],
      isLoading: true,
      searchType: localStorage.getItem('stockType') && localStorage.getItem('stockType') !== 'null' ? localStorage.getItem('stockType') : '',
      searchCode: localStorage.getItem('stockCode') && localStorage.getItem('stockCode') !== 'null' ? localStorage.getItem('stockCode') : '',
      searchName: localStorage.getItem('stockName') && localStorage.getItem('stockName') !== 'null' ? localStorage.getItem('stockName') : '',
      currentPage: localStorage.getItem('currentPage') && localStorage.getItem('currentPage') !== 'null' ? Number(localStorage.getItem('currentPage')) : 1,
      pageSize: 10,
      total: 0,
      stockTypeOptions: [
        '专业服务', '专用设备', '中药', '互联网服务', '交运设备', '仪器仪表', '光伏设备', '光学光电子', '农牧饲渔', '农药兽药',
        '包装材料', '化学制品', '化学制药', '化学原料', '化纤行业', '医疗器械', '半导体', '塑料制品', '家用轻工', '家电行业',
        '工程咨询服务', '工程建设', '工程机械', '文化传媒', '有色金属', '橡胶制品', '汽车服务', '汽车零部件', '消费电子', '燃气',
        '物流行业', '环保行业', '玻璃玻纤', '生物制品', '电子元件', '电机', '电池', '电网设备', '纺织服装', '航天航空',
        '航运港口', '装修装饰', '计算机设备', '贸易行业', '软件开发', '通信设备', '通用设备', '造纸印刷', '采掘行业',
        '钢铁行业', '非金属材料', '食品饮料'
      ]
    };
  },
  created() {
    this.getStockList(false);
  },
  methods: {
    priceClass(stock) {
      if (stock.changePercent < 0) {
        return 'price-down';
      } else {
        return 'price-up';
      }
    },
    reset(){
      this.searchCode="";
      this.searchName="";
      this.searchType="";
    },
    getStockList(resetPage = true) {
      if (resetPage) {
        this.currentPage = 1; // 仅在手动搜索时重置页码
      }
      this.isLoading = true;
      const params = {
        page: this.currentPage,
        pageSize: this.pageSize,
        stockCode: this.searchCode,
        stockName: this.searchName,
        stockType: this.searchType // 添加 stockType 参数
      };
      stockList(params).then(response => {
        this.stocks = response.data.stocks;
        this.total = response.data.total;
        this.isLoading = false;
      });
      this.saveSearchParams();
    },
    saveSearchParams() {
      localStorage.setItem('stockType', this.searchType);
      localStorage.setItem('stockName', this.searchName);
      localStorage.setItem('stockCode', this.searchCode);
      localStorage.setItem('currentPage', this.currentPage);
    },
    goDetail(stockId) {
      this.$router.push({ path: `/stock/${stockId}` });
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.getStockList(false);
    }
  }
}
</script>

<style scoped>
.stock-title .stock-type {
  color: blue; /* 设置股票类型为蓝色 */
  margin-left: 10px; /* 增加与股票代码的间距 */
}

.stock-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.stock-card {
  position: relative;
  margin: 7px;
  padding-left: 15px;
  padding-right: 10px;
  width: 60%;
  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
    box-sizing: border-box;
    border: 1px solid #2e95ff;
    transition: clip-path .5s ease-in-out;
  }
  &::before {
    clip-path: inset(0 75% 60% 0);
  }
  &::after {
    clip-path: inset(60% 0 0 75%);
  }
  &:hover {
    &::before,
    &::after {
      clip-path: inset(0 0 0 0);
    }
  }
}

 .stock-card .el-card__body{
         padding: 15px;
       }

.current-price {
  float: right;
  font-size: 22px;
  margin-right: 10px;
  font-weight: bold;
}

.change-percent {
  float: right;
  font-size: 14px;
  margin-right: 10px;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.price-down {
  color: #01b301;
}

.price-up {
  color: red;
}

.stock-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 0;
}

p {
  margin-top: 3px;
  margin-bottom: 0;
}

.info {
  padding-top: 5px;
}

.search-input {
  width: 20%;
}

 .search-input .el-input__inner {
         border-radius: 10px;
       }

.search-input-name {
  width: 50%;
}

 .search-input-name .el-input__inner {
         border-radius: 10px;
       }

.el-button {
  border-radius: 10px;
}

.search-container {
  display: flex;
  justify-content: space-between;
  width: 60%;
  margin: 0 auto 10px;
}

.search-select {
  width: 20%;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
