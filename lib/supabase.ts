import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 정보를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 다른 파일에서 이 'supabase'를 불러와서 쓸 수 있게 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)