/**
 * Preset layouts for common use cases
 */

import type { GridLayout, GridItemOptions } from '../types'

/**
 * Dashboard layout preset
 */
export const dashboard: GridLayout = {
  options: {
    column: 12,
    cellHeight: 70,
    animate: true
  },
  items: [
    {
      id: 'header',
      x: 0,
      y: 0,
      w: 12,
      h: 2,
      noResize: true,
      content: '<div class="header">Dashboard Header</div>'
    },
    {
      id: 'sidebar',
      x: 0,
      y: 2,
      w: 3,
      h: 8,
      minW: 2,
      maxW: 4,
      content: '<div class="sidebar">Sidebar</div>'
    },
    {
      id: 'main-chart',
      x: 3,
      y: 2,
      w: 6,
      h: 4,
      minW: 4,
      content: '<div class="chart">Main Chart</div>'
    },
    {
      id: 'stats',
      x: 9,
      y: 2,
      w: 3,
      h: 4,
      content: '<div class="stats">Statistics</div>'
    },
    {
      id: 'table',
      x: 3,
      y: 6,
      w: 9,
      h: 4,
      minH: 3,
      content: '<div class="table">Data Table</div>'
    }
  ]
}

/**
 * Kanban board layout preset
 */
export const kanban: GridLayout = {
  options: {
    column: 12,
    cellHeight: 100,
    animate: true
  },
  items: [
    {
      id: 'todo',
      x: 0,
      y: 0,
      w: 4,
      h: 10,
      noResize: true,
      content: '<div class="kanban-column"><h3>To Do</h3></div>'
    },
    {
      id: 'in-progress',
      x: 4,
      y: 0,
      w: 4,
      h: 10,
      noResize: true,
      content: '<div class="kanban-column"><h3>In Progress</h3></div>'
    },
    {
      id: 'done',
      x: 8,
      y: 0,
      w: 4,
      h: 10,
      noResize: true,
      content: '<div class="kanban-column"><h3>Done</h3></div>'
    }
  ]
}

/**
 * Blog layout preset
 */
export const blog: GridLayout = {
  options: {
    column: 12,
    cellHeight: 80,
    animate: true
  },
  items: [
    {
      id: 'hero',
      x: 0,
      y: 0,
      w: 12,
      h: 5,
      noResize: true,
      content: '<div class="hero">Hero Section</div>'
    },
    {
      id: 'featured',
      x: 0,
      y: 5,
      w: 8,
      h: 4,
      content: '<div class="featured">Featured Post</div>'
    },
    {
      id: 'sidebar-ads',
      x: 8,
      y: 5,
      w: 4,
      h: 8,
      content: '<div class="ads">Sidebar</div>'
    },
    {
      id: 'post-1',
      x: 0,
      y: 9,
      w: 4,
      h: 4,
      content: '<div class="post">Post 1</div>'
    },
    {
      id: 'post-2',
      x: 4,
      y: 9,
      w: 4,
      h: 4,
      content: '<div class="post">Post 2</div>'
    }
  ]
}

/**
 * Analytics layout preset
 */
export const analytics: GridLayout = {
  options: {
    column: 12,
    cellHeight: 60,
    animate: true
  },
  items: [
    {
      id: 'kpi-1',
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      noResize: true,
      content: '<div class="kpi">KPI 1</div>'
    },
    {
      id: 'kpi-2',
      x: 3,
      y: 0,
      w: 3,
      h: 2,
      noResize: true,
      content: '<div class="kpi">KPI 2</div>'
    },
    {
      id: 'kpi-3',
      x: 6,
      y: 0,
      w: 3,
      h: 2,
      noResize: true,
      content: '<div class="kpi">KPI 3</div>'
    },
    {
      id: 'kpi-4',
      x: 9,
      y: 0,
      w: 3,
      h: 2,
      noResize: true,
      content: '<div class="kpi">KPI 4</div>'
    },
    {
      id: 'line-chart',
      x: 0,
      y: 2,
      w: 8,
      h: 4,
      content: '<div class="chart">Line Chart</div>'
    },
    {
      id: 'pie-chart',
      x: 8,
      y: 2,
      w: 4,
      h: 4,
      content: '<div class="chart">Pie Chart</div>'
    },
    {
      id: 'bar-chart',
      x: 0,
      y: 6,
      w: 6,
      h: 4,
      content: '<div class="chart">Bar Chart</div>'
    },
    {
      id: 'area-chart',
      x: 6,
      y: 6,
      w: 6,
      h: 4,
      content: '<div class="chart">Area Chart</div>'
    }
  ]
}

