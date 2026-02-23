
import { TOOLS_DATABASE } from '../constants';
import { View, HackingTool } from '../types';

/**
 * AEGIS_PRISM | Public Tactical API
 * v1.0 | Open Access Module
 * 
 * This module exposes the core assets and sections of the Aegis Prism suite
 * for external integration or programmatic access.
 */

export const PublicAPI = {
  /**
   * Returns the full tactical tools database.
   */
  getTools: (): HackingTool[] => {
    return [...TOOLS_DATABASE];
  },

  /**
   * Returns tools filtered by category.
   */
  getToolsByCategory: (category: string): HackingTool[] => {
    return TOOLS_DATABASE.filter(tool => 
      tool.category.toLowerCase() === category.toLowerCase()
    );
  },

  /**
   * Searches for a tool by name.
   */
  findTool: (name: string): HackingTool | undefined => {
    return TOOLS_DATABASE.find(tool => 
      tool.name.toLowerCase() === name.toLowerCase()
    );
  },

  /**
   * Returns all available system sections (Views).
   */
  getSections: (): string[] => {
    return Object.values(View);
  },

  /**
   * Metadata about the current API version.
   */
  version: "1.0.0-PROTOTYPE",
  codename: "VORTEX_OPEN_ACCESS"
};

// Expose to window for browser console access if in a browser environment
if (typeof window !== 'undefined') {
  (window as any).AegisAPI = PublicAPI;
  console.log("AEGIS_PRISM: Public API initialized. Access via 'window.AegisAPI'");
}
