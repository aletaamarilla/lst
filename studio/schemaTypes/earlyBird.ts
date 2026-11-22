import {defineField} from 'sanity'
import {validateEarlyBird} from '../../scripts/trip-pricing.mjs'

export const earlyBirdField = defineField({
  name: 'earlyBird', title: 'Early bird', type: 'object',
  description: 'Opcional. Precio rebajado hasta una fecha. Desde el día siguiente la web muestra el precio general, sin tocar nada.',
  options: {collapsible: true, collapsed: false},
  fields: [
    defineField({name: 'price', title: 'Precio early bird por persona (€)', type: 'number', validation: r => r.greaterThan(0).precision(2)}),
    defineField({name: 'until', title: 'Válido hasta (incluido)', type: 'date', description: 'Último día con precio early bird, hasta las 23:59 de España.', options: {dateFormat: 'D [de] MMMM [de] YYYY'}}),
  ],
  validation: rule => rule.custom((value: {price?: number; until?: string} | undefined, context) => {
    if (!value || (value.price == null && !value.until)) return true
    const parent = context.parent as {price?: number; start?: string} | undefined
    try { validateEarlyBird(value, parent?.price, parent?.start); return true }
    catch (error) { return error instanceof Error ? error.message : 'Early bird inválido' }
  }),
})
