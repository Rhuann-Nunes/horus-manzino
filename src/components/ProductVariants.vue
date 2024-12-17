<template>
  <v-dialog v-model="dialog" max-width="900px">
    <v-card>
      <v-card-title class="text-h5">
        Variações do Produto: {{ product?.name }}
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="variants"
          :loading="loading"
          class="mt-4"
        >
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
            >
              {{ item.stock }}
            </v-chip>
          </template>

          <template #[`item.image_url`]="{ item }">
            <v-avatar size="40" v-if="item.image_url">
              <v-img :src="item.image_url" contain></v-img>
            </v-avatar>
            <span v-else>-</span>
          </template>

          <template #[`item.actions`]="{ item }">
            <div class="d-flex justify-center">
              <v-icon 
                small 
                class="mr-2 action-icon"
                @click="editVariant(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon 
                small 
                class="action-icon"
                @click="deleteVariant(item)"
              >
                mdi-delete
              </v-icon>
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="black" text @click="close">
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Diálogo de edição -->
    <v-dialog v-model="editDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Editar Variação</span>
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
                  <v-col cols="6">
                    <v-text-field
                      v-model="editedItem.color"
                      label="Cor"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => !!v || 'Cor é obrigatória']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      v-model="editedItem.size"
                      label="Tamanho"
                      dense
                      outlined
                      hide-details="auto"
                      class="mb-2"
                      :rules="[v => !!v || 'Tamanho é obrigatório']"
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
            @click="closeEdit"
          >
            Cancelar
          </v-btn>
          <v-btn 
            text 
            color="success" 
            class="text-none letter-spacing-2"
            @click="saveVariant"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmação de exclusão -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Tem certeza que deseja desativar esta variação?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black" text @click="closeDelete">Não</v-btn>
          <v-btn color="error" text @click="confirmDelete">Sim</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import { supabase } from '@/plugins/supabase'

export default {
  name: 'ProductVariants',

  props: {
    value: Boolean,
    product: Object
  },

  data: () => ({
    dialog: false,
    editDialog: false,
    deleteDialog: false,
    loading: false,
    variants: [],
    headers: [
      { text: 'Cor', value: 'color' },
      { text: 'Tamanho', value: 'size' },
      { text: 'Preço', value: 'price' },
      { text: 'Custo', value: 'cost_price' },
      { text: 'Estoque', value: 'stock' },
      { text: 'Imagem', value: 'image_url' },
      { text: 'Ações', value: 'actions', sortable: false }
    ],
    editedItem: {},
    selectedVariant: null,
    imagePreview: null,
    productImage: null
  }),

  watch: {
    value(val) {
      this.dialog = val
    },
    dialog(val) {
      if (!val) this.$emit('input', val)
      if (val) this.fetchVariants()
    }
  },

  methods: {
    async fetchVariants() {
      this.loading = true
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('generic_product_id', this.product.id)
        .eq('activate', true)
        .order('color')

      if (error) {
        console.error('Error fetching variants:', error)
      } else {
        this.variants = data
      }
      this.loading = false
    },

    getStockColor(item) {
      if (item.stock <= 0) return 'error'
      if (item.stock <= item.min_stock) return 'warning'
      return 'success'
    },

    editVariant(item) {
      this.editedItem = { ...item }
      this.selectedVariant = item
      this.imagePreview = item.image_url
      this.productImage = null
      this.editDialog = true
    },

    deleteVariant(item) {
      this.selectedVariant = item
      this.deleteDialog = true
    },

    async saveVariant() {
      try {
        const { error } = await supabase
          .from('products')
          .update({
            color: this.editedItem.color,
            size: this.editedItem.size,
            price: this.editedItem.price,
            cost_price: this.editedItem.cost_price,
            min_stock: this.editedItem.min_stock,
            image_url: this.editedItem.image_url
          })
          .eq('id', this.editedItem.id)

        if (error) throw error

        this.closeEdit()
        await this.fetchVariants()
        this.$emit('show-snackbar', {
          text: 'Variação atualizada com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error updating variant:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao atualizar variação',
          color: 'error'
        })
      }
    },

    async confirmDelete() {
      try {
        const { error } = await supabase
          .from('products')
          .update({ activate: false })
          .eq('id', this.selectedVariant.id)

        if (error) throw error

        this.closeDelete()
        await this.fetchVariants()
        this.$emit('show-snackbar', {
          text: 'Variação desativada com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error deactivating variant:', error)
        this.$emit('show-snackbar', {
          text: 'Erro ao desativar variação',
          color: 'error'
        })
      }
    },

    close() {
      this.dialog = false
    },

    closeEdit() {
      this.editDialog = false
      this.editedItem = {}
      this.selectedVariant = null
      this.imagePreview = null
      this.productImage = null
    },

    closeDelete() {
      this.deleteDialog = false
      this.selectedVariant = null
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
    }
  }
}
</script>

<style scoped>
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
  cursor: pointer;
}

.action-icon:hover {
  color: rgba(0, 0, 0, 0.9);
}
</style> 