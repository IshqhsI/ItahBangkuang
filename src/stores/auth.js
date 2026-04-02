import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(null)
  const role  = ref(null)
  const ready = ref(false) // true setelah init selesai

  const fetchRole = async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    role.value = profile?.role ?? null
  }

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      user.value = session.user
      await fetchRole(session.user.id)
    }
    ready.value = true

    // Otomatis update kalau login/logout dari tab lain
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        user.value = session.user
        await fetchRole(session.user.id)
      } else {
        user.value = null
        role.value = null
      }
    })
  }

  const logout = async (router) => {
    await supabase.auth.signOut()
    user.value = null
    role.value = null
    router.push('/')
  }

  return { user, role, ready, init, logout }
})
