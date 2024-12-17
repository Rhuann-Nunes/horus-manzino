<template>
  <v-app>
    <template v-if="isAuthenticated">
      <v-app-bar
        app
        elevation="1"
        height="64"
        class="px-4"
      >
        <div class="d-flex align-center">
          <div class="logo-text">ESSENCE</div>
        </div>
        <v-spacer></v-spacer>

        <v-btn icon class="mr-2">
          <v-icon>mdi-bell-outline</v-icon>
        </v-btn>
        <v-btn icon class="mr-4" @click="handleLogout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>

        <v-app-bar-nav-icon 
          @click="drawer = !drawer"
          class="grey--text text--darken-2"
        ></v-app-bar-nav-icon>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        app
        right
        width="280"
        class="modern-drawer"
      >
        <v-list class="py-0">
          <v-list-item class="px-4 py-6">
            <v-list-item-content>
              <v-list-item-title class="text-h6 font-weight-medium">Menu</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item-group
            color="primary"
          >
            <v-list-item
              v-for="(item, i) in menuItems"
              :key="i"
              :to="item.to"
              class="px-4 py-2"
            >
              <v-list-item-icon>
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.title"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>

        <template v-slot:append>
          <div class="pa-4">
            <v-divider></v-divider>
            <v-list-item class="mt-2">
              <v-list-item-content>
                <v-list-item-subtitle class="text-caption text--secondary">
                  © {{ new Date().getFullYear() }} Essence Moda Íntima
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </div>
        </template>
      </v-navigation-drawer>
    </template>

    <v-main :class="{ 'grey lighten-4': isAuthenticated }">
      <v-container 
        :fluid="isAuthenticated" 
        :class="{ 'pa-6': isAuthenticated }"
      >
        <router-view @show-snackbar="showSnackbar"/>
      </v-container>
    </v-main>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      elevation="24"
      rounded="pill"
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { authStore } from '@/store/auth'

export default {
  name: 'App',

  data: () => ({
    drawer: null,
    menuItems: [
      { title: 'Início', icon: 'mdi-home-outline', to: '/' },
      { title: 'Estoque', icon: 'mdi-package-variant-closed', to: '/stock' },
      { title: 'Clientes', icon: 'mdi-account-group-outline', to: '/customers' },
      { title: 'Fornecedores', icon: 'mdi-truck-outline', to: '/suppliers' },
      { title: 'Vendas', icon: 'mdi-cash-register', to: '/sales' },
    ],
    snackbar: {
      show: false,
      text: '',
      color: 'success',
      timeout: 3000
    }
  }),

  computed: {
    isAuthenticated() {
      return !!authStore.user
    }
  },

  created() {
    authStore.init()
  },

  methods: {
    showSnackbar({ text, color = 'success', timeout = 3000 }) {
      this.snackbar = {
        show: true,
        text,
        color,
        timeout
      }
    },

    async handleLogout() {
      try {
        await authStore.signOut()
        this.$router.push('/login')
        this.showSnackbar({
          text: 'Logout realizado com sucesso!',
          color: 'success'
        })
      } catch (error) {
        console.error('Error logging out:', error)
        this.showSnackbar({
          text: 'Erro ao fazer logout',
          color: 'error'
        })
      }
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

.logo-text {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: #1a1a1a;
  text-transform: uppercase;
}

.v-application {
  font-family: 'Inter', sans-serif !important;
}

.modern-drawer {
  border: none !important;
  background-color: #ffffff !important;
}

.v-list-item {
  border-radius: 8px;
  margin: 4px 0;
}

.v-list-item--active {
  background-color: #f5f5f5 !important;
  color: var(--v-primary-base) !important;
}

.v-list-item--active .v-icon {
  color: var(--v-primary-base) !important;
}

.v-list-item--active:before {
  opacity: 0;
}

.v-list-item-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.v-app-bar {
  background-color: #ffffff !important;
}

.v-divider {
  border-color: #e0e0e0 !important;
}

/* Hover effects */
.v-list-item:hover {
  background-color: #f5f5f5 !important;
  transition: background-color 0.2s ease;
}

/* Transition effects */
.v-navigation-drawer {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-btn--icon {
  transition: opacity 0.2s ease;
}

.v-btn--icon:hover {
  opacity: 0.8;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .logo-text {
    font-size: 1.25rem;
  }
  
  .v-container {
    padding: 16px !important;
  }
}
</style>
