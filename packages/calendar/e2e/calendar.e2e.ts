/**
 * Calendar E2E测试套件
 * 使用Playwright进行端到端测试
 */

import { test, expect, Page } from '@playwright/test'
import { CalendarEvent } from '../src/types'

// 测试配置
const TEST_URL = 'http://localhost:5173/simple.html'

// 辅助函数
async function initCalendar(page: Page) {
  await page.goto(TEST_URL)
  await page.waitForSelector('#app')
  await page.waitForFunction(() => window.calendar !== undefined)
}

async function addEventViaUI(page: Page, event: Partial<CalendarEvent>) {
  await page.click('#addEvent')
  await page.fill('input[name="title"]', event.title || 'Test Event')
  
  if (event.start) {
    await page.fill('input[name="start"]', event.start.toString())
  }
  
  if (event.end) {
    await page.fill('input[name="end"]', event.end.toString())
  }
  
  await page.click('button[type="submit"]')
}

test.describe('Calendar E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await initCalendar(page)
  })

  test.describe('Calendar Initialization', () => {
    test('should load calendar on page', async ({ page }) => {
      const calendarContainer = await page.$('#app')
      expect(calendarContainer).toBeTruthy()
      
      // Check if calendar is rendered
      const calendarView = await page.$('.calendar-container')
      expect(calendarView).toBeTruthy()
    })

    test('should display current month by default', async ({ page }) => {
      const currentMonth = new Date().toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long' 
      })
      
      const headerText = await page.textContent('.calendar-header h2')
      expect(headerText).toContain(currentMonth.split('年')[0])
    })

    test('should highlight today', async ({ page }) => {
      const todayElement = await page.$('.calendar-day.today')
      expect(todayElement).toBeTruthy()
      
      const isHighlighted = await todayElement?.evaluate(el => 
        window.getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'
      )
      expect(isHighlighted).toBeTruthy()
    })
  })

  test.describe('Navigation', () => {
    test('should navigate to next month', async ({ page }) => {
      const initialMonth = await page.textContent('.calendar-header h2')
      
      await page.click('#goNext')
      await page.waitForTimeout(500)
      
      const newMonth = await page.textContent('.calendar-header h2')
      expect(newMonth).not.toBe(initialMonth)
    })

    test('should navigate to previous month', async ({ page }) => {
      const initialMonth = await page.textContent('.calendar-header h2')
      
      await page.click('#goPrev')
      await page.waitForTimeout(500)
      
      const newMonth = await page.textContent('.calendar-header h2')
      expect(newMonth).not.toBe(initialMonth)
    })

    test('should navigate to today', async ({ page }) => {
      // Navigate away from current month
      await page.click('#goNext')
      await page.click('#goNext')
      await page.click('#goNext')
      
      // Click today button
      await page.click('#goToday')
      await page.waitForTimeout(500)
      
      // Check if today is visible and highlighted
      const todayElement = await page.$('.calendar-day.today')
      expect(todayElement).toBeTruthy()
    })

    test('should navigate using keyboard', async ({ page }) => {
      await page.click('.calendar-day')
      
      // Press right arrow key
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(100)
      
      const focusedElement = await page.evaluate(() => 
        document.activeElement?.getAttribute('data-date')
      )
      expect(focusedElement).toBeTruthy()
    })
  })

  test.describe('View Switching', () => {
    test('should switch to week view', async ({ page }) => {
      await page.click('#viewWeek')
      await page.waitForTimeout(500)
      
      const weekView = await page.$('.calendar-week-view')
      expect(weekView).toBeTruthy()
    })

    test('should switch to day view', async ({ page }) => {
      await page.click('#viewDay')
      await page.waitForTimeout(500)
      
      const dayView = await page.$('.calendar-day-view')
      expect(dayView).toBeTruthy()
    })

    test('should switch to year view', async ({ page }) => {
      await page.click('#viewYear')
      await page.waitForTimeout(500)
      
      const yearView = await page.$('.calendar-year-view')
      expect(yearView).toBeTruthy()
    })

    test('should maintain selected date when switching views', async ({ page }) => {
      // Select a specific date
      const targetDate = '2024-06-15'
      await page.evaluate((date) => {
        window.calendar.goToDate(new Date(date))
      }, targetDate)
      
      // Switch to week view
      await page.click('#viewWeek')
      await page.waitForTimeout(500)
      
      // Switch back to month view
      await page.click('#viewMonth')
      await page.waitForTimeout(500)
      
      // Check if the same month is displayed
      const headerText = await page.textContent('.calendar-header h2')
      expect(headerText).toContain('2024')
      expect(headerText).toContain('06')
    })
  })

  test.describe('Event Management', () => {
    test('should add event by clicking date', async ({ page }) => {
      // Click on a date
      const dateToClick = await page.$('.calendar-day:not(.other-month)')
      await dateToClick?.click()
      
      // Handle the prompt dialog
      page.once('dialog', async dialog => {
        await dialog.accept('Test Event from Click')
      })
      
      await page.waitForTimeout(500)
      
      // Check if event was added
      const eventDot = await page.$('.event-dot')
      expect(eventDot).toBeTruthy()
    })

    test('should add event using form', async ({ page }) => {
      await page.click('#addEvent')
      
      // Handle the prompts
      page.once('dialog', async dialog => {
        await dialog.accept('Test Event from Form')
      })
      
      await page.waitForTimeout(100)
      
      page.once('dialog', async dialog => {
        await dialog.accept('2024-06-15')
      })
      
      await page.waitForTimeout(500)
      
      // Verify event was added
      const events = await page.evaluate(() => window.calendar.getEvents())
      expect(events.length).toBeGreaterThan(0)
    })

    test('should delete event by clicking', async ({ page }) => {
      // First add an event
      await page.evaluate(() => {
        window.calendar.addEvent({
          id: 'test-delete',
          title: 'Event to Delete',
          start: new Date(),
          color: '#ff0000'
        })
      })
      
      await page.waitForTimeout(500)
      
      // Click on the event
      const eventElement = await page.$('.event-dot')
      await eventElement?.click()
      
      // Handle confirmation dialog
      page.once('dialog', async dialog => {
        await dialog.accept()
      })
      
      await page.waitForTimeout(500)
      
      // Verify event was deleted
      const events = await page.evaluate(() => window.calendar.getEvents())
      const deletedEvent = events.find((e: any) => e.id === 'test-delete')
      expect(deletedEvent).toBeUndefined()
    })

    test('should show event details on hover', async ({ page }) => {
      // Add an event
      await page.evaluate(() => {
        window.calendar.addEvent({
          id: 'test-hover',
          title: 'Hover Test Event',
          start: new Date(),
          description: 'This is a test event for hover'
        })
      })
      
      await page.waitForTimeout(500)
      
      // Hover over the event
      const eventElement = await page.$('.event-dot')
      await eventElement?.hover()
      
      // Check if tooltip appears
      const tooltip = await page.$('[role="tooltip"]')
      expect(tooltip).toBeTruthy()
    })
  })

  test.describe('Drag and Drop', () => {
    test('should drag and drop event to new date', async ({ page }) => {
      // Add a draggable event
      await page.evaluate(() => {
        window.calendar.addEvent({
          id: 'drag-test',
          title: 'Draggable Event',
          start: new Date('2024-06-15'),
          draggable: true
        })
      })
      
      await page.waitForTimeout(500)
      
      // Find the event element
      const eventElement = await page.$('[data-event-id="drag-test"]')
      const targetDate = await page.$('[data-date="2024-06-20"]')
      
      if (eventElement && targetDate) {
        // Perform drag and drop
        await eventElement.dragTo(targetDate)
        await page.waitForTimeout(500)
        
        // Verify event moved
        const event = await page.evaluate(() => 
          window.calendar.getEventById('drag-test')
        )
        expect(event.start).toContain('2024-06-20')
      }
    })

    test('should prevent dragging non-draggable events', async ({ page }) => {
      // Add a non-draggable event
      await page.evaluate(() => {
        window.calendar.addEvent({
          id: 'non-drag',
          title: 'Non-Draggable Event',
          start: new Date('2024-06-15'),
          draggable: false
        })
      })
      
      await page.waitForTimeout(500)
      
      const eventElement = await page.$('[data-event-id="non-drag"]')
      const isDraggable = await eventElement?.evaluate(el => 
        el.getAttribute('draggable') === 'true'
      )
      
      expect(isDraggable).toBeFalsy()
    })
  })

  test.describe('Theme Switching', () => {
    test('should switch to dark theme', async ({ page }) => {
      await page.selectOption('#themeSelect', 'dark')
      await page.waitForTimeout(500)
      
      const isDarkTheme = await page.evaluate(() => 
        document.querySelector('.calendar-container')?.classList.contains('theme-dark')
      )
      expect(isDarkTheme).toBeTruthy()
    })

    test('should switch to light theme', async ({ page }) => {
      await page.selectOption('#themeSelect', 'light')
      await page.waitForTimeout(500)
      
      const isLightTheme = await page.evaluate(() => 
        document.querySelector('.calendar-container')?.classList.contains('theme-light')
      )
      expect(isLightTheme).toBeTruthy()
    })

    test('should persist theme selection', async ({ page }) => {
      // Select dark theme
      await page.selectOption('#themeSelect', 'dark')
      await page.waitForTimeout(500)
      
      // Reload page
      await page.reload()
      await initCalendar(page)
      
      // Check if theme persisted
      const themeValue = await page.inputValue('#themeSelect')
      expect(themeValue).toBe('dark')
    })
  })

  test.describe('Localization', () => {
    test('should switch to English locale', async ({ page }) => {
      await page.selectOption('#localeSelect', 'en-US')
      await page.waitForTimeout(500)
      
      // Check if weekday labels changed to English
      const weekdayLabel = await page.textContent('.calendar-weekdays div:first-child')
      expect(weekdayLabel?.toLowerCase()).toContain('sun')
    })

    test('should switch to Japanese locale', async ({ page }) => {
      await page.selectOption('#localeSelect', 'ja-JP')
      await page.waitForTimeout(500)
      
      // Check if weekday labels changed to Japanese
      const weekdayLabel = await page.textContent('.calendar-weekdays div:first-child')
      expect(weekdayLabel).toContain('日')
    })

    test('should format dates according to locale', async ({ page }) => {
      // Switch to English
      await page.selectOption('#localeSelect', 'en-US')
      await page.waitForTimeout(500)
      
      const headerText = await page.textContent('.calendar-header h2')
      expect(headerText).toMatch(/\w+ \d{4}/) // e.g., "June 2024"
      
      // Switch back to Chinese
      await page.selectOption('#localeSelect', 'zh-CN')
      await page.waitForTimeout(500)
      
      const headerTextZh = await page.textContent('.calendar-header h2')
      expect(headerTextZh).toContain('年')
      expect(headerTextZh).toContain('月')
    })
  })

  test.describe('Data Import/Export', () => {
    test('should export events to JSON', async ({ page }) => {
      // Add some events
      await page.evaluate(() => {
        window.calendar.addEvent({
          id: 'export-1',
          title: 'Event 1',
          start: new Date('2024-06-15')
        })
        window.calendar.addEvent({
          id: 'export-2',
          title: 'Event 2',
          start: new Date('2024-06-20')
        })
      })
      
      // Set up download promise
      const downloadPromise = page.waitForEvent('download')
      
      // Click export button
      await page.click('#exportData')
      
      // Wait for download
      const download = await downloadPromise
      expect(download).toBeTruthy()
      
      // Check filename
      const filename = download.suggestedFilename()
      expect(filename).toContain('calendar')
      expect(filename).toContain('.json')
    })

    test('should import events from JSON', async ({ page }) => {
      // Create a JSON file content
      const jsonContent = JSON.stringify({
        version: '1.0.0',
        events: [
          {
            id: 'import-1',
            title: 'Imported Event 1',
            start: '2024-07-01T10:00:00Z'
          },
          {
            id: 'import-2',
            title: 'Imported Event 2',
            start: '2024-07-15T14:00:00Z'
          }
        ]
      })
      
      // Create a file input and trigger file selection
      await page.evaluate((content) => {
        const blob = new Blob([content], { type: 'application/json' })
        const file = new File([blob], 'test-import.json', { type: 'application/json' })
        
        // Create a custom event with the file
        const input = document.createElement('input')
        input.type = 'file'
        input.files = [file] as any
        
        // Trigger the import
        const event = new Event('change', { bubbles: true })
        Object.defineProperty(event, 'target', { 
          writable: false, 
          value: { files: [file] } 
        })
        
        // Find and trigger the import button's file input
        document.querySelector('#importData')?.dispatchEvent(new Event('click'))
      }, jsonContent)
      
      await page.waitForTimeout(1000)
      
      // Verify events were imported
      const events = await page.evaluate(() => window.calendar.getEvents())
      const importedEvent = events.find((e: any) => e.id === 'import-1')
      expect(importedEvent).toBeTruthy()
    })
  })

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.reload()
      await initCalendar(page)
      
      // Check if mobile layout is applied
      const isMobileView = await page.evaluate(() => {
        const calendar = document.querySelector('.calendar-container')
        return window.getComputedStyle(calendar!).display === 'block'
      })
      expect(isMobileView).toBeTruthy()
    })

    test('should adapt to tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.reload()
      await initCalendar(page)
      
      // Check layout
      const calendarWidth = await page.evaluate(() => {
        const calendar = document.querySelector('.calendar-container')
        return calendar?.clientWidth
      })
      expect(calendarWidth).toBeGreaterThan(700)
      expect(calendarWidth).toBeLessThan(800)
    })

    test('should show/hide controls on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.reload()
      await initCalendar(page)
      
      // Check if controls are hidden by default on mobile
      const controlsVisible = await page.evaluate(() => {
        const controls = document.querySelector('.controls')
        const style = window.getComputedStyle(controls!)
        return style.display !== 'none'
      })
      
      // On mobile, controls might be in a hamburger menu
      if (!controlsVisible) {
        const hamburger = await page.$('.menu-toggle')
        expect(hamburger).toBeTruthy()
      }
    })
  })

  test.describe('Performance', () => {
    test('should handle many events without lag', async ({ page }) => {
      // Add 100 events
      await page.evaluate(() => {
        const events = []
        for (let i = 0; i < 100; i++) {
          events.push({
            id: `perf-${i}`,
            title: `Event ${i}`,
            start: new Date(2024, 5, 1 + (i % 30))
          })
        }
        window.calendar.addEvents(events)
      })
      
      // Measure render time
      const renderTime = await page.evaluate(() => {
        const start = performance.now()
        window.calendar.render()
        const end = performance.now()
        return end - start
      })
      
      expect(renderTime).toBeLessThan(1000) // Should render within 1 second
    })

    test('should scroll smoothly with many events', async ({ page }) => {
      // Add many events
      await page.evaluate(() => {
        const events = []
        for (let i = 0; i < 200; i++) {
          events.push({
            id: `scroll-${i}`,
            title: `Event ${i}`,
            start: new Date(2024, i % 12, 1 + (i % 28))
          })
        }
        window.calendar.addEvents(events)
      })
      
      // Test scrolling performance
      await page.evaluate(() => {
        const container = document.querySelector('.calendar-container')
        container?.scrollTo({ top: 1000, behavior: 'smooth' })
      })
      
      await page.waitForTimeout(1000)
      
      // Check if scroll completed
      const scrollPosition = await page.evaluate(() => 
        document.querySelector('.calendar-container')?.scrollTop
      )
      expect(scrollPosition).toBeGreaterThan(0)
    })
  })

  test.describe('Accessibility', () => {
    test('should be navigable with keyboard only', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Check focused element
      const focusedElement = await page.evaluate(() => 
        document.activeElement?.tagName
      )
      expect(focusedElement).toBeTruthy()
    })

    test('should have proper ARIA labels', async ({ page }) => {
      const ariaLabels = await page.evaluate(() => {
        const elements = document.querySelectorAll('[aria-label]')
        return Array.from(elements).map(el => el.getAttribute('aria-label'))
      })
      
      expect(ariaLabels.length).toBeGreaterThan(0)
      ariaLabels.forEach(label => {
        expect(label).toBeTruthy()
        expect(label?.length).toBeGreaterThan(0)
      })
    })

    test('should announce changes to screen readers', async ({ page }) => {
      // Check for live regions
      const liveRegion = await page.$('[aria-live]')
      expect(liveRegion).toBeTruthy()
      
      // Trigger a change and check if it's announced
      await page.click('#goNext')
      await page.waitForTimeout(500)
      
      const announcement = await page.textContent('[aria-live]')
      expect(announcement).toBeTruthy()
    })

    test('should support high contrast mode', async ({ page }) => {
      // Enable high contrast
      await page.evaluate(() => {
        document.body.classList.add('high-contrast')
      })
      
      // Check if styles are applied
      const hasHighContrast = await page.evaluate(() => {
        const calendar = document.querySelector('.calendar-container')
        const styles = window.getComputedStyle(calendar!)
        return styles.borderWidth !== '0px'
      })
      
      expect(hasHighContrast).toBeTruthy()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true)
      
      // Try to load external events
      const error = await page.evaluate(async () => {
        try {
          await window.calendar.loadEventsFromURL('https://api.example.com/events')
          return null
        } catch (err: any) {
          return err.message
        }
      })
      
      expect(error).toBeTruthy()
      
      // Calendar should still be functional
      const isCalendarWorking = await page.evaluate(() => {
        window.calendar.addEvent({
          id: 'offline-test',
          title: 'Offline Event',
          start: new Date()
        })
        return window.calendar.getEvents().length > 0
      })
      
      expect(isCalendarWorking).toBeTruthy()
      
      // Re-enable network
      await page.context().setOffline(false)
    })

    test('should handle invalid date inputs', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          window.calendar.goToDate(new Date('invalid'))
          return null
        } catch (err: any) {
          return err.message
        }
      })
      
      expect(error).toBeTruthy()
    })

    test('should show error messages to user', async ({ page }) => {
      // Try to add invalid event
      await page.evaluate(() => {
        try {
          window.calendar.addEvent({
            id: '',
            title: '',
            start: new Date('invalid')
          })
        } catch (err) {
          // Error should be caught and displayed
        }
      })
      
      // Check for error message
      const errorMessage = await page.$('.error-message, .toast.error')
      expect(errorMessage).toBeTruthy()
    })
  })
})

// Visual regression tests
test.describe('Visual Regression', () => {
  test('should match month view screenshot', async ({ page }) => {
    await initCalendar(page)
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('calendar-month-view.png', {
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 800
      }
    })
  })

  test('should match week view screenshot', async ({ page }) => {
    await initCalendar(page)
    await page.click('#viewWeek')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('calendar-week-view.png', {
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 800
      }
    })
  })

  test('should match dark theme screenshot', async ({ page }) => {
    await initCalendar(page)
    await page.selectOption('#themeSelect', 'dark')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('calendar-dark-theme.png', {
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 800
      }
    })
  })
})