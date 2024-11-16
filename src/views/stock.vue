<template>
  <div>
    <nav-menu></nav-menu>
    <div class="stock-container">
      <div class="stock">
        <h2 style="margin: 15px 0">{{ stockInfo.stockName }} ({{ stockInfo.stockCode }})
          <span class="stock-type" style="font-size: 18px;" >{{ stockCompany.stockType }}</span>
          <el-button   style="margin-left: 420px" type="primary" size="small" @click="showPrediction">查看预测信息</el-button>
          <el-button   type="primary" size="small" @click="showCompanyInfo">查看公司信息</el-button>
        </h2>
        <vue-kline :klineParams="klineParams" :klineData="klineData" ref="callMethods"
                   @refreshKlineData="refreshKlineData"></vue-kline>
<!--        <div class="centered-button">-->
<!--         -->
<!--        </div>-->
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
      <div class="company-info-dialog">
        <div class="company-info-item">
          <p><strong>公司名称:</strong> {{ stockCompany.stockName }}</p>
        </div>
        <div class="company-info-item">
          <p><strong>股票类型:</strong> {{ stockCompany.stockType }}</p>
        </div>
        <div class="company-info-item">
          <p><strong>公司简介:</strong> {{ stockCompany.companyIntro }}</p>
        </div>
        <div class="company-info-item">
          <p><strong>市值:</strong> {{ stockCompany.market }}</p>
        </div>
        <div class="company-info-item">
          <p><strong>流通市值:</strong> {{ stockCompany.floatMarket }}</p>
        </div>
        <div class="company-info-item">
          <p><strong>上市日期:</strong> {{ stockCompany.listingDate }}</p>
        </div>
        <div class="company-info-item">
          <p><strong>总股本:</strong> {{ stockCompany.shares }}</p>
        </div>
        <div class="company-info-item">
          <p><strong>流通股本:</strong> {{ stockCompany.floatShares }}</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false" type="primary" size="medium">关闭</el-button>
    </span>
    </el-dialog>
    <el-dialog title="股票预测信息" :visible.sync="predictionVisible" width="50%">
      <div class="dialog-container">
        <!-- 左侧内容 -->
        <div class="prediction-left-section">
          <!-- 投资建议 -->
          <div class="prediction-investment-advice">
            <p><strong>投资建议：</strong> {{ stockInfo.investment || '暂无建议' }}</p>
          </div>
          <!-- 预测信息表格 -->
          <el-table :data="paginatedPrediction" style="width: 100%" stripe border>
            <el-table-column prop="formattedDate" label="时间" width="200"></el-table-column>
            <el-table-column prop="price" label="预测价格" width="150"></el-table-column>
          </el-table>
          <!-- 分页器 -->
          <el-pagination
              background
              layout="prev, pager, next"
              :current-page="currentPage"
              :page-size="pageSize"
              :total="formattedPrediction.length"
              @current-change="handlePageChange">
          </el-pagination>
        </div>

        <!-- 右侧聊天界面 -->
        <div class="prediction-right-section">
          <div class="prediction-chat-container">
            <el-divider content-position="left"><span style="font-size: 18px; font-weight: bold">智股预测AI</span></el-divider>
            <div class="prediction-chat-messages">
              <div
                  v-for="(msg, index) in chatMessages"
                  :key="index"
                  :class="{'prediction-user-message': msg.isUser, 'prediction-assistant-message': !msg.isUser}">
                {{ msg.text }}
              </div>
            </div>
            <el-input
                v-model="userInput"
                placeholder="请输入消息..."
                @keyup.enter="sendMessage">
            </el-input>
            <el-button type="primary" @click="sendMessage" style="display: block; margin: 10px auto 0;">发送</el-button>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="predictionVisible = false" type="primary" size="medium">关闭</el-button>
  </span>
    </el-dialog>
    <!-- ChatGPT 聊天界面 -->
    <div class="chat-container">
      <el-divider content-position="left"><span style="font-size: 18px; font-weight: bold">智股模拟AI</span></el-divider>
      <div class="chat-messages">
        <div v-for="(msg, index) in chatMessages" :key="index" :class="{'user-message': msg.isUser, 'assistant-message': !msg.isUser}">
          {{ msg.text }}
        </div>
      </div>
      <el-input v-model="userInput" placeholder="请输入消息..." @keyup.enter="sendMessage"></el-input>
      <el-button type="primary" @click="sendMessage" style="display: block; margin: 10px auto 0;">发送</el-button>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs"; // 时间格式化库，需要安装 dayjs
