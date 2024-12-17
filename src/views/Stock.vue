<template>
  <v-container class="fill-height pa-0">
    <v-row class="fill-height">
      <v-col cols="12" class="pa-0 d-flex flex-column">
        <!-- Header com título e botões -->
        <div class="d-flex align-center px-2 mb-6">
          <v-icon
            class="mr-3"
            size="32"
            color="grey darken-2"
          >
            mdi-package-variant
          </v-icon>
          <h1 class="text-h4 font-weight-light grey--text text--darken-2">
            Estoque
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
                  @click="openEntryDialog()"
                >
                  <v-icon>mdi-plus-circle-outline</v-icon>
                </v-btn>
              </template>
              <span>Entrada de Estoque</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="mr-2"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="openDialog()"
                >
                  <v-icon>mdi-package-variant-plus</v-icon>
                </v-btn>
              </template>
              <span>Novo Produto</span>
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

        <!-- Container da tabela -->
        <div class="table-container mx-2">
          <v-data-table
            :headers="headers"
            :items="products"
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
                    label="Buscar produto..."
                    dense
                    outlined
                    hide-details
                    clearable
                  ></v-text-field>
                </v-col>
              </v-row>
            </template>

            <template #[`item.price`]="{ item }">
              R$ {{ item.price.toFixed(2) }}
            </template>

            <template #[`item.cost_price`]="{ item }">
              R$ {{ item.cost_price.toFixed(2) }}
            </template>

            <template #[`item.stock`]="{ item }">
              <v-chip
                :color="getStockColor(item)"
                small
                label
                class="stock-chip"
              >
                {{ item.stock }}
              </v-chip>
            </template>

            <template #[`item.supplier`]="{ item }">
              {{ item.supplier?.name || 'Não definido' }}
            </template>

            <template #[`item.image_url`]="{ item }">
              <v-avatar size="40" v-if="item.image_url">
                <v-img :src="item.image_url" contain></v-img>
              </v-avatar>
              <span v-else>-</span>
            </template>

            <template #[`item.color`]="{ item }">
              {{ item.color || 'Não definido' }}
            </template>

            <template #[`item.size`]="{ item }">
              {{ item.size || 'Não definido' }}
            </template>

            <template #[`item.variants`]="{ item }">
              <v-btn
                icon
                small
                @click="viewVariants(item)"
              >
                <v-icon small>mdi-format-list-bulleted</v-icon>
              </v-btn>
            </template>

            <template #[`item.actions`]="{ item }">
              <div class="d-flex justify-center">
                <v-icon 
                  small 
                  class="mr-2 action-icon"
                  @click="openDialog(item)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon 
                  small 
                  class="mr-2 action-icon"
                  @click="viewHistory(item)"
                >
                  mdi-history
                </v-icon>
                <v-icon 
                  small 
                  class="action-icon"
                  @click="deleteProduct(item)"
                >
                  mdi-delete
                </v-icon>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container class="pa-0">
            <v-row>
              <v-col cols="4" class="pr-4">
                <div class="image-upload-container">
                  <v-img
                    v-if="imagePreview"
                    :src="imagePreview"
                    height="200"
                    contain
                    class="grey lighten-4 rounded"
                  ></v-img>
                  <div v-else class="empty-image-container grey lighten-4 rounded">
                    <v-icon size="48" color="grey darken-2">mdi-camera</v-icon>
                    <span class="mt-2 grey--text text--darken-2">Inserir uma foto</span>
                  </div>
                  <v-file-input
                    v-model="productImage"
                    class="mt-2"
                    label="Selecionar foto"
                    accept="image/*"
                    prepend-icon=""
                    append-icon="mdi-camera"
                    @change="handleProductImageUpload"
                    dense
                    outlined
                    hide-details
                  ></v-file-input>
                </div>
              </v-col>

              <v-col cols="8">
                <v-row dense>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.name"
                      label="Nome"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => !!v || 'Nome é obrigatório']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-select
                      v-model="editedItem.product_type"
                      :items="productTypes"
                      item-text="text"
                      item-value="text"
                      label="Tipo de Produto"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => !!v || 'Tipo é obrigatório']"
                      @change="generateSku"
                    ></v-select>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      v-model="editedItem.sku"
                      label="SKU"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      disabled
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      v-model.number="editedItem.min_stock"
                      label="Estoque Mínimo"
                      type="number"
                      min="0"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      v-model.number="editedItem.price"
                      label="Preço de Venda"
                      prefix="R$"
                      type="number"
                      step="0.01"
                      min="0"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => v > 0 || 'Preço deve ser maior que zero']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      v-model.number="editedItem.cost_price"
                      label="Preço de Custo"
                      prefix="R$"
                      type="number"
                      step="0.01"
                      min="0"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => v > 0 || 'Custo deve ser maior que zero']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-autocomplete
                      v-model="editedItem.supplier_id"
                      :items="suppliers"
                      item-text="name"
                      item-value="id"
                      label="Fornecedor"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                    ></v-autocomplete>
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="editedItem.description"
                      label="Descrição"
                      rows="3"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      auto-grow
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="pb-4 px-6">
          <v-spacer></v-spacer>
          <v-btn 
            text 
            color="black" 
            class="text-none letter-spacing-2"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn 
            text 
            color="success" 
            class="text-none letter-spacing-2"
            @click="saveProduct"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEntry" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Entrada de Estoque</span>
        </v-card-title>

        <v-card-text>
          <v-container class="pa-0">
            <v-row>
              <v-col cols="4" class="pr-4">
                <div class="image-upload-container">
                  <v-img
                    v-if="imagePreview"
                    :src="imagePreview"
                    height="200"
                    contain
                    class="grey lighten-4 rounded"
                  ></v-img>
                  <div v-else class="empty-image-container grey lighten-4 rounded">
                    <v-icon size="48" color="grey darken-2">mdi-camera</v-icon>
                    <span class="mt-2 grey--text text--darken-2">Inserir uma foto</span>
                  </div>
                  <v-file-input
                    v-model="productImage"
                    class="mt-2"
                    label="Selecionar foto"
                    accept="image/*"
                    prepend-icon=""
                    append-icon="mdi-camera"
                    @change="handleImageUpload"
                    dense
                    outlined
                    hide-details
                  ></v-file-input>
                </div>
              </v-col>

              <v-col cols="8">
                <v-row dense>
                  <v-col cols="12">
                    <v-autocomplete
                      v-model="stockEntry.generic_product_id"
                      :items="genericProducts"
                      item-text="name"
                      item-value="id"
                      label="Produto"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => !!v || 'Produto é obrigatório']"
                      @change="updateEntryDetails"
                    ></v-autocomplete>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      v-model="stockEntry.color"
                      label="Cor"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => !!v || 'Cor é obrigatória']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6">
                    <v-select
                      v-model="stockEntry.size"
                      :items="sizeOptions"
                      label="Tamanho"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => !!v || 'Tamanho é obrigatório']"
                    ></v-select>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      v-model.number="stockEntry.quantity"
                      label="Quantidade"
                      type="number"
                      min="1"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => v > 0 || 'Quantidade deve ser maior que zero']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      v-model.number="stockEntry.unit_cost"
                      label="Custo Unitário"
                      prefix="R$"
                      type="number"
                      step="0.01"
                      min="0"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => v > 0 || 'Custo deve ser maior que zero']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-text-field
                      v-model="stockEntry.invoice_number"
                      label="Número da Nota Fiscal"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="pb-4 px-6">
          <v-spacer></v-spacer>
          <v-btn 
            text 
            color="black" 
            class="text-none letter-spacing-2"
            @click="closeEntryDialog"
          >
            Cancelar
          </v-btn>
          <v-btn 
            text 
            color="success" 
            class="text-none letter-spacing-2"
            @click="saveStockEntry"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogHistory" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Histórico do Produto - {{ selectedProduct?.name }}</span>
        </v-card-title>

        <v-card-text>
          <v-tabs v-model="activeTab">
            <v-tab>Entradas</v-tab>
            <v-tab>Saídas</v-tab>
          </v-tabs>

          <v-tabs-items v-model="activeTab">
            <v-tab-item>
              <v-data-table
                :headers="entryHeaders"
                :items="stockHistory.entries"
                :loading="loadingHistory"
                class="mt-4"
              >
                <template #[`item.unit_cost`]="{ item }">
                  R$ {{ item.unit_cost.toFixed(2) }}
                </template>
                <template #[`item.total_cost`]="{ item }">
                  R$ {{ item.total_cost.toFixed(2) }}
                </template>
                <template #[`item.created_at`]="{ item }">
                  {{ new Date(item.created_at).toLocaleDateString() }}
                </template>
              </v-data-table>
            </v-tab-item>

            <v-tab-item>
              <v-data-table
                :headers="saleHeaders"
                :items="stockHistory.sales"
                :loading="loadingHistory"
                class="mt-4"
              >
                <template #[`item.unit_price`]="{ item }">
                  R$ {{ item.unit_price.toFixed(2) }}
                </template>
                <template #[`item.total`]="{ item }">
                  R$ {{ item.total.toFixed(2) }}
                </template>
                <template #[`item.created_at`]="{ item }">
                  {{ new Date(item.created_at).toLocaleDateString() }}
                </template>
              </v-data-table>
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black" text @click="closeHistory">
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Tem certeza que deseja desativar este produto?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black" text @click="closeDelete">Não</v-btn>
          <v-btn color="error" text @click="deleteItemConfirm">Sim</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <product-variants
      v-model="showVariants"
      :product="selectedProduct"
      @show-snackbar="$emit('show-snackbar', $event)"
    />
  </v-container>
