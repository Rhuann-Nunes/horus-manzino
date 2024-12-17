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
            mdi-truck-delivery
          </v-icon>
          <h1 class="text-h4 font-weight-light grey--text text--darken-2">
            Fornecedores
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
              <span>Adicionar Fornecedor</span>
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
            :items="suppliers"
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
                    label="Buscar fornecedor..."
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
                class="action-icon"
                @click="deleteSupplier(item)"
              >
                mdi-delete
              </v-icon>
            </template>

            <template #[`item.cnpj`]="{ item }">
              {{ formatCNPJDisplay(item.cnpj) }}
            </template>

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
                  v-model="editedItem.cnpj"
                  label="CNPJ"
                  dense
                  outlined
                  hide-details="auto"
                  class="mb-2"
                  :rules="[v => !!v || 'CNPJ é obrigatório']"
                  maxlength="18"
                  @input="formatCNPJ"
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
            @click="saveSupplier"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Tem certeza que deseja deletar este fornecedor?
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
  name: 'SuppliersManager',

  data: () => ({
    search: '',
    loading: false,
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: 'Nome', value: 'name' },
      { text: 'CNPJ', value: 'cnpj' },
      { text: 'Telefone', value: 'phone' },
      { text: 'Ações', value: 'actions', sortable: false }
    ],
    suppliers: [],
    editedIndex: -1,
    editedItem: {
      name: '',
      cnpj: '',
      phone: '',
      address: ''
    },
    defaultItem: {
      name: '',
      cnpj: '',
      phone: '',
      address: ''
    }
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Novo Fornecedor' : 'Editar Fornecedor'
    }
  },

  mounted() {
    this.fetchSuppliers()
  },

  methods: {
    async fetchSuppliers() {
      this.loading = true
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching suppliers:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao carregar fornecedores',
          color: 'error'
        })
      } else {
        this.suppliers = data
      }
      this.loading = false
    },

    openDialog(item) {
      this.editedIndex = item ? this.suppliers.indexOf(item) : -1
      this.editedItem = item ? Object.assign({}, item) : Object.assign({}, this.defaultItem)
      
      // Aplica as máscaras se estiver editando um item existente
      if (item) {
        this.editedItem.cnpj = this.formatCNPJDisplay(this.editedItem.cnpj)
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

    formatCNPJ(value) {
      if (!value) return ''
      value = value.replace(/\D/g, '')
      value = value.replace(/^(\d{2})(\d)/, '$1.$2')
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2')
      value = value.replace(/(\d{4})(\d)/, '$1-$2')
      this.editedItem.cnpj = value
    },

    formatPhone(value) {
      if (!value) return ''
      value = value.replace(/\D/g, '')
      value = value.replace(/^(\d{2})(\d)/, '($1) $2')
      value = value.replace(/(\d{5})(\d)/, '$1-$2')
      this.editedItem.phone = value
    },

    formatCNPJDisplay(cnpj) {
      if (!cnpj) return '-'
      cnpj = cnpj.replace(/\D/g, '')
      return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    },

    formatPhoneDisplay(phone) {
      if (!phone) return '-'
      phone = phone.replace(/\D/g, '')
      if (phone.length === 11) {
        return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
      } else if (phone.length === 10) {
        return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
      }
      return phone
    },

    async saveSupplier() {
      try {
        const supplierData = { ...this.editedItem }
        
        // Remove as máscaras
        supplierData.cnpj = supplierData.cnpj ? supplierData.cnpj.replace(/\D/g, '') : ''
        supplierData.phone = supplierData.phone ? supplierData.phone.replace(/\D/g, '') : ''

        if (this.editedIndex > -1) {
          const { error } = await supabase
            .from('suppliers')
            .update(supplierData)
            .eq('id', supplierData.id)

          if (error) {
            if (error.code === '23505' && error.message.includes('suppliers_cnpj_key')) {
              throw new Error('CNPJ já cadastrado para outro fornecedor')
            }
            throw error
          }

          Object.assign(this.suppliers[this.editedIndex], this.editedItem)
        } else {
          const { data, error } = await supabase
            .from('suppliers')
            .insert([supplierData])
            .select()

          if (error) {
            if (error.code === '23505' && error.message.includes('suppliers_cnpj_key')) {
              throw new Error('CNPJ já cadastrado para outro fornecedor')
            }
            throw error
          }

          if (data && data[0]) {
            this.suppliers.push(data[0])
          }
        }

        this.closeDialog()
        this.$emit('show-snackbar', {
          text: 'Fornecedor salvo com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error saving supplier:', error)
        this.$emit('show-snackbar', {
          text: error.message === 'CNPJ já cadastrado para outro fornecedor' 
            ? error.message 
            : 'Erro ao salvar fornecedor',
          color: 'error'
        })
      }
    },

    deleteSupplier(item) {
      this.editedIndex = this.suppliers.indexOf(item)
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
          .from('suppliers')
          .delete()
          .eq('id', this.editedItem.id)

        if (error) throw error

        this.suppliers.splice(this.editedIndex, 1)
        this.closeDelete()
        this.$emit('show-snackbar', {
          text: 'Fornecedor removido com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error deleting supplier:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao remover fornecedor',
          color: 'error'
        })
      }
    },

    exportData() {
      try {
        // Preparar os dados para exportação
        const exportData = this.suppliers.map(supplier => ({
          Nome: supplier.name,
          CNPJ: this.formatCNPJDisplay(supplier.cnpj),
          Telefone: this.formatPhoneDisplay(supplier.phone),
          Endereço: supplier.address || ''
        }));

        // Criar uma nova planilha
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Ajustar largura das colunas
        const colWidths = [
          { wch: 40 }, // Nome
          { wch: 18 }, // CNPJ
          { wch: 15 }, // Telefone
          { wch: 50 }  // Endereço
        ];
        ws['!cols'] = colWidths;

        // Criar um novo workbook e adicionar a planilha
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Fornecedores');

        // Gerar o arquivo e fazer o download
        const fileName = `fornecedores_${new Date().toISOString().split('T')[0]}.xlsx`;
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
</style> 