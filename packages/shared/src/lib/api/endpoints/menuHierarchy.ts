// src/lib/api/endpoints/menuHierarchy.ts
import { getUniversalAdminApiClient } from '../client';
import type { 
  MenuHierarchyApiResponse, 
  MenuHierarchyParams 
} from '@/types/menu';

/**
 * Cliente API para operaciones con MenuHierarchy
 * Usa la Admin API ya que los menús son parte de la administración del sistema
 */
class MenuHierarchyApi {
  private client = getUniversalAdminApiClient();
  
  /**
   * Obtiene la jerarquía de menús por idioma
   * @param params Parámetros de consulta (menuTypeCode, languageCode, includeInactive)
   * @returns Promise con la respuesta de la API
   */
  async getMenuHierarchy(params: MenuHierarchyParams): Promise<MenuHierarchyApiResponse> {
    const queryParams = new URLSearchParams({
      menuTypeCode: params.menuTypeCode || 'MAIN_MENU',
      languageCode: params.languageCode,
      includeInactive: params.includeInactive?.toString() || 'false',
    });

    // Construir la URL completa del endpoint
    const endpoint = `api/MenuHierarchy/by-language?${queryParams.toString()}`;
    
    console.log('🔗 Calling MenuHierarchy API:', {
      endpoint,
      params,
    });

    try {
      const response = await this.client.get<MenuHierarchyApiResponse>(endpoint);
      
      console.log('✅ MenuHierarchy API Response:', {
        success: response.isSuccess,
        itemCount: response.value?.items?.length || 0,
        status: response.status,
      });

      return response;
    } catch (error) {
      console.error('❌ MenuHierarchy API Error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        endpoint,
        params,
      });
      throw error;
    }
  }

  /**
   * Invalida el cache de menús (útil para refrescar después de cambios)
   */
  async invalidateCache(): Promise<void> {
    // Aquí podrías implementar un endpoint específico para invalidar cache
    // Por ahora, simplemente logueamos la acción
    console.log('🗑️ MenuHierarchy cache invalidation requested');
  }

  /**
   * Obtiene metadatos del menú (si estuviera disponible en el futuro)
   */
  async getMenuMetadata(menuTypeCode: string): Promise<any> {
    // Placeholder para futura funcionalidad
    throw new Error('Menu metadata endpoint not yet implemented');
  }
}

// Singleton instance
const menuHierarchyApi = new MenuHierarchyApi();

export { menuHierarchyApi };
export type { MenuHierarchyParams };