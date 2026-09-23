import type React from 'react'

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'basilisk-badge': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { theme?: string },
        HTMLElement
      >
    }
  }
}
