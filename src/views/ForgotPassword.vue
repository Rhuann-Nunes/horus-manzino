<template>
  <v-container fluid fill-height class="forgot-password-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="4" class="forgot-password-card">
          <v-card-text class="text-center pt-8">
            <div class="logo-text mb-8">ESSENCE</div>
            <h1 class="text-h5 font-weight-regular mb-2">Recuperar Senha</h1>
            <p class="text-subtitle-1 grey--text text--darken-1 mb-6">
              Digite seu e-mail para receber as instruções
            </p>
            
            <v-form ref="form" v-model="valid" @submit.prevent="handleResetPassword">
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="E-mail"
                type="email"
                outlined
                dense
                class="mb-6"
              ></v-text-field>

              <v-btn
                :loading="loading"
                block
                color="primary"
                height="44"
                type="submit"
                :disabled="!valid"
                class="mb-4"
              >
                Enviar instruções
              </v-btn>

              <router-link 
                to="/login"
                class="text-decoration-none text-caption grey--text text--darken-1"
              >
                Voltar para o login
              </router-link>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      elevation="24"
      rounded="pill"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { supabase } from '@/plugins/supabase'

export default {
  name: 'ForgotPassword',

  data: () => ({
    valid: false,
    loading: false,
    email: '',
    emailRules: [
      v => !!v || 'E-mail é obrigatório',
      v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido'
    ],
    snackbar: {
      show: false,
      text: '',
      color: 'success',
      timeout: 3000
    }
  }),

  methods: {
    showMessage(text, color = 'success') {
      this.snackbar = {
        show: true,
        text,
        color,
        timeout: 3000
      }
    },

    async handleResetPassword() {
      if (!this.$refs.form.validate()) return

      this.loading = true

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(this.email, {
          redirectTo: `${window.location.origin}/reset-password`
        })

        if (error) throw error

        this.showMessage('Instruções enviadas para seu e-mail!')
        setTimeout(() => {
          this.$router.push('/login')
        }, 3000)
      } catch (error) {
        console.error('Error resetting password:', error)
        this.showMessage('Erro ao enviar instruções. Tente novamente.', 'error')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  background-color: #f5f5f5;
}

.forgot-password-card {
  border-radius: 8px;
}

.logo-text {
  font-family: 'Inter', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: #1a1a1a;
}
</style> 