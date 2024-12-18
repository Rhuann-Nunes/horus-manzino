<template>
  <v-container class="fill-height pa-0">
    <v-row class="fill-height">
      <v-col cols="12" class="pa-0 d-flex flex-column">
        <div class="d-flex align-center px-2 mb-6">
          <v-icon
            class="mr-3"
            size="32"
            color="grey darken-2"
          >
            mdi-cash-register
          </v-icon>
          <h1 class="text-h4 font-weight-light grey--text text--darken-2">
            Vendas
          </h1>
          <v-spacer></v-spacer>
          
          <!-- Botões de ação -->
          <div class="d-flex">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="mr-2"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="startNewSale"
                >
                  <v-icon>mdi-plus-circle-outline</v-icon>
                </v-btn>
              </template>
              <span>Nova Venda</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="exportData"
                >
                  <v-icon>mdi-download-outline</v-icon>
                </v-btn>
              </template>
              <span>Exportar Dados</span>
            </v-tooltip>
          </div>
        </div>

        <!-- Substituir o card da tabela por um container direto -->
        <div class="table-container mx-2" v-if="!isNewSale">
          <v-data-table
            :headers="headers"
            :items="sales"
            :loading="loading"
            :search="search"
            :items-per-page="50"
            :footer-props="{
              'items-per-page-options': [20, 30, 50, 100, -1],
              'items-per-page-text': 'Linhas por página:',
              'items-per-page-all-text': 'Todos'
            }"
            class="custom-table"
            fixed-header
            height="100%"
          >
            <template #top>
              <v-row class="px-4 pt-4">
                <v-col cols="12" sm="8" md="6" lg="4">
                  <v-text-field
                    v-model="search"
                    prepend-inner-icon="mdi-magnify"
                    label="Buscar venda..."
                    dense
                    outlined
                    hide-details
                    clearable
                  ></v-text-field>
                </v-col>
              </v-row>
            </template>

            <!-- Templates existentes permanecem os mesmos -->
            <template #[`item.customer`]="{ item }">
              {{ item.customer?.name || 'Cliente não encontrado' }}
            </template>

            <template #[`item.total`]="{ item }">
              R$ {{ item.total.toFixed(2) }}
            </template>

            <template #[`item.created_at`]="{ item }">
              {{ new Date(item.created_at).toLocaleDateString() }}
            </template>

            <template #[`item.status`]="{ item }">
              <v-chip :color="getStatusColor(item.status)" small>
                {{ item.status }}
              </v-chip>
            </template>

            <template #[`item.actions`]="{ item }">
              <v-icon small class="mr-2 action-icon" @click="viewSaleDetails(item)">
                mdi-eye
              </v-icon>
              <v-icon small class="action-icon" @click="deleteSale(item)" v-if="item.status === 'pendente'">
                mdi-delete
              </v-icon>
            </template>
          </v-data-table>
        </div>

        <!-- Substituir o formulário de nova venda -->
        <div class="table-container mx-2" v-else>
          <v-card class="fill-height d-flex flex-column">
            <v-card-title class="px-6 py-4">
              <span class="text-h5 font-weight-light">Nova Venda</span>
              <v-spacer></v-spacer>
              <v-btn color="black" text @click="cancelSale" class="text-capitalize">
                Cancelar
              </v-btn>
            </v-card-title>

            <v-card-text class="px-6 flex-grow-1 overflow-y-auto">
              <v-row>
                <v-col cols="8">
                  <!-- Seleção de Cliente -->
                  <v-autocomplete
                    v-model="currentSale.customer_id"
                    :items="customers"
                    item-text="name"
                    item-value="id"
                    label="Cliente"
                    :rules="[v => !!v || 'Cliente é obrigatório']"
                    required
                    dense
                    outlined
                  ></v-autocomplete>
                </v-col>
                <v-col cols="4">
                  <!-- Seleção de Método de Pagamento -->
                  <v-select
                    v-model="currentSale.payment_method"
                    :items="payment_methods"
                    label="Método de Pagamento"
                    :rules="[v => !!v || 'Método de pagamento é obrigatório']"
                    required
                    dense
                    outlined
                  ></v-select>
                </v-col>
                <v-col cols="4">
                  <!-- Campo de Data da Venda -->
                  <v-menu
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                    max-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="formattedSaleDate"
                        label="Data da Venda"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        :rules="[v => !!v || 'Data é obrigatória']"
                        required
                        dense
                        outlined
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="currentSale.sale_date"
                      @input="dateMenu = false"
                      :max="new Date().toISOString().substr(0, 10)"
                      locale="pt-BR"
                      scrollable
                      class="date-picker-sales"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>

              <!-- Lista de Produtos -->
              <v-simple-table class="mt-4 products-table">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left" style="min-width: 300px">Produto</th>
                      <th style="width: 150px">Cor</th>
                      <th style="width: 150px">Tamanho</th>
                      <th style="width: 120px">Quantidade</th>
                      <th style="width: 120px">Preço Unit.</th>
                      <th style="width: 120px">Total</th>
                      <th style="width: 80px">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in currentSale.items" :key="index">
                      <td class="text-left" style="min-width: 300px">
                        <div class="d-flex align-center">
                          <v-avatar size="40" class="mr-2" v-if="item.generic_product?.image_url || item.variant_image_url">
                            <v-img :src="item.variant_image_url || item.generic_product?.image_url" contain></v-img>
                          </v-avatar>
                          <div>
                            <div>{{ item.generic_product?.name || 'Selecionar produto' }}</div>
                            <div class="caption grey--text" v-if="item.generic_product?.sku">
                              SKU: {{ item.generic_product.sku }}
                            </div>
                            <v-btn
                              x-small
                              text
                              color="success"
                              @click="openProductGallery(index)"
                            >
                              {{ item.generic_product ? 'Trocar produto' : 'Escolher produto' }}
                            </v-btn>
                          </div>
                        </div>
                      </td>
                      <td style="width: 150px">
                        <v-select
                          v-model="item.color"
                          :items="item.availableColors"
                          label="Cor"
                          dense
                          :disabled="!item.generic_product"
                          @change="updateSelectedVariant(index)"
                          clearable
                        ></v-select>
                      </td>
                      <td style="width: 150px">
                        <v-select
                          v-model="item.size"
                          :items="item.availableSizes"
                          label="Tamanho"
                          dense
                          :disabled="!item.color"
                          @change="updateSelectedVariant(index)"
                          clearable
                        ></v-select>
                      </td>
                      <td style="width: 120px">
                        <v-text-field
                          v-model.number="item.quantity"
                          type="number"
                          min="1"
                          :max="item.availableStock"
                          @input="updateItemTotal(index)"
                          dense
                          :disabled="!item.product_id"
                          :rules="[
                            v => (v && v > 0) || 'Quantidade deve ser maior que 0',
                            v => (v <= item.availableStock) || `Máximo disponível: ${item.availableStock}`
                          ]"
                        ></v-text-field>
                      </td>
                      <td class="text-right" style="width: 120px">
                        R$ {{ item.unit_price.toFixed(2) }}
                      </td>
                      <td class="text-right" style="width: 120px">
                        R$ {{ item.total.toFixed(2) }}
                      </td>
                      <td class="text-center" style="width: 80px">
                        <v-icon 
                          small 
                          color="error"
                          @click="removeItem(index)"
                        >
                          mdi-delete
                        </v-icon>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="5" class="text-right font-weight-bold">Total:</td>
                      <td class="text-right font-weight-bold">
                        R$ {{ calculateTotal.toFixed(2) }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </template>
              </v-simple-table>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="px-6 py-4">
              <v-btn
                color="success"
                text
                @click="addItem"
                class="text-capitalize"
              >
                <v-icon left>mdi-plus</v-icon>
                Adicionar Produto
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                color="success"
                text
                :disabled="!isValidSale"
                @click="saveSale"
                class="text-capitalize letter-spacing-2"
              >
                Finalizar Venda
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Dialog de Detalhes da Venda -->
    <v-dialog v-model="dialogDetails" max-width="800px">
      <v-card class="pa-4">
        <v-card-title>
          <span class="text-h5" style="font-family: 'Cormorant Garamond', serif; font-weight: 300;">Detalhes da Venda</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="6">
              <strong>Cliente:</strong> {{ selectedSale?.customer?.name }}
            </v-col>
            <v-col cols="6">
              <strong>Data:</strong> 
              {{ selectedSale ? new Date(selectedSale.created_at).toLocaleDateString() : '' }}
            </v-col>
            <v-col cols="6">
              <strong>Método de Pagamento:</strong> 
              {{ selectedSale?.payment_method || 'Não informado' }}
            </v-col>
            <v-col cols="12">
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th class="text-right">Quantidade</th>
                      <th class="text-right">Preço Unit.</th>
                      <th class="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in saleItems" :key="item.id">
                      <td>{{ item.product?.name }}</td>
                      <td class="text-right">{{ item.quantity }}</td>
                      <td class="text-right">R$ {{ item.unit_price.toFixed(2) }}</td>
                      <td class="text-right">R$ {{ item.total.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" class="text-right font-weight-bold">Total:</td>
                      <td class="text-right font-weight-bold">
                        R$ {{ selectedSale?.total.toFixed(2) }}
                      </td>
                    </tr>
                  </tfoot>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black" text @click="dialogDetails = false">
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card class="pa-4">
        <v-card-title class="text-h5 font-weight-light">
          Tem certeza que deseja cancelar esta venda?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black" text @click="closeDelete" class="text-capitalize">Não</v-btn>
          <v-btn color="error" text @click="deleteItemConfirm" class="text-capitalize">Sim</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Adicione o diálogo da galeria de produtos -->
    <v-dialog v-model="dialogProduct" max-width="900px">
      <v-card class="product-gallery-dialog">
        <v-card-title class="headline white">
          Selecionar Produto
          <v-spacer></v-spacer>
          <v-text-field
            v-model="productSearch"
            append-icon="mdi-magnify"
            label="Buscar produto"
            single-line
            hide-details
            dense
            outlined
            class="ml-4"
            style="max-width: 300px"
          ></v-text-field>
        </v-card-title>

        <v-card-text class="pa-0">
          <v-container fluid class="grey lighten-4 fill-height">
            <v-row>
              <v-col 
                v-for="product in filteredProducts" 
                :key="product.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                class="pa-2"
              >
                <v-card
                  outlined
                  class="product-card d-flex flex-column"
                  :class="{
                    'selected': selectedProduct?.id === product.id,
                    'out-of-stock': !product.availableProducts?.length
                  }"
                  @click="selectProduct(product)"
                  height="320"
                >
                  <div class="product-overlay" v-if="selectedProduct?.id === product.id">
                    <v-icon large color="white">mdi-check-circle</v-icon>
                  </div>
                  
                  <v-img
                    :src="product.image_url || 'placeholder.jpg'"
                    height="200"
                    contain
                    class="grey lighten-2"
                  >
                    <template v-slot:placeholder>
                      <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                      >
                        <v-icon>mdi-image</v-icon>
                      </v-row>
                    </template>
                  </v-img>

                  <v-card-text class="pa-2">
                    <div class="subtitle-1 mb-1">{{ product.name }}</div>
                    <div class="d-flex justify-space-between align-center">
                      <div class="caption grey--text text--darken-1">
                        {{ product.product_type }}
                      </div>
                      <div class="subtitle-2 primary--text font-weight-bold">
                        R$ {{ product.availableProducts[0]?.price.toFixed(2) }}
                      </div>
                    </div>
                    <div class="mt-2 caption">
                      Estoque Total: {{ product.availableProducts.reduce((sum, p) => sum + p.stock, 0) }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="white pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="black"
            text
            @click="dialogProduct = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            text
            @click="confirmProductSelection"
            :disabled="!selectedProduct"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { supabase } from '@/plugins/supabase'
import * as XLSX from 'xlsx';

export default {
  name: 'SalesManager',

  data: () => ({
    search: '',
    loading: false,
    dialog: false,
    dialogDelete: false,
    dialogDetails: false,
    dialogProduct: false,
    isNewSale: false,
    headers: [
      { text: 'Cliente', value: 'customer' },
      { text: 'Total', value: 'total' },
      { text: 'Método de Pagamento', value: 'payment_method', width: '180px' },
      { text: 'Data', value: 'created_at' },
      { text: 'Status', value: 'status' },
      { text: 'Ações', value: 'actions', sortable: false }
    ],
    sales: [],
    customers: [],
    products: [],
    genericProducts: [],
    saleItems: [],
    selectedSale: null,
    currentSale: {
      customer_id: null,
      total: 0,
      payment_method: null,
      sale_date: new Date().toISOString().substr(0, 10),
      items: []
    },
    defaultSaleItem: {
      product_id: null,
      generic_product_id: null,
      generic_product: null,
      quantity: 1,
      unit_price: 0,
      total: 0,
      color: '',
      size: '',
      variant_image_url: null,
      availableColors: [],
      availableSizes: [],
      availableStock: 0,
    },
    productSearch: '',
    selectedProduct: null,
    currentItemIndex: null,
    payment_methods: [
      'Dinheiro',
      'Cartão de Crédito',
      'Cartão de Débito',
      'PIX',
      'Transferência Bancária'
    ],
    dateMenu: false,
  }),

  computed: {
    calculateTotal() {
      return this.currentSale.items.reduce((acc, item) => acc + item.total, 0)
    },
    
    formattedSaleDate() {
      if (!this.currentSale.sale_date) return ''
      const [year, month, day] = this.currentSale.sale_date.split('-')
      return `${day}/${month}/${year}`
    },

    isValidSale() {
      return this.currentSale.customer_id && 
             this.currentSale.items.length > 0 &&
             this.currentSale.payment_method &&
             this.currentSale.sale_date &&
             this.currentSale.items.every(item => 
               item.product_id && 
               item.quantity > 0 && 
               item.unit_price > 0
             )
    },

    filteredProducts() {
      if (!this.productSearch) return this.genericProducts
      const search = this.productSearch.toLowerCase()
      return this.genericProducts.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.product_type.toLowerCase().includes(search)
      )
    }
  },

  mounted() {
    this.fetchSales()
    this.fetchCustomers()
    this.fetchProducts()
  },

  methods: {
    getStatusColor(status) {
      const colors = {
        pendente: 'warning',
        completa: 'success',
        cancelada: 'error'
      }
      return colors[status] || 'grey'
    },

    async fetchSales() {
      this.loading = true
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customer_id (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching sales:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao carregar vendas',
          color: 'error'
        })
      } else {
        this.sales = data
      }
      this.loading = false
    },

    async fetchCustomers() {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Error fetching customers:', error)
      } else {
        this.customers = data
      }
    },

    async fetchProducts() {
      // Fetch generic products that are active and have products with stock
      const { data: genericData, error: genericError } = await supabase
        .from('generic_products')
        .select(`
          id,
          name,
          image_url,
          product_type,
          activate,
          products (
            id,
            price,
            stock,
            color,
            size
          )
        `)
        .eq('activate', true)  // Only active products
        .order('name')

      if (genericError) {
        console.error('Error fetching generic products:', genericError)
        return
      }

      // Filter and transform the data
      this.genericProducts = genericData
        .filter(gp => {
          // Only include generic products that have available products (stock > 0)
          const availableProducts = gp.products.filter(p => p.stock > 0)
          return availableProducts.length > 0
        })
        .map(gp => ({
          ...gp,
          availableProducts: gp.products.filter(p => p.stock > 0)
        }))
    },

    startNewSale() {
      this.isNewSale = true
      this.currentSale = {
        customer_id: null,
        total: 0,
        status: 'pendente',
        payment_method: null,
        sale_date: new Date().toISOString().substr(0, 10),
        items: [{ ...this.defaultSaleItem }]
      }
    },

    cancelSale() {
      this.isNewSale = false
      this.currentSale = {
        customer_id: null,
        total: 0,
        items: []
      }
    },

    addItem() {
      this.currentSale.items.push({ ...this.defaultSaleItem })
    },

    removeItem(index) {
      this.currentSale.items.splice(index, 1)
    },

    updateProductPrice(index) {
      const item = this.currentSale.items[index]
      const product = this.products.find(p => p.id === item.product_id)
      if (product) {
        item.unit_price = product.price
        this.updateItemTotal(index)
      }
    },

    updateItemTotal(index) {
      const item = this.currentSale.items[index]
      if (item.quantity && item.unit_price) {
        item.total = parseFloat((item.quantity * item.unit_price).toFixed(2))
      } else {
        item.total = 0
      }
    },

    async saveSale() {
      try {
        // Validações iniciais
        if (!this.currentSale.customer_id || 
            !this.currentSale.payment_method || 
            !this.currentSale.sale_date ||
            this.currentSale.items.length === 0) {
          throw new Error('Dados da venda incompletos')
        }

        const newSale = {
          customer_id: this.currentSale.customer_id,
          total: this.calculateTotal,
          status: 'completa',
          payment_method: this.currentSale.payment_method,
          sale_date: this.currentSale.sale_date
        }

        // Inserimos a venda
        const { data: sale, error: saleError } = await supabase
          .from('sales')
          .insert(newSale)
          .select()
          .single()

        if (saleError) throw saleError
        if (!sale) throw new Error('Erro ao criar venda: nenhum dado retornado')

        // Preparamos os itens da venda
        const saleItems = this.currentSale.items.map(item => ({
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price),
          total: parseFloat(item.total),
          color: item.color,
          size: item.size
        }))

        // Inserimos os itens da venda
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems)

        if (itemsError) {
          // Se houver erro ao inserir os itens, devemos deletar a venda
          await supabase
            .from('sales')
            .delete()
            .eq('id', sale.id)
          throw itemsError
        }

        this.isNewSale = false
        await this.fetchSales()
        this.$emit('show-snackbar', {
          text: 'Venda realizada com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error saving sale:', error)
        this.$emit('show-snackbar', {
          text: `Erro ao salvar venda: ${error.message}`,
          color: 'error'
        })
      }
    },

    async viewSaleDetails(sale) {
      this.selectedSale = sale
      this.dialogDetails = true
      
      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          *,
          product:product_id (
            name
          )
        `)
        .eq('sale_id', sale.id)

      if (error) {
        console.error('Error fetching sale items:', error)
      } else {
        this.saleItems = data
      }
    },

    deleteSale(item) {
      this.selectedSale = item
      this.dialogDelete = true
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.selectedSale = null
      })
    },

    async deleteItemConfirm() {
      try {
        const { error } = await supabase
          .from('sales')
          .update({ status: 'cancelada' })
          .eq('id', this.selectedSale.id)

        if (error) throw error

        this.closeDelete()
        this.fetchSales()
        this.$emit('show-snackbar', {
          text: 'Venda cancelada com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error cancelling sale:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao cancelar venda',
          color: 'error'
        })
      }
    },

    openProductGallery(index) {
      this.currentItemIndex = index
      this.selectedProduct = this.getProduct(this.currentSale.items[index].product_id)
      this.dialogProduct = true
    },

    async selectProduct(genericProduct) {
      this.selectedProduct = genericProduct
      
      // Resetar os valores do item atual
      const item = this.currentSale.items[this.currentItemIndex]
      item.color = ''
      item.size = ''
      item.quantity = 1
      item.product_id = null
      item.unit_price = 0
      item.total = 0
      item.availableColors = []
      item.availableSizes = []
      item.availableStock = 0
      
      // Buscar cores disponíveis com estoque
      const { data: variants, error } = await supabase
        .from('products')
        .select('color, stock')
        .eq('generic_product_id', genericProduct.id)
        .gt('stock', 0)

      if (error) {
        console.error('Error fetching colors:', error)
        return
      }

      // Atualizar cores disponíveis específicas para este item
      item.availableColors = [...new Set(variants.map(v => v.color))]
    },

    confirmProductSelection() {
      const item = this.currentSale.items[this.currentItemIndex]
      
      // Apenas definir o produto genérico e resetar cor/tamanho
      item.generic_product_id = this.selectedProduct.id
      item.generic_product = this.selectedProduct
      item.color = ''
      item.size = ''
      item.product_id = null
      item.unit_price = 0
      item.total = 0
      
      this.dialogProduct = false
    },

    getProduct(productId) {
      return this.products.find(p => p.id === productId)
    },

    exportData() {
      try {
        // Preparar os dados para exportação
        const exportData = this.sales.map(sale => ({
          'Cliente': sale.customer?.name || 'N/A',
          'Total': `R$ ${sale.total.toFixed(2)}`,
          'Método de Pagamento': sale.payment_method,
          'Data': new Date(sale.created_at).toLocaleDateString(),
          'Status': sale.status
        }));

        // Criar uma nova planilha
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Ajustar largura das colunas
        const colWidths = [
          { wch: 40 }, // Cliente
          { wch: 15 }, // Total
          { wch: 20 }, // Método de Pagamento
          { wch: 15 }, // Data
          { wch: 15 }  // Status
        ];
        ws['!cols'] = colWidths;

        // Criar um novo workbook e adicionar a planilha
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Vendas');

        // Gerar o arquivo e fazer o download
        const fileName = `vendas_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        this.$emit('show-snackbar', {
          text: 'Dados exportados com sucesso!',
          color: 'success'
        });
      } catch (error) {
        console.error('Erro ao exportar dados:', error);
        this.$emit('show-snackbar', {
          text: 'Erro ao exportar dados',
          color: 'error'
        });
      }
    },

    async updateSelectedVariant(index) {
      const item = this.currentSale.items[index]
      
      // Se a cor foi removida, resetar campos dependentes
      if (!item.color) {
        item.size = ''
        item.product_id = null
        item.unit_price = 0
        item.total = 0
        item.variant_image_url = null
        item.availableSizes = []
        item.availableStock = 0
        return
      }

      // Se tem cor selecionada, buscar tamanhos disponíveis
      if (item.color && !item.size) {
        const { data: variants, error } = await supabase
          .from('products')
          .select('size, stock')
          .eq('generic_product_id', item.generic_product_id)
          .eq('color', item.color)
          .gt('stock', 0)

        if (error) {
          console.error('Error fetching sizes:', error)
          return
        }

        item.availableSizes = [...new Set(variants.map(v => v.size))]
        return
      }

      // Se tem cor e tamanho selecionados, buscar a variante específica
      if (item.color && item.size) {
        const { data: variants, error } = await supabase
          .from('products')
          .select('*')
          .eq('generic_product_id', item.generic_product_id)
          .eq('color', item.color)
          .eq('size', item.size)
          .gt('stock', 0)
          .single()

        if (error) {
          console.error('Error finding variant:', error)
          this.$emit('show-snackbar', {
            text: 'Erro ao buscar variante do produto',
            color: 'error'
          })
          return
        }

        // Atualizar os dados do item com a variante encontrada
        item.product_id = variants.id
        item.unit_price = variants.price
        item.variant_image_url = variants.image_url
        item.availableStock = variants.stock
        this.updateItemTotal(index)
      }
    },
  }
}
</script>

