export type Database = {
  public: {
    Tables: {
      tabs: {
        Row: {
          id: string
          name: string
          currency: string
          invite_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          currency?: string
          invite_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          currency?: string
          invite_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          tab_id: string
          name: string
          access_token: string
          created_at: string
        }
        Insert: {
          id?: string
          tab_id: string
          name: string
          access_token?: string
          created_at?: string
        }
        Update: {
          id?: string
          tab_id?: string
          name?: string
          access_token?: string
          created_at?: string
        }
      }
      ious: {
        Row: {
          id: string
          tab_id: string
          payer_id: string
          amount: number
          description: string
          split_type: 'even' | 'custom'
          created_at: string
        }
        Insert: {
          id?: string
          tab_id: string
          payer_id: string
          amount: number
          description: string
          split_type?: 'even' | 'custom'
          created_at?: string
        }
        Update: {
          id?: string
          tab_id?: string
          payer_id?: string
          amount?: number
          description?: string
          split_type?: 'even' | 'custom'
          created_at?: string
        }
      }
      iou_splits: {
        Row: {
          id: string
          iou_id: string
          participant_id: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          iou_id: string
          participant_id: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          iou_id?: string
          participant_id?: string
          amount?: number
          created_at?: string
        }
      }
      settlements: {
        Row: {
          id: string
          tab_id: string
          from_id: string
          to_id: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          tab_id: string
          from_id: string
          to_id: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          tab_id?: string
          from_id?: string
          to_id?: string
          amount?: number
          created_at?: string
        }
      }
    }
    Views: {
      net_balances: {
        Row: {
          tab_id: string
          participant_id: string
          participant_name: string
          net_balance: number
        }
      }
    }
  }
}