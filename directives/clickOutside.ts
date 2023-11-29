import { htmlElement } from '@/common/commons';
import type { Directive } from 'vue'

interface HTMLElementWithClickOutsideEvent extends HTMLElement {
  clickOutsideEvent?: (event: MouseEvent) => void
}

export const clickOutsideDirective: Directive<HTMLElementWithClickOutsideEvent> = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function (event: MouseEvent) {
      if (!(el === event.target || el.contains(event.target as Node) || uidControl('muid', el, event) )) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  beforeUnmount(el) {
    document.removeEventListener('click', el.clickOutsideEvent!)
    delete el.clickOutsideEvent
  }
}

// const muidControl = (el: HTMLElement, event: MouseEvent) => {
//   const muid = el.getAttribute('data-muid');

//   if (muid) {
//     const el = htmlElement(`[muid="${muid}"]`)
//     return (el === event.target || el?.contains(event.target as Node))
//   }
//   return false;
// }

const uidControl = (uidName: string, el: HTMLElement, event: MouseEvent) => {
  const muid = el.getAttribute(`data-${uidName}`);

  if (muid) {
    const el = htmlElement(`[${uidName}="${muid}"]`)
    return (el === event.target || el?.contains(event.target as Node))
  }
  return false;
}