<style scoped>
/* Estilos da tabela */
.custom-table {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  height: 100%;
}

.custom-table >>> .v-data-table-header th {
  font-weight: 500 !important;
  color: rgba(0, 0, 0, 0.8) !important;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center !important;
  vertical-align: middle !important;
  white-space: nowrap !important;
  padding: 0 16px !important;
}

.custom-table >>> .v-data-table__wrapper {
  border-radius: 4px;
}

/* Container da tabela */
.table-container {
  height: calc(98vh - 140px);
  position: relative;
  overflow: hidden;
}

/* Ajuste para fixar o cabeçalho e permitir rolagem apenas no corpo da tabela */
:deep(.v-data-table__wrapper) {
  max-height: calc(100% - 115px);
  overflow-y: auto;
}

:deep(.v-data-table > .v-data-table__wrapper > table) {
  width: 100%;
  table-layout: fixed;
}

/* Ajuste para a coluna de ações */
:deep(.v-data-table td[class*="actions"]) {
  width: 120px;
  text-align: center;
}

/* Ajuste para centralizar o conteúdo das células */
:deep(.v-data-table td) {
  text-align: center !important;
  vertical-align: middle !important;
}

/* Exceção para a coluna de nome que deve permanecer alinhada à esquerda */
:deep(.v-data-table td[class*="customer"]) {
  text-align: left !important;
}

