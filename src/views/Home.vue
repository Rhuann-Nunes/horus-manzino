<template>
  <v-container>
    <!-- Cabeçalho do Painel Financeiro -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon class="mr-3" size="32">
            mdi-finance
          </v-icon>
          <h2 class="text-h5 font-weight-regular">
            Painel Financeiro
          </h2>
        </div>
      </v-col>
    </v-row>

    <!-- Cards Financeiros (mantém os existentes) -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-card elevation="2" v-bind="attrs" v-on="on">
              <v-card-text>
                <div class="text-overline mb-1">Vendas Hoje</div>
                <div class="text-h4 mb-2">R$ {{ formatCurrency(todaySales) }}</div>
                <div class="text-caption grey--text">
                  <v-icon small :color="salesTrendColor">{{ salesTrendIcon }}</v-icon>
                  <span :class="`${salesTrendColor}--text`">{{ formatNumber(salesTrendPercentage) }}%</span>
                  em relação a ontem
                </div>
              </v-card-text>
            </v-card>
          </template>
          <div class="pa-2">
            <p class="mb-1"><strong>Vendas Hoje</strong></p>
            <p class="mb-1">Soma de todas as vendas realizadas hoje</p>
            <p class="mb-0"><strong>Cálculo:</strong> Soma do valor total de cada venda do dia</p>
            <p class="mb-0"><strong>Comparação:</strong> Diferença percentual em relação ao dia anterior</p>
          </div>
        </v-tooltip>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-card elevation="2" v-bind="attrs" v-on="on">
              <v-card-text>
                <div class="text-overline mb-1">Vendas do Mês</div>
                <div class="text-h4 mb-2">R$ {{ formatCurrency(monthSales) }}</div>
                <div class="text-caption grey--text">
                  {{ totalSalesMonth }} vendas realizadas
                </div>
              </v-card-text>
            </v-card>
          </template>
          <div class="pa-2">
            <p class="mb-1"><strong>Vendas do Mês</strong></p>
            <p class="mb-1">Total de vendas do mês atual</p>
            <p class="mb-0"><strong>Cálculo:</strong> Soma de todas as vendas desde o dia 1º até hoje</p>
            <p class="mb-0"><strong>Quantidade:</strong> Número total de vendas realizadas no mês</p>
          </div>
        </v-tooltip>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-card elevation="2" v-bind="attrs" v-on="on">
              <v-card-text>
                <div class="text-overline mb-1">Lucro do Mês</div>
                <div class="text-h4 mb-2" :class="monthProfit >= 0 ? 'success--text' : 'error--text'">
                  R$ {{ formatCurrency(monthProfit) }}
                </div>
                <div class="text-caption grey--text">
                  <v-icon small :color="profitTrendColor">{{ profitTrendIcon }}</v-icon>
                  <span :class="`${profitTrendColor}--text`">{{ formatNumber(profitMargin) }}%</span>
                  margem de lucro
                </div>
              </v-card-text>
            </v-card>
          </template>
          <div class="pa-2">
            <p class="mb-1"><strong>Lucro do Mês</strong></p>
            <p class="mb-1">Lucro líquido obtido no mês atual</p>
            <p class="mb-0"><strong>Cálculo:</strong> Vendas do mês - Custo dos produtos vendidos</p>
            <p class="mb-0"><strong>Margem:</strong> Percentual do lucro sobre as vendas totais</p>
            <p class="mb-0 font-italic">Verde = Lucro | Vermelho = Prejuízo</p>
          </div>
        </v-tooltip>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-card elevation="2" v-bind="attrs" v-on="on">
              <v-card-text>
                <div class="text-overline mb-1">Resultado Global</div>
                <div class="text-h4 mb-2" :class="globalResult >= 0 ? 'success--text' : 'error--text'">
                  R$ {{ formatCurrency(globalResult) }}
                </div>
                <div class="text-caption grey--text">
                  capital total investido em produtos
                </div>
              </v-card-text>
            </v-card>
          </template>
          <div class="pa-2">
            <p class="mb-1"><strong>Resultado Global</strong></p>
            <p class="mb-1">Resultado financeiro de todas as operações</p>
            <p class="mb-0"><strong>Cálculo:</strong> Total de vendas - Total de compras</p>
            <p class="mb-0"><strong>Contexto:</strong> Representa o lucro/prejuízo acumulado desde o início</p>
            <p class="mb-0 font-italic">Verde = Lucro acumulado | Vermelho = Prejuízo acumulado</p>
          </div>
        </v-tooltip>
      </v-col>
    </v-row>

    <!-- Gráfico Financeiro -->
    <v-row class="mt-6">
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <span>Histórico de Vendas</span>
            <v-spacer></v-spacer>
            <v-btn-toggle
              v-model="selectedPeriod"
              mandatory
              class="mr-2"
              dense
            >
              <v-btn
                small
                value="current"
                class="text-none"
              >
                Mês Atual
              </v-btn>
              <v-btn
                small
                value="2months"
                class="text-none"
              >
                2 Meses
              </v-btn>
              <v-btn
                small
                value="6months"
                class="text-none"
              >
                6 Meses
              </v-btn>
              <v-btn
                small
                value="12months"
                class="text-none"
              >
                12 Meses
              </v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <v-chart 
              ref="salesChart"
              class="chart" 
              :option="salesChartOption" 
              :autoresize="true"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2" class="h-100">
          <v-card-title class="chart-title">Top 5 Produtos</v-card-title>
          <v-card-text class="top-products-content">
            <v-list>
              <v-list-item v-for="product in topProducts" :key="product.id">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">
                    {{ product.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="d-flex justify-space-between mt-1">
                    <span>{{ product.quantity }} unidades</span>
                    <span class="success--text">R$ {{ formatCurrency(product.total) }}</span>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Divisor -->
    <v-divider class="my-8"></v-divider>

    <!-- Cabeçalho do Painel de Estoque -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon class="mr-3" size="32">
            mdi-package-variant
          </v-icon>
          <h2 class="text-h5 font-weight-regular">
            Painel de Estoque
          </h2>
        </div>
      </v-col>
    </v-row>

    <!-- Cards de Métricas de Estoque -->
    <v-row>
      <!-- Produtos em Estoque -->
      <v-col cols="12" sm="6" md="4">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-card elevation="2" v-bind="attrs" v-on="on">
              <v-card-text>
                <div class="text-overline mb-1">Total em Estoque</div>
                <div class="text-h4 mb-2">{{ totalProducts }}</div>
                <div class="text-caption grey--text">
                  produtos diferentes cadastrados
                </div>
              </v-card-text>
            </v-card>
          </template>
          <div class="pa-2">
            <p class="mb-1"><strong>Total de Produtos</strong></p>
            <p class="mb-0">Quantidade total de produtos diferentes no estoque</p>
          </div>
        </v-tooltip>
      </v-col>

      <!-- Valor em Estoque -->
      <v-col cols="12" sm="6" md="4">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-card elevation="2" v-bind="attrs" v-on="on">
              <v-card-text>
                <div class="text-overline mb-1">Valor em Estoque</div>
                <div class="text-h4 mb-2">R$ {{ formatCurrency(totalStockValue) }}</div>
                <div class="text-caption grey--text">
                  capital imobilizado
                </div>
              </v-card-text>
            </v-card>
          </template>
          <div class="pa-2">
            <p class="mb-1"><strong>Capital em Estoque</strong></p>
            <p class="mb-0">Valor total investido em produtos em estoque</p>
          </div>
        </v-tooltip>
      </v-col>

      <!-- Produtos em Baixa -->
      <v-col cols="12" sm="6" md="4">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-card elevation="2" v-bind="attrs" v-on="on">
              <v-card-text>
                <div class="text-overline mb-1">Produtos em Baixa</div>
                <div class="text-h4 mb-2">{{ lowStockCount }}</div>
                <div class="text-caption grey--text">
                  abaixo do estoque mínimo
                </div>
              </v-card-text>
            </v-card>
          </template>
          <div class="pa-2">
            <p class="mb-1"><strong>Produtos em Baixa</strong></p>
            <p class="mb-0">Quantidade de produtos abaixo do estoque mínimo</p>
          </div>
        </v-tooltip>
      </v-col>
    </v-row>

    <!-- Gráficos e Listas de Estoque -->
    <v-row class="mt-6">
      <!-- Gráfico de Produtos em Baixa -->
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Produtos Críticos</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="lowStockHeaders"
              :items="lowStockProducts"
              :items-per-page="5"
              hide-default-footer
              dense
            >
              <template v-slot:[`item.stock_status`]="{ item }">
                <v-chip
                  small
                  :color="getStockStatusColor(item)"
                  text-color="white"
                >
                  {{ getStockStatusText(item) }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Nova tabela após a tabela de Produtos Críticos -->
      <v-col cols="12" class="mt-6">
        <v-card elevation="2">
          <v-card-title>Análise de Liquidez</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="liquidityHeaders"
              :items="productsLiquidity"
              :items-per-page="5"
              dense
            >
              <template v-slot:[`item.liquidity_status`]="{ item }">
                <v-chip
                  small
                  :color="getLiquidityColor(item.liquidity_index)"
                  text-color="white"
                >
                  {{ getLiquidityText(item.liquidity_index) }}
                </v-chip>
              </template>
              <template v-slot:[`item.avg_sales`]="{ item }">
                {{ item.avg_sales.toFixed(1) }}/mês
              </template>
              <template v-slot:[`item.turnover_rate`]="{ item }">
                {{ item.turnover_rate.toFixed(1) }}x
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Adicionar após a tabela de liquidez -->
      <v-col cols="12" class="mt-6">
        <v-card elevation="2">
          <v-card-title>Distribuição de Vendas por Tamanho</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <v-chart class="chart" :option="sizeDistributionChart" :autoresize="true" />
              </v-col>
              <v-col cols="12" md="4">
                <v-list dense>
                  <v-list-item v-for="(value, size) in sizeDistribution" :key="size">
                    <v-list-item-content>
                      <v-list-item-title>{{ size }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ value.percentage.toFixed(1) }}% das vendas
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      {{ value.quantity }} un
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { supabase } from '@/plugins/supabase'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import { 
  GridComponent, 
  TooltipComponent, 
  LegendComponent,
  TitleComponent 
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer, 
  LineChart, 
  PieChart, 
  GridComponent, 
  TooltipComponent, 
  LegendComponent,
  TitleComponent
])

export default {
  name: 'HomeView',
  components: {
    VChart
  },
  data: () => ({
    todaySales: 0,
    monthSales: 0,
    totalSalesMonth: 0,
    salesTrendPercentage: 0,
    salesTrendColor: 'grey',
    salesTrendIcon: 'mdi-minus',
    monthProfit: 0,
    profitMargin: 0,
    profitTrendColor: 'grey',
    profitTrendIcon: 'mdi-minus',
    globalResult: 0,
    totalInventoryCost: 0,
    topProducts: [],
    selectedPeriod: 'current',
    salesChartOption: {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          if (!Array.isArray(params) || params.length === 0) return '';

          let result = params[0].axisValue + '<br/>';

          if (params[0]) {
            result += `<span style="display:inline-block;margin-right:4px;border-radius:50%;width:10px;height:10px;background-color:#666"></span>
                      Vendas: R$ ${new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(params[0].value || 0)}<br/>`;
          }

          if (params[1]) {
            result += `<span style="display:inline-block;margin-right:4px;border-radius:50%;width:10px;height:10px;background-color:#4CAF50"></span>
                      Lucro: R$ ${new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(params[1].value || 0)}`;
          }

          return result;
        }
      },
      legend: {
        data: ['Vendas', 'Lucro'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: [],
        axisLabel: {
          rotate: 45,
          interval: 'auto'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value) => {
            return `R$ ${new Intl.NumberFormat('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(value)}`
          }
        }
      },
      series: [
        {
          name: 'Vendas',
          data: [],
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.1
          },
          lineStyle: {
            width: 2,
            color: '#666'
          },
          itemStyle: {
            borderWidth: 2,
            color: '#666'
          }
        },
        {
          name: 'Lucro',
          data: [],
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.1
          },
          lineStyle: {
            width: 2,
            color: '#4CAF50'
          },
          itemStyle: {
            borderWidth: 2,
            color: '#4CAF50'
          }
        }
      ]
    },
    totalProducts: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    lowStockProducts: [],
    lowStockHeaders: [
      { 
        text: 'Produto', 
        value: 'name',
        align: 'left'
      },
      { 
        text: 'Estoque', 
        value: 'stock', 
        align: 'center'
      },
      { 
        text: 'Mínimo', 
        value: 'min_stock', 
        align: 'center'
      },
      { 
        text: 'Status', 
        value: 'stock_status', 
        align: 'center'
      },
      { 
        text: 'Última Venda', 
        value: 'last_sale', 
        align: 'center'
      }
    ],
    lowLiquidityCount: 0,
    productsLiquidity: [],
    liquidityHeaders: [
      { text: 'Produto', value: 'name', align: 'left' },
      { text: 'Estoque', value: 'stock', align: 'center' },
      { text: 'Vendas Médias', value: 'avg_sales', align: 'center' },
      { text: 'Taxa de Giro', value: 'turnover_rate', align: 'center' },
      { text: 'Status', value: 'liquidity_status', align: 'center' }
    ],
    sizeDistributionChart: {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [{
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        data: []
      }]
    },
    sizeDistribution: {}
  }),
  async created() {
    try {
      await this.loadDashboardData()
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    }
  },
  watch: {
    selectedPeriod: {
      handler(newPeriod) {
        this.loadSalesChart(newPeriod)
      }
    }
  },
  methods: {
    async loadDashboardData() {
      await Promise.all([
        this.loadSalesMetrics(),
        this.loadTopProducts(),
        this.loadSalesChart(),
        this.loadProfitMetrics(),
        this.loadGlobalResult(),
        this.loadStockMetrics(),
        this.loadSizeDistribution()
      ])
    },
    async loadSalesMetrics() {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      
      // Vendas de hoje
      const { data: todaySalesData } = await supabase
        .from('sales')
        .select('total')
        .eq('sale_date', today)

      // Vendas de ontem
      const { data: yesterdaySalesData } = await supabase
        .from('sales')
        .select('total')
        .eq('sale_date', yesterday)

      this.todaySales = todaySalesData?.reduce((acc, curr) => acc + curr.total, 0) || 0
      const yesterdaySales = yesterdaySalesData?.reduce((acc, curr) => acc + curr.total, 0) || 0

      // Cálculo da tendência
      if (yesterdaySales > 0) {
        this.salesTrendPercentage = (((this.todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1)
        this.salesTrendColor = this.salesTrendPercentage > 0 ? 'success' : 'error'
        this.salesTrendIcon = this.salesTrendPercentage > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'
      }

      // Vendas do mês
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0]
      
      const { data: monthSalesData } = await supabase
        .from('sales')
        .select('total')
        .gte('sale_date', firstDayOfMonth)

      this.monthSales = monthSalesData?.reduce((acc, curr) => acc + curr.total, 0) || 0
      this.totalSalesMonth = monthSalesData?.length || 0
    },
    async loadTopProducts() {
      try {
        const { data: sales, error } = await supabase
          .from('sale_items')
          .select(`
            quantity,
            unit_price,
            products (
              id,
              name,
              sku,
              generic_product_id
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Agrupar vendas por produto genérico
        const productSales = sales.reduce((acc, sale) => {
          const genericId = sale.products?.generic_product_id
          const sku = sale.products?.sku
          
          if (!genericId || !sku) return acc

          const key = `${genericId}-${sku}`
          if (!acc[key]) {
            acc[key] = {
              id: genericId,
              name: sale.products.name,
              sku: sku,
              quantity: 0,
              total: 0
            }
          }

          acc[key].quantity += sale.quantity
          acc[key].total += sale.quantity * sale.unit_price

          return acc
        }, {})

        // Converter para array e ordenar por total
        this.topProducts = Object.values(productSales)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
          .map(product => ({
            ...product,
            total: Math.round(product.total * 100) / 100 // Arredondar para 2 casas decimais
          }))

      } catch (error) {
        console.error('Erro ao carregar top produtos:', error)
        this.topProducts = []
      }
    },
    async loadSalesChart(period = 'current') {
      try {
        const today = new Date()
        let startDate = new Date()
        
        // Definir a data inicial baseado no período selecionado
        switch (period) {
          case 'current':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1)
            break
          case '2months':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            break
          case '6months':
            startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1)
            break
          case '12months':
            startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1)
            break
        }

        // Formatar as datas para o formato do banco
        const startDateStr = startDate.toISOString().split('T')[0]
        const endDateStr = today.toISOString().split('T')[0]

        // Buscar vendas com itens e custos em uma única consulta
        const { data: salesData, error } = await supabase
          .from('sales')
          .select(`
            id,
            sale_date,
            total,
            sale_items (
              quantity,
              unit_price,
              products (
                cost_price
              )
            )
          `)
          .gte('sale_date', startDateStr)
          .lte('sale_date', endDateStr)
          .order('sale_date')

        if (error) throw error

        // Criar mapa para agrupar vendas e lucros por data
        const dailyData = new Map()

        // Processar os dados de vendas e calcular lucros
        salesData?.forEach(sale => {
          const date = sale.sale_date
          const dailyTotal = sale.total
          let dailyCost = 0

          // Calcular custo total dos itens vendidos
          sale.sale_items?.forEach(item => {
            const costPrice = item.products?.cost_price || 0
            dailyCost += (costPrice * item.quantity)
          })

          // Calcular lucro
          const dailyProfit = dailyTotal - dailyCost

          // Adicionar ou atualizar dados no mapa
          if (!dailyData.has(date)) {
            dailyData.set(date, { sales: 0, profit: 0 })
          }
          const currentData = dailyData.get(date)
          currentData.sales += dailyTotal
          currentData.profit += dailyProfit
        })

        const dates = []
        const sales = []
        const profits = []

        // Preencher arrays com dados diários
        let currentDate = new Date(startDate)
        while (currentDate <= today) {
          const dateStr = currentDate.toISOString().split('T')[0]
          const formattedDate = currentDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
          }).replace('.', '')
          
          const dayData = dailyData.get(dateStr) || { sales: 0, profit: 0 }
          
          dates.push(formattedDate)
          sales.push(dayData.sales)
          profits.push(dayData.profit)

          currentDate.setDate(currentDate.getDate() + 1)
        }

        // Atualizar o gráfico
        const chartData = {
          ...this.salesChartOption,
          xAxis: {
            ...this.salesChartOption.xAxis,
            data: dates
          },
          series: [
            {
              ...this.salesChartOption.series[0],
              data: sales
            },
            {
              ...this.salesChartOption.series[1],
              data: profits
            }
          ]
        }

        this.salesChartOption = chartData

        this.$nextTick(() => {
          if (this.$refs.salesChart) {
            this.$refs.salesChart.$el.dispatchEvent(new Event('resize'))
          }
        })

      } catch (error) {
        console.error('Erro ao carregar gráfico:', error)
        // ... código de tratamento de erro ...
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    },
    
    formatNumber(value) {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value)
    },
    async loadProfitMetrics() {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0]
      
      // Buscar vendas do mês com os itens e custos
      const { data: salesData } = await supabase
        .from('sales')
        .select(`
          id,
          total,
          sale_items (
            quantity,
            unit_price,
            product_id,
            products (
              cost_price
            )
          )
        `)
        .gte('sale_date', firstDayOfMonth)

      if (salesData) {
        let totalRevenue = 0
        let totalCost = 0

        salesData.forEach(sale => {
          totalRevenue += sale.total
          
          sale.sale_items.forEach(item => {
            const costPrice = item.products?.cost_price || 0
            totalCost += (costPrice * item.quantity)
          })
        })

        this.monthProfit = totalRevenue - totalCost
        
        // Calcular margem de lucro
        if (totalRevenue > 0) {
          this.profitMargin = ((this.monthProfit / totalRevenue) * 100)
          this.profitTrendColor = this.profitMargin > 0 ? 'success' : 'error'
          this.profitTrendIcon = this.profitMargin > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'
        }
      }
    },
    async loadGlobalResult() {
      // Calcular custo total do estoque atual
      const { data: stockData } = await supabase
        .from('products')
        .select('stock, cost_price')
        .eq('activate', true)

      if (stockData) {
        this.totalInventoryCost = stockData.reduce((acc, item) => {
          return acc + (item.stock * item.cost_price)
        }, 0)
      }

      // Buscar todas as vendas (histórico completo)
      const { data: allSalesData } = await supabase
        .from('sales')
        .select('total')

      const totalSales = allSalesData?.reduce((acc, sale) => acc + sale.total, 0) || 0

      // Buscar todas as entradas de estoque (histórico completo)
      const { data: allEntriesData } = await supabase
        .from('stock_entries')
        .select('total_cost')

      const totalPurchases = allEntriesData?.reduce((acc, entry) => acc + entry.total_cost, 0) || 0

      // Resultado global = Vendas Totais - Compras Totais
      this.globalResult = totalSales - totalPurchases
    },
    getStockStatusColor(item) {
      return item.stock_status === 'out' ? 'error' : 'warning'
    },
    getStockStatusText(item) {
      return item.stock_status === 'out' ? 'Sem Estoque' : 'Estoque Baixo'
    },
    async loadStockMetrics() {
      try {
        const { data: products, error } = await supabase
          .from('generic_products')
          .select(`
            id,
            name,
            stock,
            min_stock,
            cost_price,
            products!generic_product_id (
              id,
              stock,
              cost_price,
              sale_items (
                id,
                quantity,
                created_at,
                unit_price
              )
            )
          `)
          .eq('activate', true)

        if (error) throw error

        // Total de produtos únicos (genéricos)
        this.totalProducts = products?.length || 0

        // Valor total em estoque
        this.totalStockValue = products?.reduce((acc, product) => {
          const variantsValue = product.products?.reduce((varAcc, variant) => {
            return varAcc + (variant.stock * variant.cost_price)
          }, 0) || 0
          return acc + variantsValue
        }, 0) || 0

        // Primeiro identificar produtos críticos
        const criticalProducts = products
          ?.filter(product => {
            const totalStock = product.products?.reduce((acc, variant) => acc + variant.stock, 0) || 0
            return totalStock <= product.min_stock
          })
          .map(product => {
            const totalStock = product.products?.reduce((acc, variant) => acc + variant.stock, 0) || 0
            const lastSale = product.products
              ?.flatMap(variant => variant.sale_items || [])
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

            return {
              id: product.id,
              name: product.name,
              stock: totalStock,
              min_stock: product.min_stock,
              stock_status: totalStock === 0 ? 'out' : 'low',
              last_sale: lastSale ? new Date(lastSale.created_at).toLocaleDateString('pt-BR') : 'Nunca vendido'
            }
          })
          .sort((a, b) => a.stock - b.stock) || []

        this.lowStockProducts = criticalProducts
        this.lowStockCount = criticalProducts.length

        // Calcular liquidez apenas para produtos críticos
        this.productsLiquidity = criticalProducts.map(criticalProduct => {
          const product = products.find(p => p.id === criticalProduct.id)
          if (!product) return null

          // Calcular vendas dos últimos 90 dias
          const ninetyDaysAgo = new Date()
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

          const recentSales = product.products
            ?.flatMap(variant => variant.sale_items || [])
            .filter(sale => new Date(sale.created_at) >= ninetyDaysAgo)

          const totalSales = recentSales?.reduce((acc, sale) => acc + sale.quantity, 0) || 0
          const avgSales = totalSales / 3 // Média mensal
          const totalStock = criticalProduct.stock
          
          // Taxa de giro ajustada
          const turnoverRate = totalStock === 0 ? 1 : totalSales / (totalStock + totalSales)

          // Calcular índice de liquidez
          const liquidityIndex = this.calculateLiquidityIndex(avgSales, turnoverRate)

          return {
            name: criticalProduct.name,
            stock: totalStock,
            avg_sales: avgSales,
            turnover_rate: turnoverRate,
            liquidity_index: liquidityIndex,
            status: criticalProduct.stock_status
          }
        })
        .filter(item => item !== null)
        .sort((a, b) => a.liquidity_index - b.liquidity_index)

        this.lowLiquidityCount = this.productsLiquidity.filter(p => p.liquidity_index < 0.3).length

        // Calcular distribuição de vendas por tamanho
        const sizeDistribution = {}
        const totalSales = this.productsLiquidity.reduce((acc, product) => acc + product.stock, 0)
        this.productsLiquidity.forEach(product => {
          const size = product.stock
          if (!sizeDistribution[size]) {
            sizeDistribution[size] = { quantity: 0, percentage: 0 }
          }
          sizeDistribution[size].quantity += product.stock
          sizeDistribution[size].percentage = (sizeDistribution[size].quantity / totalSales) * 100
        })
        this.sizeDistribution = Object.entries(sizeDistribution).map(([size, data]) => ({
          size: parseInt(size),
          quantity: data.quantity,
          percentage: data.percentage
        }))

      } catch (error) {
        console.error('Erro ao carregar métricas de estoque:', error)
        this.totalProducts = 0
        this.totalStockValue = 0
        this.lowStockCount = 0
        this.lowStockProducts = []
        this.lowLiquidityCount = 0
        this.productsLiquidity = []
        this.sizeDistribution = []
      }
    },
    calculateLiquidityIndex(avgSales, turnoverRate) {
      // Se não há vendas nos últimos 90 dias, liquidez é zero
      if (avgSales === 0) return 0

      // Se vendeu todo o estoque (turnoverRate alto), é alta liquidez
      if (turnoverRate >= 1) return 1

      // Pesos ajustados
      const salesWeight = 0.6      // Peso maior para média de vendas
      const turnoverWeight = 0.4   // Peso menor para taxa de giro

      // Normalizar valores (0 a 1)
      const normalizedSales = Math.min(avgSales / 5, 1)  // Considera 5 vendas/mês como bom
      const normalizedTurnover = Math.min(turnoverRate, 1)  // Considera giro de 1x como bom

      // Calcular índice ponderado
      return (normalizedSales * salesWeight) + (normalizedTurnover * turnoverWeight)
    },
    getLiquidityColor(index) {
      if (index >= 0.6) return 'success'    // Ajustado de 0.7 para 0.6
      if (index >= 0.3) return 'warning'    // Ajustado de 0.4 para 0.3
      return 'error'
    },
    getLiquidityText(index) {
      if (index >= 0.6) return 'Alta Liquidez'    // Ajustado de 0.7 para 0.6
      if (index >= 0.3) return 'Média Liquidez'   // Ajustado de 0.4 para 0.3
      return 'Baixa Liquidez'
    },
    async loadSizeDistribution() {
      try {
        // Buscar vendas com produtos e seus tamanhos
        const { data: saleItems, error } = await supabase
          .from('sale_items')
          .select(`
            quantity,
            product_id,
            products (
              size
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Lista de tamanhos padrão do sistema
        const validSizes = [
          'PP',
          'P',
          'M',
          'G',
          'GG',
          'XG',
          'XXG',
          'Tamanho Único'
        ]

        // Calcular totais por tamanho
        const sizeTotals = {}
        let totalQuantity = 0

        saleItems?.forEach(item => {
          const size = item.products?.size || 'Não definido'
          // Usar apenas tamanhos válidos
          if (validSizes.includes(size)) {
            if (!sizeTotals[size]) {
              sizeTotals[size] = { quantity: 0, percentage: 0 }
            }
            sizeTotals[size].quantity += item.quantity
            totalQuantity += item.quantity
          }
        })

        // Calcular percentuais
        Object.keys(sizeTotals).forEach(size => {
          sizeTotals[size].percentage = (sizeTotals[size].quantity / totalQuantity) * 100
        })

        // Ordenar por quantidade
        this.sizeDistribution = Object.fromEntries(
          Object.entries(sizeTotals).sort((a, b) => {
            // Ordenação personalizada baseada na sequência de tamanhos
            const sizeOrder = validSizes.reduce((acc, size, index) => {
              acc[size] = index
              return acc
            }, {})
            return sizeOrder[a[0]] - sizeOrder[b[0]]
          })
        )

        // Atualizar dados do gráfico
        this.sizeDistributionChart.series[0].data = Object.entries(this.sizeDistribution)
          .map(([size, data]) => ({
            name: size, // Usar o nome real do tamanho
            value: data.quantity,
            percentage: data.percentage
          }))

      } catch (error) {
        console.error('Erro ao carregar distribuição de tamanhos:', error)
      }
    }
  }
}
</script>

<style scoped>
.chart {
  height: 400px !important;
  width: 100%;
}

.h-100 {
  height: 472px !important;
}

.chart-title {
  height: 64px;
  display: flex;
  align-items: center;
}

.top-products-content {
  height: calc(100% - 64px);
  overflow-y: auto;
  padding: 0;
}

/* Estilo para os tooltips */
.v-tooltip__content {
  background-color: #424242 !important;
  color: white !important;
  border-radius: 4px !important;
  font-size: 12px !important;
  line-height: 1.4 !important;
  max-width: 300px !important;
}

.v-tooltip__content p {
  margin: 0;
  padding: 0;
}

.v-tooltip__content .font-italic {
  font-style: italic;
  font-size: 11px;
  opacity: 0.8;
  margin-top: 4px;
}

/* Adicionar estilos para o toggle button */
.v-btn-toggle {
  border: none !important;
}

.v-btn-toggle .v-btn {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  background-color: white !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

.v-btn-toggle .v-btn.v-item--active {
  background-color: #212121 !important;
  color: white !important;
}

/* Adicionar/atualizar estilos */
.chart {
  height: 400px;
  min-height: 400px;
  width: 100%;
}

/* Estilo para o card de top produtos */
.v-list-item {
  padding: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.v-list-item:last-child {
  border-bottom: none;
}

.v-list-item__subtitle {
  margin-top: 4px !important;
}

/* Garantir que o scroll só aparece quando necessário */
.v-card__text {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.3) transparent;
}

.v-card__text::-webkit-scrollbar {
  width: 6px;
}

.v-card__text::-webkit-scrollbar-track {
  background: transparent;
}

.v-card__text::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.3);
  border-radius: 3px;
}

/* Scroll personalizado */
.top-products-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.3) transparent;
}

.top-products-content::-webkit-scrollbar {
  width: 6px;
}

.top-products-content::-webkit-scrollbar-track {
  background: transparent;
}

.top-products-content::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.3);
  border-radius: 3px;
}
</style> 