/**
 * Tipos escritos a mano reflejando supabase/schema.sql. Si en algún momento
 * te logueás con la Supabase CLI, se pueden regenerar exactos con:
 *   npx supabase gen types typescript --project-id <tu-project-id> > src/lib/supabase/types.ts
 */

export type LeagueRole = "admin" | "player";

export interface CreateGameResultInput {
  player_id: string;
  position: number;
  catan_points: number | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      leagues: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          created_by: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      league_members: {
        Row: {
          id: string;
          league_id: string;
          user_id: string;
          role: LeagueRole;
          joined_at: string;
        };
        Insert: {
          league_id: string;
          user_id: string;
          role?: LeagueRole;
        };
        Update: {
          role?: LeagueRole;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          league_id: string;
          user_id: string | null;
          display_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          league_id: string;
          user_id?: string | null;
          display_name: string;
        };
        Update: {
          display_name?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          league_id: string;
          played_at: string;
          created_by: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          league_id: string;
          played_at?: string;
          created_by: string;
          notes?: string | null;
        };
        Update: {
          notes?: string | null;
        };
        Relationships: [];
      };
      game_results: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          position: number;
          catan_points: number | null;
          ranking_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          game_id: string;
          player_id: string;
          position: number;
          catan_points?: number | null;
          ranking_points: number;
        };
        Update: {
          position?: number;
          catan_points?: number | null;
          ranking_points?: number;
        };
        Relationships: [];
      };
      league_settings: {
        Row: {
          league_id: string;
          winner_rule: string;
          last_place_points: number;
          middle_place_points: number;
        };
        Insert: {
          league_id: string;
          winner_rule?: string;
          last_place_points?: number;
          middle_place_points?: number;
        };
        Update: {
          winner_rule?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_game: {
        Args: {
          p_league_id: string;
          p_notes: string | null;
          p_results: CreateGameResultInput[];
          p_played_at?: string | null;
        };
        Returns: string;
      };
      get_league_preview: {
        Args: { p_slug: string };
        Returns: {
          id: string;
          name: string;
          slug: string;
          player_count: number;
          already_member: boolean;
        }[];
      };
      join_league: {
        Args: { p_slug: string };
        Returns: string;
      };
      set_member_role: {
        Args: { p_league_id: string; p_user_id: string; p_role: LeagueRole };
        Returns: undefined;
      };
      set_own_display_name: {
        Args: { p_league_id: string; p_display_name: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