:deep(.v-data-table th[class*="customer"]) {
  text-align: left !important;
}

/* Manter os estilos existentes */
.letter-spacing-2 {
  letter-spacing: 0.2em;
}

.action-icon {
  color: rgba(0, 0, 0, 0.6);
  transition: color 0.2s ease;
}

.action-icon:hover {
  color: rgba(0, 0, 0, 0.9);
}

.v-btn.v-btn--icon {
  transition: all 0.2s ease;
}

.v-btn.v-btn--icon:hover {
  transform: scale(1.1);
  color: var(--v-primary-base);
}

/* Ajustes para campos densos */
:deep(.v-text-field.v-text-field--enclosed .v-text-field__details) {
  margin-bottom: 0;
}

:deep(.v-input--dense.v-text-field--outlined .v-input__slot) {
  min-height: 40px;
}

/* Estilos específicos para o formulário de nova venda */
.product-card {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-card.selected {
  border-color: var(--v-success-base);
}

.product-card.out-of-stock {
  opacity: 0.6;
  cursor: not-allowed;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(76, 175, 80, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* Estilos para o formulário de nova venda */
.v-card {
  height: calc(98vh - 140px);
}

.overflow-y-auto {
  overflow-y: auto;
}

.products-table {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

/* Ajustes para campos do formulário */
:deep(.v-text-field.v-text-field--enclosed .v-text-field__details),
:deep(.v-select.v-select--enclosed .v-select__details),
:deep(.v-autocomplete.v-autocomplete--enclosed .v-autocomplete__details) {
  margin-bottom: 0;
  padding-bottom: 0;
}

:deep(.v-input--dense.v-text-field--outlined .v-input__slot),
:deep(.v-input--dense.v-select--outlined .v-input__slot),
:deep(.v-input--dense.v-autocomplete--outlined .v-input__slot) {
  min-height: 40px;
}

/* Ajuste para o scroll da tabela de produtos */
.products-table :deep(.v-data-table__wrapper) {
  max-height: calc(100vh - 500px);
  overflow-y: auto;
}

/* Update the dialog template section with fixed height and background color */
.product-gallery-dialog {
  display: flex;
  flex-direction: column;
  height: 90vh;
}

.product-gallery-dialog :deep(.v-card__text) {
  flex-grow: 1;
  overflow-y: auto;
  background-color: #f5f5f5; /* grey lighten-4 */
}

.product-card {
  height: 320px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: white;
}

.product-card :deep(.v-image) {
  height: 160px !important;
}

.product-card :deep(.v-card__text) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* Update existing product-card hover style */
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}

/* Update existing product-card.selected style */
.product-card.selected {
  border-color: var(--v-success-base) !important;
  border-width: 2px;
}

/* Update existing product-overlay style */
.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(76, 175, 80, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* Ajustes para a tabela de produtos no formulário de nova venda */
.products-table {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.products-table :deep(th) {
  font-weight: 500 !important;
  color: rgba(0, 0, 0, 0.8) !important;
  font-size: 0.875rem;
  white-space: nowrap;
  padding: 0 16px !important;
  height: 48px;
}

.products-table :deep(td) {
  padding: 8px 16px !important;
  vertical-align: top !important;
}

/* Ajuste para os selects e inputs dentro da tabela */
.products-table :deep(.v-input) {
  margin-top: 4px;
  margin-bottom: 4px;
}

.products-table :deep(.v-input__slot) {
  min-height: 32px !important;
}

/* Ajuste para o alinhamento vertical do conteúdo */
.products-table :deep(.v-data-table__wrapper) {
  max-height: none;
}

/* Ajuste para o espaçamento do botão de ação */
.products-table :deep(.v-btn) {
  margin: 0;
  padding: 0;
}

:deep(.date-picker-sales) {
  max-height: 380px !important;
}

:deep(.v-menu__content) {
  max-height: none !important;
}

:deep(.v-picker--date) {
  height: auto;
  max-height: 380px;
}

:deep(.v-picker--date > .v-picker__body) {
  height: auto;
  max-height: 330px;
}

/* Adicionar para garantir que o calendário tenha altura suficiente */
:deep(.v-date-picker-table) {
  height: auto;
  min-height: 290px;
}
</style> 