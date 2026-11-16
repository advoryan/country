type Tag = keyof HTMLElementTagNameMap;

export function el<K extends Tag>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

export function infoList(entries: [string, string][]): HTMLDListElement {
  return el(
    'dl',
    { className: 'info' },
    ...entries.flatMap(([term, value]) => [
      el('dt', { textContent: term }),
      el('dd', { textContent: value }),
    ]),
  );
}
