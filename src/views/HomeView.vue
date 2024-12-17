<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <!-- Hero Section - Atualizado para combinar com a estética da marca -->
        <v-card
          class="hero-section d-flex align-center justify-center"
          flat
          height="400"
        >
          <div class="text-center">
            <h1 class="brand-title mb-4">
              ESSENCE
            </h1>
            <p class="subtitle font-weight-light">
              Moda Íntima com Elegância
            </p>
          </div>
        </v-card>

        <!-- Quick Access Cards - Estilo atualizado -->
        <v-container class="mt-n12">
          <v-row>
            <!-- Cards existentes com estilos atualizados -->
            <v-col v-for="(card, index) in quickAccessCards" 
                   :key="index" 
                   cols="12" 
                   sm="6" 
                   md="3">
              <v-card
                class="mx-auto minimal-card"
                elevation="2"
                @click="$router.push(card.route)"
              >
                <v-card-text class="text-center pa-6">
                  <v-icon size="48" color="black">{{ card.icon }}</v-icon>
                  <h2 class="text-h6 mt-4 mb-2 card-title">{{ card.title }}</h2>
                  <p class="text-body-2 card-subtitle">
                    {{ card.subtitle }}
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>

        <!-- Statistics Section - Estilo atualizado -->
        <v-container class="mt-12">
          <v-row>
            <v-col v-for="(stat, index) in statistics" 
                   :key="index" 
                   cols="12" 
                   sm="6" 
                   md="3">
              <v-card class="mx-auto stat-card" outlined>
                <v-card-text class="text-center">
                  <div class="text-h4 font-weight-light stat-value">
                    {{ stat.value }}
                  </div>
                  <div class="text-subtitle-1 stat-label">
                    {{ stat.label }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { supabase } from '@/plugins/supabase'

export default {
  name: 'HomeView',

  data: () => ({
    quickAccessCards: [
      {
        icon: 'mdi-package-variant-closed',
        title: 'Estoque',
        subtitle: 'Gerencie produtos e estoque',
        route: '/stock'
      },
      {
        icon: 'mdi-account-group',
        title: 'Clientes',
        subtitle: 'Cadastro e histórico de clientes',
        route: '/customers'
      },
      {
        icon: 'mdi-truck-delivery',
        title: 'Fornecedores',
        subtitle: 'Gestão de fornecedores',
        route: '/suppliers'
      },
      {
        icon: 'mdi-cash-register',
        title: 'Vendas',
        subtitle: 'Registre e acompanhe suas vendas',
        route: '/sales'
      }
    ],
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    lowStock: 0
  }),

  computed: {
    statistics() {
      return [
        {
          value: this.totalProducts,
          label: 'Produtos Cadastrados'
        },
        {
          value: this.totalCustomers,
          label: 'Clientes Ativos'
        },
        {
          value: `R$ ${this.totalSales.toFixed(2)}`,
          label: 'Vendas do Mês'
        },
        {
          value: this.lowStock,
          label: 'Produtos em Baixa'
        }
      ]
    }
  },

  async mounted() {
    await this.fetchStatistics()
  },

  methods: {
    async fetchStatistics() {
      // Fetch total products and low stock
      const { data: products } = await supabase
        .from('products')
        .select('id, stock, min_stock')
      
      if (products) {
        this.totalProducts = products.length
        this.lowStock = products.filter(p => p.stock <= p.min_stock).length
      }

      // Fetch total customers
      const { count: customers } = await supabase
        .from('customers')
        .select('id', { count: 'exact' })
      
      this.totalCustomers = customers || 0

      // Calculate total sales for current month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: sales } = await supabase
        .from('sales')
        .select('total')
        .gte('created_at', startOfMonth.toISOString())
        .eq('status', 'completed')

      if (sales) {
        this.totalSales = sales.reduce((acc, sale) => acc + sale.total, 0)
      }
    }
  }
}
</script>

<style scoped>
.hero-section {
  background: white;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.brand-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 4rem;
  font-weight: 300;
  letter-spacing: 0.3em;
  color: black;
}

.subtitle {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  color: rgba(0, 0, 0, 0.6);
}

.minimal-card {
  background: white;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.minimal-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 0, 0, 0.3);
}

.card-title {
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 0.1em;
  color: black;
}

.card-subtitle {
  color: rgba(0, 0, 0, 0.6);
}

.stat-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.stat-value {
  font-family: 'Cormorant Garamond', serif;
  color: black;
}

.stat-label {
  font-family: 'Playfair Display', serif;
  color: rgba(0, 0, 0, 0.6);
}

@media (max-width: 600px) {
  .brand-title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}
</style>