</template>

<style scoped>
.stock-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: 0.2em;
  color: black;
  text-transform: uppercase;
}

.text-button {
  letter-spacing: 0.05em;
  text-transform: none;
  font-weight: 400;
}

.custom-table {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
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

.search-field >>> .v-input__slot {
  background-color: white !important;
}

.stock-chip {
  font-weight: 400;
  letter-spacing: 0.05em;
}

.v-dialog >>> .v-card {
  border-radius: 0;
}

.v-dialog >>> .v-card__title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 0.1em;
  padding: 20px;
}

.v-text-field >>> .v-label {
  font-size: 0.9rem;
  letter-spacing: 0.05em;
}

.v-dialog >>> .v-btn {
  text-transform: none;
  letter-spacing: 0.05em;
}

.image-upload-container {
  text-align: center;
}

.empty-image-container {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(0, 0, 0, 0.2);
}

/* Ajustes para campos densos */
:deep(.v-text-field.v-text-field--enclosed .v-text-field__details) {
  margin-bottom: 0;
}

:deep(.v-input--dense.v-text-field--outlined .v-input__slot) {
  min-height: 40px;
}

.action-icon {
  color: rgba(0, 0, 0, 0.6);
  transition: color 0.2s ease;
}

.action-icon:hover {
  color: rgba(0, 0, 0, 0.9);
}

