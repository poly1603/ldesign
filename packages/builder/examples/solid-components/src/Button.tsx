export function Button(props: any) {
  return <button style={{ padding: '4px 8px' }}>{props?.children || 'Solid'}</button>
}