import navMenu from "@/components/navmenu.vue";
import vueKline from "vue-kline";
import { userStockInfo } from "@/api/user";
import { buyStock, sellStock } from "@/api/trade";
import {prediction, stockHistory} from "@/api/stock";
import router from "@/router";
import {Message} from "element-ui";

export default {
  name: "stockPage",
  components: {
    'nav-menu': navMenu,
    vueKline,
  },
  data() {
    return {
      currentPage: 1, // 当前页码
      pageSize: 8, // 每页显示条数
      formattedPrediction: [], // 格式化后的预测数据
      paginatedPrediction: [],
      prediction:[],
      dialogVisible:false,
      predictionVisible:false,
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
  async created() {
    try {
      this.stockIdStr = this.$route.params.id;
      this.stockId = parseInt(this.$route.params.id);
      await this.getInfo();
      await this.getStockInfo();
    } catch (error) {
      Message({
        message: 'Please log in',
        type: 'warning',
      });
      router.push("/login");
    }

  },
  mounted() {
    this.refreshKlineData(300000);
  },
  methods: {
    handlePageChange(page) {
      this.currentPage = page;
      const startIndex = (page - 1) * this.pageSize;
      const endIndex = page * this.pageSize;
      this.paginatedPrediction = this.formattedPrediction.slice(startIndex, endIndex);
    },
    // 初始化分页
    initPagination() {
      this.handlePageChange(1); // 默认展示第一页
    },
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
    async  getStockInfo() {
      // prediction(this.stockIdStr).then(res =>{
      //   if(res.msg==='用户未登录')
      //     router.push('/login');
      //   this.prediction=res.data.prediction;
      // })
      stockHistory(this.stockIdStr).then(res => {
        if(res.msg==='用户未登录')
          router.push('/login');
        this.stockInfo = res.data.stockSummary;
        this.stockCompany=res.data.stockSummary.stockCompany;

      })
    },
    showPrediction() {
      // 点击查看预测信息时显示模态框，并确保数据已加载
      this.predictionVisible = true;
      this.getPredictionData();
    },
    async getPredictionData() {
      try {
        const res = await prediction(this.stockIdStr);
        if (res.msg === "用户未登录") {
          router.push("/login");
          return;
        }
        this.prediction = res.data.prediction;

        // 格式化时间字段
        this.formattedPrediction = this.prediction.map(item => ({
          ...item,
          formattedDate: dayjs(item.time).format("YYYY-MM-DD"), // 使用 dayjs 格式化时间
        }));
        this.initPagination();
      } catch (err) {
        return;
      }
    },
    // showPrediction() {
    //   prediction(this.stockIdStr).then(res =>{
    //     if(res.msg==='用户未登录')
    //       router.push('/login');
    //     this.prediction=res.data.prediction;
    //   })
    //   // 点击查看公司信息时显示模态框
    //   this.predictionVisible = true;
    // },
    showCompanyInfo() {
      // 点击查看公司信息时显示模态框
      this.dialogVisible = true;
    },
    async getInfo() {
      const res=await userStockInfo(this.stockIdStr);
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
    },
    async sendMessage() {
      this.chatMessages.push({text: this.userInput, isUser: true});
      const userMessage = this.userInput;
      this.userInput = "";
      const stockInfoMessage = `
    当前股票信息如下:
    股票名称: ${this.stockInfo.stockName} (${this.stockInfo.stockCode})
    当前股价: ${this.stockInfo.price} 元
    市场总值: ${this.stockCompany.market} 元
    流通市值: ${this.stockCompany.floatMarket} 元
    总股本: ${this.stockCompany.shares} 股
    流通股本: ${this.stockCompany.floatShares} 股
    股票类型: ${this.stockCompany.stockType}
  `;

      // 构建历史交易数据
      const historicalDataMessage = `
  历史交易数据:
  ${this.klineData.lines.slice(0, 100).map(record => `
    日期: ${new Date(record[0]).toLocaleDateString()},
    开盘价: ${record[1]},
    收盘价: ${record[4]},
    成交量: ${record[5]} 股,
    成交金额: ${record[1] * record[5]} 元
  `).join("\n")}
`;

      // 合并股票信息和历史交易数据
      const fullMessage = `
    ${stockInfoMessage}
    ${historicalDataMessage}

    用户提问: ${userMessage}
  `;
      try {
        const response = await fetch("https://api.chatanywhere.tech/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer sk-5HrY9HDaxQBx1dPDTUozf0mQ6MKwbUZlhZ8BjkRBeUia1QMb`
          },
          body: JSON.stringify({
            model: "gpt-4",
                      messages: [
                        {role: "system", content: "你是一个股票助手，能够回答用户关于当前页面的股票信息和历史交易数据问题。"},
                        {role: "user", content: fullMessage}
                      ]
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
  //   async sendMessage() {
  //     this.chatMessages.push({text: this.userInput, isUser: true});
  //     const userMessage = this.userInput;
  //     this.userInput = "";
  //
  //     // 构建股票公司信息
  //     const stockInfoMessage = `
  //   当前股票信息如下:
  //   股票名称: ${this.stockInfo.stockName} (${this.stockInfo.stockCode})
  //   当前股价: ${this.stockInfo.price} 元
  //   市场总值: ${this.stockCompany.market} 元
  //   流通市值: ${this.stockCompany.floatMarket} 元
  //   总股本: ${this.stockCompany.shares} 股
  //   流通股本: ${this.stockCompany.floatShares} 股
  //   股票类型: ${this.stockCompany.stockType}
  // `;
  //
  //     // 构建历史交易数据
  //     const historicalDataMessage = `
  //   历史交易数据:
  //   ${this.stockHistory.map(record => `
  //     日期: ${record.date}, 开盘价: ${record.openPrice}, 收盘价: ${record.closePrice}, 成交量: ${record.volume} 股, 成交金额: ${record.amount} 元
  //   `).join("\n")}
  // `;
  //
  //     // 合并股票信息和历史交易数据
  //     const fullMessage = `
  //   ${stockInfoMessage}
  //   ${historicalDataMessage}
  //
  //   用户提问: ${userMessage}
  // `;
  //
  //     try {
  //       const response = await fetch("https://api.chatanywhere.tech/v1/chat/completions", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "Authorization": `Bearer sk-5HrY9HDaxQBx1dPDTUozf0mQ6MKwbUZlhZ8BjkRBeUia1QMb`
  //         },
  //         body: JSON.stringify({
  //           model: "gpt-4",
  //           messages: [
  //             {role: "system", content: "你是一个股票助手，能够回答用户关于当前页面的股票信息和历史交易数据问题。"},
  //             {role: "user", content: fullMessage}
  //           ]
  //         })
  //       });
  //
  //       const data = await response.json();
  //       this.chatMessages.push({text: data.choices[0].message.content, isUser: false});
  //     } catch (error) {
  //       console.error("Error fetching ChatGPT response", error);
  //     }
  //   }

    async buy() {
      if (this.buyNum % 100 !== 0) {
        this.$message({message:'买入数量必须是100的整数倍', type: 'warning'});
        return;
      }
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
      if (this.sellNum % 100 !== 0) {
        this.$message({message:'卖出数量必须是100的整数倍', type: 'warning'});
        return;
      }
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
.centered-button {
  text-align: center;
  margin-top: 20px;
}
.company-info-btn {
  margin-left: 500px; /* 你可以根据需要调整此数值 */
}

.company-info-dialog {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
}

.company-info-item {
  margin-bottom: 15px; /* 增加条目之间的间距 */
  font-size: 16px;
}

.company-info-item strong {
  color: #333; /* 强调字体颜色 */
}

.dialog-footer {
  text-align: center;
}

.el-button {
  width: 100px;
  border-radius: 5px;
  font-weight: bold;
}

/* 美化对话框样式 */
.investment-advice {
  background-color: #f5f7fa;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  font-size: 16px;
  line-height: 1.6;
  border: 1px solid #dcdfe6;
}

/* 表格样式调整 */
.el-table {
  margin-top: 10px;
}



.dialog-footer {
  text-align: center;
}

.dialog-container {
  display: flex;
  gap: 20px; /* 左右区域间的间距 */
}

.prediction-left-section {
  flex: 1; /* 左侧占 2 份宽度 */
}

.prediction-right-section {
  flex: 1; /* 右侧占 1 份宽度 */
  border-left: 1px solid #e4e4e4; /* 增加分割线 */
  padding-left: 20px;
}

.prediction-chat-container {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.prediction-chat-messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.prediction-user-message {
  text-align: right;
  background-color: #e1f5fe;
  padding: 5px;
  border-radius: 5px;
  margin: 5px 0;
}

.prediction-assistant-message {
  text-align: left;
  background-color: #ffe0b2;
  padding: 5px;
  border-radius: 5px;
  margin: 5px 0;
}

.prediction-investment-advice {
  background-color: #f5f7fa;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  font-size: 16px;
  line-height: 1.6;
  border: 1px solid #dcdfe6;
}

.el-table th {
  background-color: #f0f9ff;
  color: #333;
  font-weight: bold;
  text-align: center;
}

.el-table td {
  text-align: center;
}


</style>
