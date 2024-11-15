<template>
  <div>
    <nav-menu></nav-menu>
    <div class="stock-container">
      <div class="stock">
        <h2 style="margin: 15px 0">{{ stockInfo.stockName }} ({{ stockInfo.stockCode }})
          <span class="stock-type">{{ stockCompany.stockType }}</span>
        </h2>
        <vue-kline :klineParams="klineParams" :klineData="klineData" ref="callMethods"
                   @refreshKlineData="refreshKlineData"></vue-kline>
        <el-button type="primary" size="small" @click="showCompanyInfo">查看公司信息</el-button>
      </div>

      <div class="user-info">
        <el-divider content-position="left"><span style="font-size: 18px; font-weight: bold">操作</span></el-divider>
        <div class="info">
          <span style="font-weight: bold">账户信息 </span>
          <span>余额: {{ tradeInfo.balance }}</span>
          <span>当前股价: {{ stockInfo.price}}</span>
          <span>持股数量: {{ tradeInfo.tradeInfo[0].quantity }}</span>
          <span>持仓市值: {{ tradeInfo.tradeInfo[0].value.toFixed(2) }}</span>
          <span>总投入: {{ tradeInfo.tradeInfo[0].cost.toFixed(2) }}</span>
          <span>获利: {{ tradeInfo.tradeInfo[0].earn.toFixed(2) }}</span>
          <span>总盈亏: {{ (tradeInfo.tradeInfo[0].profit).toFixed(2) }}</span>
        </div>
      </div>
      <div class="trade">
        <span style="font-weight: bold">股票交易</span>
        <div>
          <el-input-number v-model="buyNum" :min="100" size="small" step="100"></el-input-number>
          <el-button type="primary" size="small" plain @click="buy()"    @mousedown="onMouseDown"
                     @mouseup="onMouseUp"
                     @mouseleave="onMouseLeave"  class="custom-button">买入股票</el-button>
        </div>
        <div>
          <el-input-number v-model="sellNum" :min="100" size="small" step="100"></el-input-number>
          <el-button type="primary" size="small" plain @click="sell()"    @mousedown="onMouseDown"
                     @mouseup="onMouseUp"
                     @mouseleave="onMouseLeave" >卖出股票</el-button>
        </div>
      </div>
    </div>
    <el-dialog title="公司信息" :visible.sync="dialogVisible" width="50%">
      <div>
        <p><strong>公司名称:</strong> {{ stockCompany.stockName }}</p>
        <p><strong>股票类型:</strong> {{ stockCompany.stockType }}</p>
        <p><strong>公司简介:</strong> {{ stockCompany.companyIntro }}</p>
        <p><strong>市值:</strong> {{ stockCompany.market }}</p>
        <p><strong>流通市值:</strong> {{ stockCompany.floatMarket }}</p>
        <p><strong>上市日期:</strong> {{ stockCompany.listingDate }}</p>
        <p><strong>总股本:</strong> {{ stockCompany.shares }}</p>
        <p><strong>流通股本:</strong> {{ stockCompany.floatShares }}</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <!-- ChatGPT 聊天界面 -->
    <div class="chat-container">
      <el-divider content-position="left"><span style="font-size: 18px; font-weight: bold">聊天助手</span></el-divider>
      <div class="chat-messages">
        <div v-for="(msg, index) in chatMessages" :key="index" :class="{'user-message': msg.isUser, 'assistant-message': !msg.isUser}">
          {{ msg.text }}
        </div>
      </div>
      <el-input v-model="userInput" placeholder="请输入消息..." @keyup.enter="sendMessage"></el-input>
      <el-button type="primary" @click="sendMessage">发送</el-button>
    </div>
  </div>
</template>

<script>
import navMenu from "@/components/navmenu.vue";
import vueKline from "vue-kline";
import { userStockInfo } from "@/api/user";
import { buyStock, sellStock } from "@/api/trade";
import { stockHistory } from "@/api/stock";

