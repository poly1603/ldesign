export function Badge(props: { text?: string }) {
  return <span style="background:#eee;padding:2px 6px;border-radius:4px;">{props.text || 'Preact'}</span>
}

