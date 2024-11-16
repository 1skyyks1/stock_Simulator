<template>
  <div>
    <nav-menu></nav-menu>
    <div class="user-dashboard">
      <!-- 账户信息 -->
      <div class="account-overview">
        <h2>{{ account.username }}</h2>
        <div>
          <p>初始资金: 500000 元</p>
          <p>总资产: {{ account.balance }} 元</p>
          <p>总投入: {{ totalInvestment }} 元</p>
          <p>总市值: {{ totalMarketValue }} 元</p>
          <p :class="priceClass(account.profit)">总收益: {{ account.profit.toFixed(2) }} 元</p>
        </div>
      </div>

      <!-- 持仓信息 -->
      <div class="stock-holdings">
        <h2>持仓信息</h2>

<!--        &lt;!&ndash; 搜索框和按钮 &ndash;&gt;-->
<!--        <div style="margin-bottom: 20px; display: flex; align-items: center;">-->
<!--          <el-input-->
<!--              v-model="searchName"-->
<!--              placeholder="输入股票名称"-->
<!--             -->
<!--              clearable-->
<!--          ></el-input>-->
<!--          <el-input-->
<!--              v-model="searchCode"-->
<!--              placeholder="输入股票代码"-->
<!--              style="margin-right: 10px; width: 200px;"-->
<!--              clearable-->
<!--          ></el-input>-->
<!--          <el-button @click="searchStocks" type="primary">搜索</el-button>-->
<!--        </div>-->

        <el-table
            :data="paginatedTradeInfo"
            class="stock-name-link"
            @row-click="goDetail"
        >
          <el-table-column prop="stockName" label="股票名称"></el-table-column>
<!--          <el-table-column prop="stockCode" label="股票代码"></el-table-column>-->
          <el-table-column prop="quantity" label="当前持仓量"></el-table-column>
          <el-table-column prop="price" label="当前价格"></el-table-column>
          <el-table-column label="总市值">
            <template slot-scope="scope">
              {{ (scope.row.price * scope.row.quantity).toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="总投入"></el-table-column>
          <el-table-column prop="earn" label="获利"></el-table-column>

          <el-table-column label="总盈亏">
            <template slot-scope="scope">
              <span :class="priceClass(scope.row.profit)">
                {{ (scope.row.profit).toFixed(2) }} 元
              </span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="filteredTradeInfo.length"
            layout="total, sizes, prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { userInfo, userTradeHistory } from "@/api/user";
import navMenu from "@/components/navmenu.vue";

export default {
  name: "userPage",
  components: {
    'nav-menu': navMenu,
  },
  data() {
    return {
      account: {
        username: '用户名',
        balance: 100000, // 总资产
        profit: 2000,    // 总收益
        tradeInfo: [
          {
            stockId: 1,
            stockName: "美团",
            stockCode: "03690",
            cost: 8000,
            quantity: 40,
            price: 25,
            value: 10000,
            earn: 1000,
            profit: 3000,
          },
          {
            stockId: 2,
            stockName: "腾讯",
            stockCode: "00700",
            cost: 9000,
            quantity: 20,
            price: 40,
            value: 8000,
            earn: 0,
            profit: -1000,
          }
        ],
      },
      transactions: [
        // Some transaction data
      ],
      searchName: "",  // 搜索关键字
      searchCode: "",  // 搜索关键字
      currentPage: 1,   // 当前页
      pageSize: 10,     // 每页显示条数
    };
  },
  computed: {
    // 总市值计算
    totalMarketValue() {
      return this.account.tradeInfo.reduce((total, stock) => {
        return total + stock.price * stock.quantity;
      }, 0).toFixed(2);
    },
    // 总投入计算
    totalInvestment() {
      return this.account.tradeInfo.reduce((total, stock) => {
        return total + stock.cost;
      }, 0).toFixed(2);
    },
    // 根据搜索条件过滤后的持仓信息
    filteredTradeInfo() {
      return this.account.tradeInfo.filter(stock => {
        return (
            stock.stockName.includes(this.searchName) ||
            stock.stockCode.includes(this.searchCode)
        );
      });
    },
    // 分页后的持仓信息
    paginatedTradeInfo() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = this.currentPage * this.pageSize;
      return this.filteredTradeInfo.slice(startIndex, endIndex);
    }
  },
  methods: {
    priceClass(profit) {
      if (profit < 0) {
        return 'price-down';
      } else {
        return 'price-up';
      }
    },
    goDetail(row) {
      this.$router.push({ path: `/stock/${row.stockId}` });
    },
    // 当前页数改变
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    // 每页显示条数改变
    handleSizeChange(size) {
      this.pageSize = size;
    },
    searchStocks() {
      // 基于 stockName 和 stockCode 进行过滤
      this.filteredTradeInfo = this.account.tradeInfo.filter(stock => {
        const nameMatch = stock.stockName.toLowerCase().includes(this.searchName.toLowerCase());
        const codeMatch = stock.stockCode && stock.stockCode.includes(this.searchCode);
        return nameMatch && codeMatch;
      });
      // 重置分页
      this.currentPage = 1;
    },
    getUserInfo() {
      userInfo().then(response => {
        this.account = response.data;
      });
    },
    getHistory() {
      userTradeHistory().then(response => {
        this.transactions = response.data.history;
      });
    }
  },
  created() {
    this.getUserInfo();
    this.getHistory();
  }
};
</script>

<style scoped>
.user-dashboard {
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  justify-content: center;
}
.el-table th {
  border-bottom: none !important;
}
.el-table .cell {
  text-decoration: none !important;
}
.account-overview {
  background-color: #f0f0f0;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  min-width: 80%;
  max-width: 80%;
}
.stock-holdings {
  margin-top: 20px;
  min-width: 80%;
  max-width: 80%;
}
.price-down {
  color: #01b301; /* 当 profit 是负数时，价格显示绿色 */
}
.price-up {
  color: red; /* 当 profit 是正数时，价格显示红色 */
}
.stock-name-link {
  color: #409EFF;
  cursor: pointer;
}
</style>
