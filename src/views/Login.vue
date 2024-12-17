<template>
  <div class="fill-height bg-grey-lighten-4">
    <v-container class="fill-height" fluid>
      <v-row class="fill-height" align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4" xl="3">
          <v-card class="elevation-4 mx-auto">
            <v-card-text class="text-center pa-8">
              <div class="logo-text mb-10">ESSENCE</div>
              <h1 class="text-h5 font-weight-regular mb-8">Login</h1>
              
              <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="E-mail"
                  type="email"
                  outlined
                  dense
                  class="mb-4"
                  hide-details="auto"
                ></v-text-field>

                <v-text-field
                  v-model="password"
                  :rules="passwordRules"
                  label="Senha"
                  :type="showPassword ? 'text' : 'password'"
                  outlined
                  dense
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPassword = !showPassword"
                  hide-details="auto"
                  class="mb-2"
                ></v-text-field>

                <div class="text-right mb-6">
                  <router-link 
                    to="/forgot-password"
                    class="text-decoration-none text-caption grey--text text--darken-1"
                  >
                    Esqueceu sua senha?
                  </router-link>
                </div>

                <v-btn
                  :loading="loading"
                  block
                  color="primary"
                  height="44"
                  type="submit"
                  :disabled="!valid"
                >
                  Entrar
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      elevation="24"
      rounded="pill"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import { supabase } from '@/plugins/supabase'

export default {
  name: 'LoginView',

  data: () => ({
    valid: false,
    loading: false,
    email: '',
    password: '',
    showPassword: false,
    emailRules: [
      v => !!v || 'E-mail é obrigatório',
      v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido'
    ],
    passwordRules: [
      v => !!v || 'Senha é obrigatória',
      v => v.length >= 6 || 'Senha deve ter no mínimo 6 caracteres'
    ],
    snackbar: {
      show: false,
      text: '',
      color: 'error',
      timeout: 3000
    }
  }),

  methods: {
    showError(message) {
      this.snackbar = {
        show: true,
        text: message,
        color: 'error',
        timeout: 3000
      }
    },

    async handleLogin() {
      if (!this.$refs.form.validate()) return

      this.loading = true

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password
        })

        if (error) throw error

        this.$router.push('/')
      } catch (error) {
        console.error('Error logging in:', error)
        this.showError('Erro ao fazer login. Verifique suas credenciais.')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 90vh;
}

.logo-text {
  font-family: 'Inter', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: #1a1a1a;
}

/* Ajustes responsivos */
@media (max-width: 600px) {
  .v-card {
    margin: 16px;
  }
  
  .logo-text {
    font-size: 1.75rem;
  }
}

/* Remover padding padrão do Vuetify */
:deep(.v-text-field.v-text-field--enclosed .v-text-field__details) {
  margin-bottom: 0;
}

:deep(.v-text-field.v-text-field--enclosed.v-input--dense .v-text-field__details) {
  margin-bottom: 0;
}
</style> 