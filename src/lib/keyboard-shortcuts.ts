'use client'

import { useEffect } from 'react'

interface ShortcutConfig {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  callback: () => void
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = event

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatches = shortcut.key.toLowerCase() === key.toLowerCase()
        const ctrlMatches = (shortcut.ctrlKey || false) === ctrlKey
        const metaMatches = (shortcut.metaKey || false) === metaKey
        const altMatches = (shortcut.altKey || false) === altKey
        const shiftMatches = (shortcut.shiftKey || false) === shiftKey

        return keyMatches && ctrlMatches && metaMatches && altMatches && shiftMatches
      })

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault !== false) {
          event.preventDefault()
        }
        matchingShortcut.callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Global keyboard shortcuts
export function useGlobalShortcuts() {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'k',
      ctrlKey: true,
      callback: () => {
        // Open command palette (future feature)
        console.log('Command palette shortcut')
      }
    },
    {
      key: 'k',
      metaKey: true,
      callback: () => {
        // Open command palette (future feature)
        console.log('Command palette shortcut')
      }
    }
  ]

  useKeyboardShortcuts(shortcuts)
}

// Chat page shortcuts
export function useChatShortcuts(sendMessage: () => void) {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'Enter',
      ctrlKey: true,
      callback: sendMessage
    },
    {
      key: 'Enter',
      metaKey: true,
      callback: sendMessage
    }
  ]

  useKeyboardShortcuts(shortcuts)
}

// Flashcard shortcuts
export function useFlashcardShortcuts(
  onGrade1: () => void,
  onGrade2: () => void,
  onGrade3: () => void,
  onGrade4: () => void,
  onFlip?: () => void
) {
  const shortcuts: ShortcutConfig[] = [
    {
      key: '1',
      callback: onGrade1
    },
    {
      key: '2',
      callback: onGrade2
    },
    {
      key: '3',
      callback: onGrade3
    },
    {
      key: '4',
      callback: onGrade4
    },
    ...(onFlip ? [{
      key: ' ',
      callback: onFlip,
      preventDefault: true
    }] : [])
  ]

  useKeyboardShortcuts(shortcuts)
}

// Study timer shortcuts
export function useStudyTimerShortcuts(
  onStartPause: () => void,
  onStop: () => void,
  onReset: () => void
) {
  const shortcuts: ShortcutConfig[] = [
    {
      key: ' ',
      callback: onStartPause,
      preventDefault: true
    },
    {
      key: 'Escape',
      callback: onStop
    },
    {
      key: 'r',
      callback: onReset
    }
  ]

  useKeyboardShortcuts(shortcuts)
}

// Navigation shortcuts
export function useNavigationShortcuts() {
  const shortcuts: ShortcutConfig[] = [
    {
      key: '1',
      altKey: true,
      callback: () => window.location.href = '/'
    },
    {
      key: '2',
      altKey: true,
      callback: () => window.location.href = '/chat'
    },
    {
      key: '3',
      altKey: true,
      callback: () => window.location.href = '/interview'
    },
    {
      key: '4',
      altKey: true,
      callback: () => window.location.href = '/study'
    },
    {
      key: '5',
      altKey: true,
      callback: () => window.location.href = '/flashcards'
    },
    {
      key: '6',
      altKey: true,
      callback: () => window.location.href = '/settings'
    }
  ]

  useKeyboardShortcuts(shortcuts)
}