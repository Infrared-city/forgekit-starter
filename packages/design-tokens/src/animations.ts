/**
 * Design Tokens: Animations & Transitions
 *
 * Keyframe animations and transition configurations.
 */

// ============================================
// Transition Durations
// ============================================

export const duration = {
  /** 150ms - Fast micro-interactions */
  fast: '150ms',
  /** 200ms - Standard transitions */
  default: '200ms',
  /** 300ms - Medium animations */
  medium: '300ms',
  /** 500ms - Slow animations */
  slow: '500ms',
  /** 1000ms - Very slow, looping animations */
  verySlow: '1000ms',
} as const

// ============================================
// Easing Functions
// ============================================

export const easing = {
  /** Standard ease-out for most animations */
  default: 'ease-out',
  /** Ease-in-out for smooth looping */
  smooth: 'ease-in-out',
  /** Linear for constant speed */
  linear: 'linear',
  /** Custom spring-like easing */
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const

// ============================================
// Keyframe Animations
// ============================================

export const keyframes = {
  /** Accordion expand animation */
  accordionDown: {
    from: { height: '0' },
    to: { height: 'var(--radix-accordion-content-height)' },
  },

  /** Accordion collapse animation */
  accordionUp: {
    from: { height: 'var(--radix-accordion-content-height)' },
    to: { height: '0' },
  },

  /** Slide in from right */
  slideInFromRight: {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' },
  },

  /** Slide out to right */
  slideOutToRight: {
    from: { transform: 'translateX(0)' },
    to: { transform: 'translateX(100%)' },
  },

  /** Chatbot message slide in */
  chatbotSlideIn: {
    from: { transform: 'translateY(20%)', opacity: '0' },
    to: { transform: 'translateX(0)', opacity: '1' },
  },

  /** Loading dot animation */
  loadingDot: {
    '0%': {
      backgroundColor: 'var(--background)',
      transform: 'scale(1)',
    },
    '50%': {
      backgroundColor: 'var(--primary-purple)',
      transform: 'scale(1.3)',
    },
    '100%': {
      backgroundColor: 'var(--secondary-blue)',
      transform: 'scale(1)',
    },
  },

  /** Pulse animation for skeletons */
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },

  /** Spin animation for loaders */
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },

  /** Fade in */
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },

  /** Fade out */
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },

  /** Scale in */
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: '0' },
    to: { transform: 'scale(1)', opacity: '1' },
  },
} as const

// ============================================
// Animation Presets
// ============================================

export const animation = {
  /** Accordion expand: 200ms ease-out */
  accordionDown: 'accordion-down 0.2s ease-out',

  /** Accordion collapse: 200ms ease-out */
  accordionUp: 'accordion-up 0.2s ease-out',

  /** Slide in from right: 500ms ease-out */
  slideInFromRight: 'animate-slide-in-from-right 0.5s ease-out',

  /** Slide out to right: 500ms ease-out */
  slideOutToRight: 'animate-slide-out-to-right 0.5s ease-out',

  /** Chatbot message: 200ms ease-out */
  chatbotSlideIn: 'chatbot-slide-in-messages 0.2s ease-out',

  /** Loading dot: 1s infinite ease-in-out */
  loadingDot: 'dot ease-in-out 1s infinite',

  /** Pulse: 2s infinite */
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',

  /** Spin: 1s linear infinite */
  spin: 'spin 1s linear infinite',
} as const

// ============================================
// Loading Dot Delays
// ============================================

export const loadingDotDelays = {
  first: '0s',
  second: '0.2s',
  third: '0.3s',
} as const

// ============================================
// CSS Keyframes Generator
// ============================================

export function generateKeyframesCSS(): string {
  return `
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

@keyframes animate-slide-in-from-right {
  0% { transform: translateX(100%); }
  100% { transform: translateX(0); }
}

@keyframes animate-slide-out-to-right {
  0% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}

@keyframes chatbot-slide-in-messages {
  0% { transform: translateY(20%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes dot {
  0% { background-color: var(--background); transform: scale(1); }
  50% { background-color: var(--primary-purple); transform: scale(1.3); }
  100% { background-color: var(--secondary-blue); transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`.trim()
}

// ============================================
// Tailwind Animation Config
// ============================================

export const tailwindAnimationConfig = {
  keyframes: {
    'accordion-down': {
      from: { height: '0' },
      to: { height: 'var(--radix-accordion-content-height)' },
    },
    'accordion-up': {
      from: { height: 'var(--radix-accordion-content-height)' },
      to: { height: '0' },
    },
  },
  animation: {
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up': 'accordion-up 0.2s ease-out',
  },
} as const
