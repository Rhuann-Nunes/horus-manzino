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
            mdi-account-group
          </v-icon>
          <h1 class="text-h4 font-weight-light grey--text text--darken-2">
            Clientes
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
                  @click="openDialog()"
                >
                  <v-icon>mdi-plus-circle-outline</v-icon>
                </v-btn>
              </template>
              <span>Adicionar Cliente</span>
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
        <div class="table-container mx-2">
          <v-data-table
            :headers="headers"
            :items="customers"
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
                    label="Buscar cliente..."
                    dense
                    outlined
                    hide-details
                    clearable
                  ></v-text-field>
                </v-col>
              </v-row>
            </template>

            <template #[`item.actions`]="{ item }">
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
                @click="deleteCustomer(item)"
              >
                mdi-delete
              </v-icon>
            </template>

            <!-- Template para CPF -->
            <template #[`item.cpf`]="{ item }">
              {{ formatCPFDisplay(item.cpf) }}
            </template>

            <!-- Template para Telefone -->
            <template #[`item.phone`]="{ item }">
              {{ formatPhoneDisplay(item.phone) }}
            </template>
          </v-data-table>
        </div>
      </v-col>
    </v-row>

    <!-- Dialog para Adicionar/Editar -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card class="minimal-dialog">
        <v-card-title class="text-h5 font-weight-light pb-4">
          {{ formTitle }}
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
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
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.cpf"
                  label="CPF"
                  dense
                  outlined
                  hide-details="auto"
                  class="mb-2"
                  :rules="[v => !!v || 'CPF é obrigatório']"
                  maxlength="14"
                  @input="formatCPF"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.phone"
                  label="Telefone"
                  dense
                  outlined
                  hide-details="auto"
                  class="mb-2"
                  maxlength="15"
                  @input="formatPhone"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.address"
                  label="Endereço"
                  rows="3"
                  dense
                  outlined
                  hide-details="auto"
                  class="mb-2"
                  auto-grow
                ></v-textarea>
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
            @click="saveCustomer"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Histórico -->
    <v-dialog v-model="dialogHistory" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Histórico de Compras - {{ editedItem.name }}</span>
        </v-card-title>

        <v-card-text>
          <v-data-table
            :headers="historyHeaders"
            :items="purchaseHistory"
            :loading="loadingHistory"
            class="elevation-0"
          >
            <template #[`item.total`]="{ item }">
              R$ {{ item.total.toFixed(2) }}
            </template>
            <template #[`item.created_at`]="{ item }">
              {{ new Date(item.created_at).toLocaleDateString() }}
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black" text @click="dialogHistory = false">
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Tem certeza que deseja deletar este cliente?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black" text @click="closeDelete">Não</v-btn>
          <v-btn color="error" text @click="deleteItemConfirm">Sim</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { supabase } from '@/plugins/supabase'
import * as XLSX from 'xlsx';

