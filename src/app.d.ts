import { SupabaseClient, Session, type UserResponse } from '@supabase/supabase-js'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Platform {
      env: Env
      cf: CfProperties
      ctx: ExecutionContext
    }
    interface Locals {
        bskyAgent: BskyAgent | null
        twitterClient: TwitterApi | null
    }
    interface PageData {
      session: Session | null
      supabase: SupabaseClient
    }
  }
}

export { };