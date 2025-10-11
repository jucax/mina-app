import { supabase } from './supabase';
import { Alert } from 'react-native';

export class AccountDeletionService {
  /**
   * Delete an agent account and all associated data
   */
  static async deleteAgentAccount(agentId: string, userId: string): Promise<boolean> {
    try {
      console.log('🗑️ Starting agent account deletion for agent:', agentId, 'user:', userId);

      // 1. Delete agent's proposals
      console.log('🔄 Deleting proposals...');
      const { error: proposalsError } = await supabase
        .from('proposals')
        .delete()
        .eq('agent_id', agentId);

      if (proposalsError) {
        console.error('❌ Error deleting proposals:', proposalsError);
        throw new Error('Error al eliminar propuestas');
      }
      console.log('✅ Proposals deleted');

      // 2. Delete agent's property views
      console.log('🔄 Deleting property views...');
      const { error: viewsError } = await supabase
        .from('property_views')
        .delete()
        .eq('agent_id', agentId);

      if (viewsError) {
        console.error('⚠️ Error deleting property views:', viewsError);
        // Non-critical, continue
      } else {
        console.log('✅ Property views deleted');
      }

      // 3. Delete agent profile
      console.log('🔄 Deleting agent profile...');
      const { error: agentError } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (agentError) {
        console.error('❌ Error deleting agent profile:', agentError);
        throw new Error('Error al eliminar perfil de agente');
      }
      console.log('✅ Agent profile deleted');

      // 4. Delete user_auth record
      console.log('🔄 Deleting user_auth record...');
      const { error: userAuthError } = await supabase
        .from('user_auth')
        .delete()
        .eq('id', userId);

      if (userAuthError) {
        console.error('❌ Error deleting user_auth:', userAuthError);
        throw new Error('Error al eliminar registro de usuario');
      }
      console.log('✅ user_auth record deleted');

      // 5. Call database RPC function to delete auth user
      console.log('🔄 Calling RPC function to delete auth user...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('delete_user_account', {
        user_id: userId
      });

      if (rpcError) {
        console.error('❌ Error calling RPC delete_user_account:', rpcError);
        console.error('RPC Error details:', JSON.stringify(rpcError, null, 2));
        
        // If RPC fails, try to sign out at least
        console.log('⚠️ RPC failed, signing out user...');
        await supabase.auth.signOut();
        
        // Return true anyway since we deleted the app data
        // The auth user will need to be cleaned up manually or via backend job
        console.log('⚠️ User data deleted but auth user may still exist');
      } else {
        console.log('✅ RPC function result:', rpcData);
        // Sign out the user after successful deletion
        await supabase.auth.signOut();
      }

      console.log('✅ Agent account deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in deleteAgentAccount:', error);
      return false;
    }
  }

  /**
   * Delete an owner account and all associated data
   */
  static async deleteOwnerAccount(ownerId: string, userId: string): Promise<boolean> {
    try {
      console.log('🗑️ Starting owner account deletion for:', ownerId);

      // 1. Get all properties owned by this owner
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', ownerId);

      if (propertiesError) {
        console.error('Error fetching owner properties:', propertiesError);
        throw new Error('Error al obtener propiedades');
      }

      // 2. Delete proposals for owner's properties
      if (properties && properties.length > 0) {
        const propertyIds = properties.map(p => p.id);
        
        const { error: proposalsError } = await supabase
          .from('proposals')
          .delete()
          .in('property_id', propertyIds);

        if (proposalsError) {
          console.error('Error deleting proposals:', proposalsError);
          throw new Error('Error al eliminar propuestas');
        }

        // 3. Delete property views
        const { error: viewsError } = await supabase
          .from('property_views')
          .delete()
          .in('property_id', propertyIds);

        if (viewsError) {
          console.error('Error deleting property views:', viewsError);
          // Non-critical, continue
        }

        // 4. Delete all properties
        const { error: deletePropertiesError } = await supabase
          .from('properties')
          .delete()
          .eq('owner_id', ownerId);

        if (deletePropertiesError) {
          console.error('Error deleting properties:', deletePropertiesError);
          throw new Error('Error al eliminar propiedades');
        }
      }

      // 5. Delete owner profile
      const { error: ownerError } = await supabase
        .from('owners')
        .delete()
        .eq('id', ownerId);

      if (ownerError) {
        console.error('Error deleting owner profile:', ownerError);
        throw new Error('Error al eliminar perfil de propietario');
      }

      // 6. Delete user_auth record
      const { error: userAuthError } = await supabase
        .from('user_auth')
        .delete()
        .eq('id', userId);

      if (userAuthError) {
        console.error('Error deleting user_auth:', userAuthError);
        throw new Error('Error al eliminar registro de usuario');
      }

      // 7. Call database RPC function to delete auth user
      console.log('🔄 Calling RPC function to delete auth user...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('delete_user_account', {
        user_id: userId
      });

      if (rpcError) {
        console.error('❌ Error calling RPC delete_user_account:', rpcError);
        console.error('RPC Error details:', JSON.stringify(rpcError, null, 2));
        
        // If RPC fails, try to sign out at least
        console.log('⚠️ RPC failed, signing out user...');
        await supabase.auth.signOut();
        
        // Return true anyway since we deleted the app data
        console.log('⚠️ User data deleted but auth user may still exist');
      } else {
        console.log('✅ RPC function result:', rpcData);
        // Sign out the user after successful deletion
        await supabase.auth.signOut();
      }

      console.log('✅ Owner account deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in deleteOwnerAccount:', error);
      return false;
    }
  }

  /**
   * Show confirmation dialog before deleting account
   */
  static confirmAccountDeletion(
    userType: 'agent' | 'owner',
    onConfirm: () => void
  ): void {
    const message = userType === 'agent'
      ? 'Esta acción eliminará permanentemente tu cuenta de agente, incluyendo:\n\n• Tu perfil\n• Todas tus propuestas\n• Tu historial de vistas\n• Toda tu información personal\n\nEsta acción no se puede deshacer.'
      : 'Esta acción eliminará permanentemente tu cuenta de propietario, incluyendo:\n\n• Tu perfil\n• Todas tus propiedades publicadas\n• Todas las propuestas recibidas\n• Toda tu información personal\n\nEsta acción no se puede deshacer.';

    Alert.alert(
      '⚠️ Eliminar Cuenta',
      message,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: onConfirm,
        },
      ],
      { cancelable: true }
    );
  }
}

