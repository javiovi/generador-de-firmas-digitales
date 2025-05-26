import { useState } from 'react';

export interface IconPaths {
  social: Record<string, string>;
  contact: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

interface UseIconsReturn {
  isGenerating: boolean;
  error: string | null;
  iconPaths: IconPaths | null;
  generateSocialIcons: (color: string) => Promise<void>;
  generateContactIcons: () => Promise<void>;
  generateSingleIcon: (type: string, color?: string, theme?: 'light' | 'dark') => Promise<void>;
  initializeIcons: (color: string) => Promise<void>;
}

export function useIcons(): UseIconsReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iconPaths, setIconPaths] = useState<IconPaths | null>(null);

  const generateIconUrl = (type: string, color?: string, theme?: 'light' | 'dark') => {
    const params = new URLSearchParams();
    params.append('type', type);
    if (color) params.append('color', color);
    if (theme) params.append('theme', theme);
    return `/api/icons?${params.toString()}`;
  };

  const generateSocialIcons = async (color: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const socialTypes = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'web'];
      const socialPaths: Record<string, string> = {};
      
      for (const type of socialTypes) {
        socialPaths[type] = generateIconUrl(type, color);
      }

      setIconPaths((prev: IconPaths | null) => ({
        ...prev || { social: {}, contact: { light: {}, dark: {} } },
        social: socialPaths
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar íconos sociales');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContactIcons = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const contactTypes = ['address', 'phone', 'mail', 'web'];
      const contactPaths = {
        light: {} as Record<string, string>,
        dark: {} as Record<string, string>
      };

      for (const type of contactTypes) {
        contactPaths.light[type] = generateIconUrl(type, undefined, 'light');
        contactPaths.dark[type] = generateIconUrl(type, undefined, 'dark');
      }

      setIconPaths((prev: IconPaths | null) => ({
        ...prev || { social: {}, contact: { light: {}, dark: {} } },
        contact: contactPaths
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar íconos de contacto');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSingleIcon = async (type: string, color?: string, theme: 'light' | 'dark' = 'light') => {
    setIsGenerating(true);
    setError(null);
    try {
      const iconUrl = generateIconUrl(type, color, theme);
      
      setIconPaths((prev: IconPaths | null) => {
        const newPaths = prev || { social: {}, contact: { light: {}, dark: {} } };
        
        if (type === 'address' || type === 'phone' || type === 'mail' || type === 'web') {
          newPaths.contact[theme][type] = iconUrl;
        } else {
          newPaths.social[type] = iconUrl;
        }
        
        return newPaths;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar ícono');
    } finally {
      setIsGenerating(false);
    }
  };

  const initializeIcons = async (color: string) => {
    await Promise.all([
      generateSocialIcons(color),
      generateContactIcons()
    ]);
  };

  return {
    isGenerating,
    error,
    iconPaths,
    generateSocialIcons,
    generateContactIcons,
    generateSingleIcon,
    initializeIcons
  };
} 