export default {
  name: "stockPage",
  components: {
    'nav-menu': navMenu,
    vueKline,
  },
  data() {
    return {
      dialogVisible:false,
      stockId: 0,
      stockIdStr: null,
      buyNum: 1,
      sellNum: 1,
      isLoading: true,
      klineData: {},
      stockInfo: {},
      tradeInfo: {},
      stockCompany: {},
      klineParams: {
        width: 920,
        height: 400,
        theme: "light",
        language: "zh-cn",
        ranges: ["1d", "2h", "30m", "5m"],
        intervalTime: 3000,
        depthWidth: 50,
        count: 2
      },
      chatMessages: [],  // 聊天记录
      userInput: "",     // 用户输入
    }
  },
  created() {
    this.stockIdStr = this.$route.params.id;
    this.stockId = parseInt(this.$route.params.id);
    this.getInfo();
    this.getStockInfo();
  },
  mounted() {
    this.refreshKlineData(300000);
  },
  methods: {
    requestData() {
      this.isLoading = true;
      stockHistory(this.stockIdStr).then(res => {
        this.klineData = {
          lines: res.data.klines.lines.map(line => [
            new Date(line.time).getTime().toExponential(8),
            line.openPrice,
            line.maxPrice,
            line.minPrice,
            line.closePrice,
            line.volume
          ]),
          depths: {
            asks: res.data.klines.depths.asks.map(ask => [
              ask.price,
              ask.volume
            ]),
            bids: res.data.klines.depths.bids.map(bid => [
              bid.price,
              bid.volume
            ])
          }
        }
        this.$nextTick(() => {
          this.$refs.callMethods.kline.chartMgr.getChart().updateDataAndDisplay(res.data.klines.lines.map(line => [
            new Date(line.time).getTime().toExponential(8),
            line.openPrice,
            line.maxPrice,
            line.minPrice,
            line.closePrice,
            line.volume
          ]));
        });
      })
      this.isLoading = false;
    },
    refreshKlineData(option) {
      console.log(option)
      this.requestData();
    },
    getStockInfo() {
      stockHistory(this.stockIdStr).then(res => {
        this.stockInfo = res.data.stockSummary;
        this.stockCompany=res.data.stockSummary.stockCompany;

      })
    },
    showCompanyInfo() {
      // 点击查看公司信息时显示模态框
      this.dialogVisible = true;
    },
    getInfo() {
      userStockInfo(this.stockIdStr).then(res => {
        this.tradeInfo = res.data.tradeInfo.length === 0 ? {
          userName: res.data.userName,
          balance: res.data.balance,
          tradeInfo: [{
            quantity: 0,
            value: 0,
            profit: 0,
            cost: 0,
            earn: 0,
          }]
        } : res.data;
      })
    },
    async sendMessage() {
      this.chatMessages.push({text: this.userInput, isUser: true});
      const userMessage = this.userInput;
      this.userInput = "";

      try {
        const response = await fetch("https://api.chatanywhere.tech/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer sk-5HrY9HDaxQBx1dPDTUozf0mQ6MKwbUZlhZ8BjkRBeUia1QMb`
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [{role: "user", content: userMessage}]
          })
        });
        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        this.chatMessages.push({text: assistantMessage, isUser: false});
      } catch (error) {
        console.error("Error fetching response:", error);
        this.chatMessages.push({text: "助手暂时无法回复，请稍后再试。", isUser: false});
      }
    },
    async buy() {
      try {
        const response=await buyStock(this.stockId, this.buyNum);
        if(response.code!==200){
          this.$message({message: response.msg, type: 'warning'});
          return;
        }
        this.$message.success("购买股票成功！");
        await this.getInfo();
      } catch (err) {
        console.error(err);
        this.$message({message: '交易异常！请稍后再试', type: 'warning'});
      }
    },
    async sell() {
      try {
        const response=await sellStock(this.stockId, this.sellNum);
        if(response.code!==200){
          this.$message({message: response.msg, type: 'warning'});
          return;
        }
        this.$message.success("卖出股票成功！");
        await this.getInfo();
      } catch (err) {
        console.error(err);
        this.$message({message: '交易异常！请稍后再试', type: 'warning'});
      }
    },
    onMouseDown(event) {
      // 按下按钮时，设置点击的深色
      event.target.style.backgroundColor = '#2980b9'; // 点击时颜色
    },
    onMouseUp(event) {
      // 放开按钮时恢复颜色
      event.target.style.backgroundColor = '#409EFF'; // 恢复默认颜色
    },
    onMouseLeave(event) {
      // 鼠标离开按钮时恢复颜色
      event.target.style.backgroundColor = '#F0F0F0'; // 恢复默认颜色
    }
  },
}
</script>

<style scoped>
.stock-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.el-divider {
  background-color: #89c4fd;
  height: 1.2px;
}

.el-input-number {
  margin-right: 8px;
}

.stock {
  width: 60%;
}

.user-info {
  width: 60%;
  margin-top: 5px;
  margin-bottom: 30px;
}

.info {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 40px;
}

.trade {
  width: 60%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.chat-container {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.chat-messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.user-message {
  text-align: right;
  background-color: #e1f5fe;
  padding: 5px;
  border-radius: 5px;
  margin: 5px 0;
}

.assistant-message {
  text-align: left;
  background-color: #ffe0b2;
  padding: 5px;
  border-radius: 5px;
  margin: 5px 0;
}
 .stock-type {
  color: blue; /* 设置股票类型为蓝色 */
  margin-left: 10px; /* 增加与股票代码的间距 */
}



</style>