export default {
  name: 'CustomersManager',

  data: () => ({
    search: '',
    loading: false,
    loadingHistory: false,
    dialog: false,
    dialogDelete: false,
    dialogHistory: false,
    headers: [
      { text: 'Nome', value: 'name' },
      { text: 'CPF', value: 'cpf' },
      { text: 'Telefone', value: 'phone' },
      { text: 'Ações', value: 'actions', sortable: false }
    ],
    historyHeaders: [
      { text: 'Data', value: 'created_at' },
      { text: 'Total', value: 'total' },
      { text: 'Status', value: 'status' }
    ],
    customers: [],
    purchaseHistory: [],
    editedIndex: -1,
    editedItem: {
      name: '',
      cpf: '',
      phone: '',
      address: ''
    },
    defaultItem: {
      name: '',
      cpf: '',
      phone: '',
      address: ''
    }
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Novo Cliente' : 'Editar Cliente'
    }
  },

  mounted() {
    this.fetchCustomers()
  },

  methods: {
    async fetchCustomers() {
      this.loading = true
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching customers:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao carregar clientes',
          color: 'error'
        })
      } else {
        this.customers = data
      }
      this.loading = false
    },

    async viewHistory(item) {
      this.editedItem = Object.assign({}, item)
      this.dialogHistory = true
      this.loadingHistory = true

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('customer_id', item.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching history:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao carregar histórico',
          color: 'error'
        })
      } else {
        this.purchaseHistory = data
      }
      this.loadingHistory = false
    },

    openDialog(item) {
      this.editedIndex = item ? this.customers.indexOf(item) : -1
      this.editedItem = item ? Object.assign({}, item) : Object.assign({}, this.defaultItem)
      
      // Aplica as máscaras se estiver editando um cliente existente
      if (item) {
        this.editedItem.cpf = this.formatCPFDisplay(this.editedItem.cpf)
        this.editedItem.phone = this.formatPhoneDisplay(this.editedItem.phone)
      }
      
      this.dialog = true
    },

    closeDialog() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async saveCustomer() {
      try {
        // Cria uma cópia do item editado
        const customerData = { ...this.editedItem };
        
        // Remove as máscaras
        customerData.cpf = customerData.cpf ? customerData.cpf.replace(/\D/g, '') : '';
        customerData.phone = customerData.phone ? customerData.phone.replace(/\D/g, '') : '';

        if (this.editedIndex > -1) {
          // Update
          const { error } = await supabase
            .from('customers')
            .update(customerData)
            .eq('id', customerData.id)

          if (error) throw error

          Object.assign(this.customers[this.editedIndex], this.editedItem)
        } else {
          // Insert
          const { data, error } = await supabase
            .from('customers')
            .insert([customerData])
            .select()

          if (error) throw error

          if (data && data[0]) {
            this.customers.push(data[0])
          }
        }

        this.closeDialog()
        this.$emit('show-snackbar', {
          text: 'Cliente salvo com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error saving customer:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao salvar cliente',
          color: 'error'
        })
      }
    },

    deleteCustomer(item) {
      this.editedIndex = this.customers.indexOf(item)
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
          .from('customers')
          .delete()
          .eq('id', this.editedItem.id)

        if (error) throw error

        this.customers.splice(this.editedIndex, 1)
        this.closeDelete()
        this.$emit('show-snackbar', {
          text: 'Cliente removido com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error deleting customer:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao remover cliente',
          color: 'error'
        })
      }
    },

    validateCPF(cpf) {
      cpf = cpf.replace(/[^\d]/g, '');
      
      if (cpf.length !== 11) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1+$/.test(cpf)) return false;
      
      let sum = 0;
      let remainder;
      
      // Validação do primeiro dígito
      for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(9, 10))) return false;
      
      // Validação do segundo dígito
      sum = 0;
      for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(10, 11))) return false;
      
      return true;
    },

    formatCPF(value) {
      if (!value) return ''
      value = value.replace(/\D/g, '')
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      this.editedItem.cpf = value
    },

    formatPhone(value) {
      if (!value) return ''
      value = value.replace(/\D/g, '')
      value = value.replace(/^(\d{2})(\d)/, '($1) $2')
      value = value.replace(/(\d{5})(\d)/, '$1-$2')
      this.editedItem.phone = value
    },

    formatCPFDisplay(cpf) {
      if (!cpf) return '-'
      
      // Remove tudo que não é número
      cpf = cpf.replace(/\D/g, '')
      
      // Aplica a máscara
      return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
    },

    formatPhoneDisplay(phone) {
      if (!phone) return '-'
      
      // Remove tudo que não é número
      phone = phone.replace(/\D/g, '')
      
      // Aplica a máscara
      if (phone.length === 11) {
        return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
      } else if (phone.length === 10) {
        return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
      }
      return phone
    },

    exportData() {
      try {
        // Preparar os dados para exportação
        const exportData = this.customers.map(customer => ({
          Nome: customer.name,
          CPF: this.formatCPFDisplay(customer.cpf),
          Telefone: this.formatPhoneDisplay(customer.phone),
          Endereço: customer.address || ''
        }));

        // Criar uma nova planilha
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Ajustar largura das colunas
        const colWidths = [
          { wch: 40 }, // Nome
          { wch: 15 }, // CPF
          { wch: 15 }, // Telefone
          { wch: 50 }  // Endereço
        ];
        ws['!cols'] = colWidths;

        // Criar um novo workbook e adicionar a planilha
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

        // Gerar o arquivo e fazer o download
        const fileName = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
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
    }
  }
}
</script>

<style scoped>
.letter-spacing-2 {
  letter-spacing: 0.2em;
}

.minimal-table {
  background: transparent !important;
}

.minimal-table >>> .v-data-table-header th {
  font-weight: 500 !important;
  color: rgba(0, 0, 0, 0.7) !important;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: #f5f5f5 !important;
}

.minimal-table >>> .v-data-table__wrapper {
  border-radius: 0 0 4px 4px;
}

.action-icon {
  color: rgba(0, 0, 0, 0.6);
  transition: all 0.2s ease;
}

.action-icon:hover {
  color: var(--v-primary-base);
  transform: scale(1.1);
}

.v-btn.v-btn--icon {
  transition: all 0.2s ease;
}

.v-btn.v-btn--icon:hover {
  transform: scale(1.1);
  color: var(--v-primary-base);
}

.search-field >>> .v-input__slot {
  background-color: white !important;
}

.minimal-dialog {
  border-radius: 8px;
}

.v-text-field >>> .v-label {
  font-size: 0.875rem;
  letter-spacing: 0.05em;
}

/* Ajustes para campos densos */
:deep(.v-text-field.v-text-field--enclosed .v-text-field__details) {
  margin-bottom: 0;
}

:deep(.v-input--dense.v-text-field--outlined .v-input__slot) {
  min-height: 40px;
}

/* Estilo para linhas da tabela */
.minimal-table >>> .v-data-table__wrapper tbody tr {
  transition: background-color 0.2s ease;
}

.minimal-table >>> .v-data-table__wrapper tbody tr:hover {
  background-color: #f5f5f5 !important;
}

/* Estilo para o loading da tabela */
.minimal-table >>> .v-data-table__progress {
  background: linear-gradient(to right, transparent, rgba(0,0,0,0.1), transparent);
}

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
:deep(.v-data-table td[class*="name"]) {
  text-align: left !important;
}

:deep(.v-data-table th[class*="name"]) {
  text-align: left !important;
}

/* Manter os estilos existentes */
.action-icon {
  color: rgba(0, 0, 0, 0.6);
  transition: color 0.2s ease;
}

.action-icon:hover {
  color: rgba(0, 0, 0, 0.9);
}
</style> 