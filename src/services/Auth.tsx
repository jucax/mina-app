import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  is_owner: boolean;
  name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface AuthError {
  message: string;
}

export const Auth = {
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        return { user: null, error: { message: 'No user found' } };
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        is_owner: data.user.user_metadata?.is_owner || false,
        name: data.user.user_metadata?.name,
        phone: data.user.user_metadata?.phone,
        avatar_url: data.user.user_metadata?.avatar_url,
      };

      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  },

  async signUp(email: string, password: string, userData: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_owner: userData.is_owner,
            name: userData.name,
            phone: userData.phone,
            avatar_url: userData.avatar_url,
          },
        },
      });

      if (error) throw error;

      if (!data.user) {
        return { user: null, error: { message: 'No user created' } };
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        is_owner: userData.is_owner || false,
        name: userData.name,
        phone: userData.phone,
        avatar_url: userData.avatar_url,
      };

      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async resetPassword(email: string): Promise<{ error: AuthError | null; userExists?: boolean }> {
    try {
      // First check if user exists
      const { userExists } = await Auth.checkUserExists(email);
      
      if (!userExists) {
        return { error: { message: 'No se encontró una cuenta registrada con este correo electrónico' }, userExists: false };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'mina-app://reset-password',
      });
      
      if (error) throw error;
      return { error: null, userExists: true };
    } catch (error: any) {
      return { error: { message: error.message }, userExists: false };
    }
  },

  async checkUserExists(email: string): Promise<{ userExists: boolean; error?: AuthError }> {
    try {
      // Try to sign in with a dummy password to check if user exists
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy_password_for_existence_check',
      });

      // If we get "Invalid login credentials", the user exists
      // If we get "Email not confirmed" or other errors, the user might exist but not be confirmed
      // If we get "User not found" or similar, the user doesn't exist
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { userExists: true };
        } else if (error.message.includes('Email not confirmed')) {
          return { userExists: true };
        } else if (error.message.includes('User not found') || error.message.includes('Unable to validate email address')) {
          return { userExists: false };
        } else {
          // For other errors, assume user doesn't exist to be safe
          return { userExists: false };
        }
      }

      return { userExists: true };
    } catch (error: any) {
      return { userExists: false, error: { message: error.message } };
    }
  },

  async getCurrentUser(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) return { user: null, error: null };

      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        is_owner: user.user_metadata?.is_owner || false,
        name: user.user_metadata?.name,
        phone: user.user_metadata?.phone,
        avatar_url: user.user_metadata?.avatar_url,
      };

      return { user: authUser, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  },

  async updateProfile(userData: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          phone: userData.phone,
          avatar_url: userData.avatar_url,
        },
      });

      if (error) throw error;
      if (!user) return { user: null, error: { message: 'No user found' } };

      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        is_owner: user.user_metadata?.is_owner || false,
        name: user.user_metadata?.name,
        phone: user.user_metadata?.phone,
        avatar_url: user.user_metadata?.avatar_url,
      };

      return { user: authUser, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  },
}; 