/* Ajuste para a coluna de ações */
:deep(.v-data-table td[class*="actions"]) {
  width: 120px;
  text-align: center;
}

/* Ajuste para centralizar o conteúdo das células também */
:deep(.v-data-table td) {
  text-align: center !important;
  vertical-align: middle !important;
}

/* Exceção para a coluna de nome que deve permanecer alinhada à esquerda */
:deep(.v-data-table td[class*="name"]) {
  text-align: left !important;
}

:deep(.v-data-table th[class*="name"]) {
  text-align: left !important;
}

.table-container {
  height: calc(98vh - 140px); /* Ajuste este valor conforme necessário */
  position: relative;
  overflow: hidden;
}

.custom-table {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  height: 100%;
}

/* Ajuste para fixar o cabeçalho e permitir rolagem apenas no corpo da tabela */
:deep(.v-data-table__wrapper) {
  max-height: calc(100% - 115px); /* Ajuste para o footer da tabela */
  overflow-y: auto;
}

:deep(.v-data-table > .v-data-table__wrapper > table) {
  width: 100%;
  table-layout: fixed;
}
</style>

<script>
import { supabase } from '@/plugins/supabase'
import * as XLSX from 'xlsx';
import ProductVariants from '@/components/ProductVariants'

export default {
  name: 'StockManager',

  components: {
    ProductVariants
  },

  data: () => ({
    search: '',
    loading: false,
    loadingHistory: false,
    dialog: false,
    dialogDelete: false,
    dialogEntry: false,
    dialogHistory: false,
    activeTab: 0,
    headers: [
      { 
        text: '', 
        value: 'variants',
        sortable: false,
        width: '50px'
      },
      { text: 'Nome', value: 'name', class: 'text-subtitle-2' },
      { text: 'Tipo', value: 'product_type', class: 'text-subtitle-2' },
      { text: 'SKU', value: 'sku', class: 'text-subtitle-2' },
      { text: 'Preço', value: 'price', class: 'text-subtitle-2' },
      { text: 'Custo', value: 'cost_price', class: 'text-subtitle-2' },
      { text: 'Estoque', value: 'stock', class: 'text-subtitle-2' },
      { text: 'Fornecedor', value: 'supplier', class: 'text-subtitle-2' },
      { text: 'Imagem', value: 'image_url', class: 'text-subtitle-2' },
      { 
        text: 'Ações', 
        value: 'actions', 
        sortable: false, 
        class: 'text-subtitle-2',
        width: '120px',
        align: 'center'
      }
    ],
    entryHeaders: [
      { text: 'Data', value: 'created_at' },
      { text: 'Quantidade', value: 'quantity' },
      { text: 'Custo Unit.', value: 'unit_cost' },
      { text: 'Total', value: 'total_cost' },
      { text: 'NF', value: 'invoice_number' }
    ],
    saleHeaders: [
      { text: 'Data', value: 'created_at' },
      { text: 'Quantidade', value: 'quantity' },
      { text: 'Preço Unit.', value: 'unit_price' },
      { text: 'Total', value: 'total' }
    ],
    products: [],
    suppliers: [],
    stockHistory: {
      entries: [],
      sales: []
    },
    selectedProduct: null,
    editedIndex: -1,
    editedItem: {
      name: '',
      description: '',
      sku: '',
      price: 0,
      cost_price: 0,
      min_stock: 10,
      supplier_id: null,
      image_url: '',
      product_type: '',
      activate: true
    },
    defaultItem: {
      name: '',
      description: '',
      sku: '',
      price: 0,
      cost_price: 0,
      min_stock: 10,
      supplier_id: null,
      image_url: '',
      product_type: '',
      activate: true
    },
    stockEntry: {
      generic_product_id: null,
      supplier_id: null,
      quantity: 1,
      unit_cost: 0,
      invoice_number: '',
      color: null,
      size: null,
      image_url: null
    },
    defaultStockEntry: {
      generic_product_id: null,
      supplier_id: null,
      quantity: 1,
      unit_cost: 0,
      invoice_number: '',
      color: null,
      size: null,
      image_url: null
    },
    colorOptions: [
      'Preto',
      'Branco',
      'Azul',
      'Vermelho',
      'Verde',
      'Amarelo',
      'Rosa',
      'Roxo',
      'Marrom',
      'Cinza'
    ],
    sizeOptions: [
      'PP',
      'P',
      'M',
      'G',
      'GG',
      'XG',
      'XXG',
      'Tamanho Único'
    ],
    productImage: null,
    imagePreview: null,
    productTypes: [
      { text: 'Camisola', prefix: 'CAM' },
      { text: 'Sutiã', prefix: 'SUT' },
      { text: 'Calcinha', prefix: 'CAL' },
      { text: 'Body', prefix: 'BOD' },
      { text: 'Baby Doll', prefix: 'BBD' },
      { text: 'Lingerie', prefix: 'LIN' },
      { text: 'Pijama', prefix: 'PIJ' },
      { text: 'Robe', prefix: 'ROB' },
      { text: 'Espartilho', prefix: 'ESP' },
      { text: 'Conjunto', prefix: 'CNJ' },
      { text: 'Modelador', prefix: 'MOD' },
      { text: 'Short Doll', prefix: 'SHD' },
      { text: 'Cinta Liga', prefix: 'CTL' }
    ],
    genericProducts: [],
    showVariants: false
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Novo Produto' : 'Editar Produto'
    }
  },

  mounted() {
    this.fetchProducts()
    this.fetchSuppliers()
    this.fetchGenericProducts()
  },

  methods: {
    getStockColor(item) {
      if (item.stock <= 0) return 'error'
      if (item.stock <= item.min_stock) return 'warning'
      return 'success'
    },

    async fetchProducts() {
      this.loading = true
      const { data, error } = await supabase
        .from('generic_products')
        .select(`
          *,
          supplier:supplier_id (
            id,
            name
          )
        `)
        .eq('activate', true)
        .order('name')

      if (error) {
        console.error('Error fetching products:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao carregar produtos',
          color: 'error'
        })
      } else {
        this.products = data
      }
      this.loading = false
    },

    async fetchSuppliers() {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Error fetching suppliers:', error)
      } else {
        this.suppliers = data
      }
    },

    async fetchGenericProducts() {
      try {
        const { data, error } = await supabase
          .from('generic_products')
          .select('*')
          .order('name')

        if (error) throw error
        this.genericProducts = data
      } catch (error) {
        console.error('Error fetching generic products:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao carregar produtos genéricos',
          color: 'error'
        })
      }
    },

    async viewHistory(item) {
      try {
        this.selectedProduct = item
        this.dialogHistory = true
        this.loadingHistory = true

        // Primeiro, buscar todos os produtos (variações) com o mesmo SKU
        const { data: variants, error: variantsError } = await supabase
          .from('products')
          .select('id')
          .eq('sku', item.sku)
          .eq('activate', true)

        if (variantsError) throw variantsError

        if (!variants || variants.length === 0) {
          this.stockHistory = {
            entries: [],
            sales: []
          }
          return
        }

        // Extrair os IDs das variações
        const variantIds = variants.map(v => v.id)

        // Buscar entradas de estoque para todas as variações
        const { data: entries, error: entriesError } = await supabase
          .from('stock_entries')
          .select('*')
          .in('product_id', variantIds)
          .order('created_at', { ascending: false })

        // Buscar vendas para todas as variações
        const { data: sales, error: salesError } = await supabase
          .from('sale_items')
          .select('*')
          .in('product_id', variantIds)
          .order('created_at', { ascending: false })

        if (entriesError || salesError) {
          throw entriesError || salesError
        }

        this.stockHistory = {
          entries: entries || [],
          sales: sales || []
        }
      } catch (error) {
        console.error('Error fetching history:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao carregar histórico',
          color: 'error'
        })
      } finally {
        this.loadingHistory = false
      }
    },

    updateSupplier() {
      const product = this.products.find(p => p.id === this.stockEntry.product_id)
      if (product) {
        this.stockEntry.supplier_id = product.supplier_id
      }
    },

    openDialog(item) {
      this.editedIndex = item ? this.products.indexOf(item) : -1
      this.editedItem = item ? Object.assign({}, item) : Object.assign({}, this.defaultItem)
      this.productImage = null
      this.imagePreview = item ? item.image_url : null
      
      if (!item) {
        this.editedItem.sku = ''
      }
      
      this.dialog = true
    },

    openEntryDialog() {
      this.stockEntry = Object.assign({}, this.defaultStockEntry)
      this.dialogEntry = true
    },

    closeDialog() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeEntryDialog() {
      this.dialogEntry = false
      this.imagePreview = null
      this.productImage = null
      this.$nextTick(() => {
        this.stockEntry = Object.assign({}, this.defaultStockEntry)
      })
    },

    async saveProduct() {
      try {
        const productData = {
          name: this.editedItem.name,
          description: this.editedItem.description,
          sku: this.editedItem.sku,
          price: this.editedItem.price,
          cost_price: this.editedItem.cost_price,
          min_stock: this.editedItem.min_stock,
          supplier_id: this.editedItem.supplier_id,
          product_type: this.editedItem.product_type,
          image_url: this.editedItem.image_url,
          activate: true
        }

        if (this.editedIndex > -1) {
          const { error } = await supabase
            .from('generic_products')
            .update(productData)
            .eq('id', this.editedItem.id)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('generic_products')
            .insert([productData])

          if (error) throw error
        }

        this.closeDialog()
        await this.fetchProducts()
        this.$emit('show-snackbar', {
          text: 'Produto salvo com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error saving product:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao salvar produto',
          color: 'error'
        })
      }
    },

    async saveStockEntry() {
      try {
        const genericProduct = this.genericProducts.find(
          p => p.id === this.stockEntry.generic_product_id
        )
        
        if (!genericProduct) throw new Error('Produto não encontrado')

        // Primeiro, verificar se já existe um produto com essa combinação
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('generic_product_id', this.stockEntry.generic_product_id)
          .eq('color', this.stockEntry.color)
          .eq('size', this.stockEntry.size)
          .single()

        let productId

        if (!existingProduct) {
          // Criar novo produto na tabela products
          const { data: newProduct, error: insertError } = await supabase
            .from('products')
            .insert([{
              generic_product_id: this.stockEntry.generic_product_id,
              name: genericProduct.name,
              description: genericProduct.description,
              sku: genericProduct.sku,
              price: genericProduct.price,
              cost_price: this.stockEntry.unit_cost,
              min_stock: genericProduct.min_stock,
              supplier_id: genericProduct.supplier_id,
              color: this.stockEntry.color,
              size: this.stockEntry.size,
              image_url: this.stockEntry.image_url,
              product_type: genericProduct.product_type,
              stock: 0
            }])
            .select()
            .single()

          if (insertError) throw insertError
          productId = newProduct.id
        } else {
          productId = existingProduct.id
        }

        // Registrar entrada de estoque
        const { error: entryError } = await supabase
          .from('stock_entries')
          .insert([{
            product_id: productId,
            supplier_id: genericProduct.supplier_id,
            quantity: this.stockEntry.quantity,
            unit_cost: this.stockEntry.unit_cost,
            total_cost: this.stockEntry.quantity * this.stockEntry.unit_cost,
            invoice_number: this.stockEntry.invoice_number
          }])

        if (entryError) throw entryError

        this.closeEntryDialog()
        await this.fetchProducts()
        this.$emit('show-snackbar', {
          text: 'Entrada registrada com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error saving stock entry:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao registrar entrada',
          color: 'error'
        })
      }
    },

    deleteProduct(item) {
      this.editedIndex = this.products.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async deleteItemConfirm() {
      try {
        const { error } = await supabase
          .from('generic_products')
          .update({ activate: false })
          .eq('id', this.editedItem.id)

        if (error) throw error

        this.products.splice(this.editedIndex, 1)
        this.closeDelete()
        this.$emit('show-snackbar', {
          text: 'Produto removido com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error deactivating product:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao remover produto',
          color: 'error'
        })
      }
    },

    async handleImageUpload() {
      if (!this.productImage) {
        this.imagePreview = null;
        this.stockEntry.image_url = null;
        return;
      }

      // Criar preview da imagem
      this.imagePreview = URL.createObjectURL(this.productImage);

      // Upload para o Supabase
      try {
        const file = this.productImage;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('Comprovantes')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('Comprovantes')
          .getPublicUrl(filePath);

        this.stockEntry.image_url = data.publicUrl;
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        this.$emit('show-snackbar', {
          text: 'Erro ao fazer upload da imagem. Verifique o console para mais detalhes.',
          color: 'error'
        });
      }
    },

    getTypePrefix(productType) {
      const type = this.productTypes.find(t => t.text === productType)
      return type ? type.prefix : ''
    },

    async generateSku() {
      if (!this.editedItem.product_type) return

      const prefix = this.getTypePrefix(this.editedItem.product_type)
      
      try {
        // Busca todos os SKUs do mesmo tipo
        const { data, error } = await supabase
          .from('products')
          .select('sku')
          .like('sku', `${prefix}%`)
          .order('sku', { ascending: false })
          .limit(1)

        if (error) throw error

        let nextNumber = 1
        if (data && data.length > 0) {
          // Extrai o número do último SKU e incrementa
          const lastSku = data[0].sku
          const lastNumber = parseInt(lastSku.substring(3))
          nextNumber = lastNumber + 1
        }

        // Formata o novo SKU (ex: CAM0001)
        this.editedItem.sku = `${prefix}${nextNumber.toString().padStart(4, '0')}`
      } catch (error) {
        console.error('Erro ao gerar SKU:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao gerar SKU',
          color: 'error'
        })
      }
    },

    async updateEntryDetails() {
      const genericProduct = this.genericProducts.find(
        p => p.id === this.stockEntry.generic_product_id
      )
      if (genericProduct) {
        this.stockEntry.unit_cost = genericProduct.cost_price
        this.stockEntry.supplier_id = genericProduct.supplier_id
      }
    },

    exportData() {
      try {
        const exportData = this.products.map(product => ({
          Nome: product.name,
          Tipo: product.product_type,
          SKU: product.sku,
          Preço: `R$ ${product.price.toFixed(2)}`,
          Custo: `R$ ${product.cost_price.toFixed(2)}`,
          Estoque: product.stock,
          'Estoque Mínimo': product.min_stock,
          Fornecedor: product.supplier?.name || 'Não definido'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);

        const colWidths = [
          { wch: 40 }, // Nome
          { wch: 15 }, // Tipo
          { wch: 15 }, // SKU
          { wch: 15 }, // Preço
          { wch: 15 }, // Custo
          { wch: 10 }, // Estoque
          { wch: 15 }, // Estoque Mínimo
          { wch: 30 }  // Fornecedor
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Produtos');

        const fileName = `estoque_${new Date().toISOString().split('T')[0]}.xlsx`;
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

    async handleProductImageUpload() {
      if (!this.productImage) {
        this.imagePreview = null;
        this.editedItem.image_url = null;
        return;
      }

      // Create image preview
      this.imagePreview = URL.createObjectURL(this.productImage);

      // Upload to Supabase
      try {
        const file = this.productImage;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('Comprovantes')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('Comprovantes')
          .getPublicUrl(filePath);

        this.editedItem.image_url = data.publicUrl;
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        this.$emit('show-snackbar', {
          text: 'Erro ao fazer upload da imagem. Verifique o console para mais detalhes.',
          color: 'error'
        });
      }
    },

    viewVariants(item) {
      this.selectedProduct = item
      this.showVariants = true
    },

    closeHistory() {
      this.dialogHistory = false
      this.selectedProduct = null
      this.stockHistory = {
        entries: [],
        sales: []
      }
    }
  }
}
</script> 