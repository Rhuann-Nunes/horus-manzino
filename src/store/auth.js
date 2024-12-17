import { reactive } from 'vue'
import { supabase } from '@/plugins/supabase'

export const authStore = reactive({
  user: null,
  loading: true,

  async init() {
    // Verificar sessão atual
    const { data: { session } } = await supabase.auth.getSession()
    this.user = session?.user || null
    this.loading = false

    // Ouvir mudanças na autenticação
    supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user || null
    })
  },

  async signOut() {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }
})