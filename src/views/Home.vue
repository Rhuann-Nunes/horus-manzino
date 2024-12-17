<template>
  <v-container>
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon
            class="mr-3"
            size="32"
            color="grey darken-2"
          >
            mdi-home-outline
          </v-icon>
          <h1 class="text-h4 font-weight-light grey--text text--darken-2">
            Início
          </h1>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2">
          <v-card-text>
            <div class="text-overline mb-1">Vendas Hoje</div>
            <div class="text-h4 mb-2">R$ 0,00</div>
            <div class="text-caption grey--text">
              <v-icon small color="success">mdi-arrow-up</v-icon>
              <span class="success--text">4%</span> em relação a ontem
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'HomeView'
}
</script> 