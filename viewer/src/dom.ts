/**
 * Minimal DOM helper utilities
 */

export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

export function $$(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(selector));
}

export function el(tag: string, attrs?: Record<string, string>, children?: (string | HTMLElement)[]): HTMLElement {
  const element = document.createElement(tag);
  
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'class') {
        element.className = value;
      } else if (key === 'style') {
        element.setAttribute('style', value);
      } else {
        element.setAttribute(key, value);
      }
    }
  }

  if (children) {
    for (const child of children) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    }
  }

  return element;
}

export function on(element: HTMLElement | Document, event: string, handler: (e: Event) => void): void {
  element.addEventListener(event, handler);
}

export function off(element: HTMLElement | Document, event: string, handler: (e: Event) => void): void {
  element.removeEventListener(event, handler);
}

export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className);
}

export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className);
}

export function toggleClass(element: HTMLElement, className: string): void {
  element.classList.toggle(className);
}

export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

export function setText(element: HTMLElement, text: string): void {
  element.textContent = text;
}

export function getText(element: HTMLElement): string {
  return element.textContent || '';
}

export function setHTML(element: HTMLElement, html: string): void {
  element.innerHTML = html;
}

export function show(element: HTMLElement): void {
  element.style.display = '';
}

export function hide(element: HTMLElement): void {
  element.style.display = 'none';
}

export function clear(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