/**
 * Portfolio layout preset
 */
export const portfolio: GridLayout = {
  options: {
    column: 12,
    cellHeight: 100,
    animate: true
  },
  items: [
    {
      id: 'project-1',
      x: 0,
      y: 0,
      w: 6,
      h: 3,
      content: '<div class="portfolio-item">Project 1</div>'
    },
    {
      id: 'project-2',
      x: 6,
      y: 0,
      w: 6,
      h: 3,
      content: '<div class="portfolio-item">Project 2</div>'
    },
    {
      id: 'project-3',
      x: 0,
      y: 3,
      w: 4,
      h: 3,
      content: '<div class="portfolio-item">Project 3</div>'
    },
    {
      id: 'project-4',
      x: 4,
      y: 3,
      w: 4,
      h: 3,
      content: '<div class="portfolio-item">Project 4</div>'
    },
    {
      id: 'project-5',
      x: 8,
      y: 3,
      w: 4,
      h: 3,
      content: '<div class="portfolio-item">Project 5</div>'
    }
  ]
}

/**
 * Admin panel layout preset
 */
export const admin: GridLayout = {
  options: {
    column: 12,
    cellHeight: 70,
    animate: true
  },
  items: [
    {
      id: 'top-nav',
      x: 0,
      y: 0,
      w: 12,
      h: 1,
      noResize: true,
      noMove: true,
      content: '<div class="top-nav">Navigation</div>'
    },
    {
      id: 'side-menu',
      x: 0,
      y: 1,
      w: 2,
      h: 10,
      minW: 2,
      maxW: 3,
      noMove: true,
      content: '<div class="side-menu">Menu</div>'
    },
    {
      id: 'content',
      x: 2,
      y: 1,
      w: 10,
      h: 10,
      content: '<div class="content">Main Content</div>'
    }
  ]
}

/**
 * Grid gallery layout preset
 */
export const gallery: GridLayout = {
  options: {
    column: 12,
    cellHeight: 80,
    animate: true
  },
  items: [
    {
      id: 'img-1',
      x: 0,
      y: 0,
      w: 4,
      h: 3,
      content: '<div class="gallery-item">Image 1</div>'
    },
    {
      id: 'img-2',
      x: 4,
      y: 0,
      w: 4,
      h: 3,
      content: '<div class="gallery-item">Image 2</div>'
    },
    {
      id: 'img-3',
      x: 8,
      y: 0,
      w: 4,
      h: 3,
      content: '<div class="gallery-item">Image 3</div>'
    },
    {
      id: 'img-4',
      x: 0,
      y: 3,
      w: 3,
      h: 2,
      content: '<div class="gallery-item">Image 4</div>'
    },
    {
      id: 'img-5',
      x: 3,
      y: 3,
      w: 6,
      h: 2,
      content: '<div class="gallery-item">Image 5</div>'
    },
    {
      id: 'img-6',
      x: 9,
      y: 3,
      w: 3,
      h: 2,
      content: '<div class="gallery-item">Image 6</div>'
    }
  ]
}

/**
 * Empty grid preset
 */
export const empty: GridLayout = {
  options: {
    column: 12,
    cellHeight: 70,
    animate: true
  },
  items: []
}

/**
 * Get all presets
 */
export function getAllPresets(): Record<string, GridLayout> {
  return {
    dashboard,
    kanban,
    blog,
    analytics,
    portfolio,
    admin,
    gallery,
    empty
  }
}

/**
 * Get preset by name
 */
export function getPreset(name: string): GridLayout | undefined {
  const presets = getAllPresets()
  return presets[name]
}

/**
 * Get preset names
 */
export function getPresetNames(): string[] {
  return Object.keys(getAllPresets())
}













