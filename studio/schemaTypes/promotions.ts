import {defineArrayMember, defineField} from 'sanity'
import {validatePromotions} from '../../scripts/trip-pricing.mjs'

export const promotionsField = defineField({
  name: 'promotions', title: 'Tarifas reducidas / early bird', type: 'array',
  description: 'Opcional. Mantén arriba el precio general. Marca una sola tarifa como vigente; al completar su cupo, desmárcala y activa el siguiente tramo si existe. Sin ninguna vigente se aplica el precio general. Las plazas describen el cupo de la oferta: no son un contador de reservas ni de plazas libres.',
  of: [defineArrayMember({
    name: 'promotion', title: 'Tarifa reducida', type: 'object',
    fields: [
      defineField({name: 'label', title: 'Nombre', type: 'string', initialValue: 'Early bird', validation: r => r.required().max(60)}),
      defineField({name: 'price', title: 'Precio reducido por persona (€)', type: 'number', validation: r => r.required().greaterThan(0).precision(2)}),
      defineField({name: 'active', title: 'Esta es la tarifa vigente', type: 'boolean', initialValue: false, description: 'Selección manual. Solo una tarifa reducida puede estar vigente en esta salida.'}),
      defineField({name: 'firstPlace', title: 'Primera plaza del tramo', type: 'number', description: 'Por ejemplo, 1 en early bird o 9 en el siguiente tramo. Deja ambas plazas vacías si el PDF no concreta cupo.', validation: r => r.integer().min(1)}),
      defineField({name: 'lastPlace', title: 'Última plaza del tramo', type: 'number', description: 'Por ejemplo, 8 significa primeras 8 plazas cuando el tramo empieza en 1.', validation: r => r.integer().min(1)}),
      defineField({name: 'condition', title: 'Condición cuando no hay cupo numérico', type: 'string', description: 'Copia la condición aprobada, por ejemplo «Plazas limitadas». No inventes un cupo.', validation: r => r.max(80)}),
    ],
    preview: {select: {title: 'label', price: 'price', active: 'active'}, prepare: ({title, price, active}) => ({title, subtitle: `${price ?? '—'} €${active ? ' · VIGENTE' : ''}`})},
  })],
  validation: rule => rule.custom((value, context) => {
    const parent = context.parent as {price?: number; capacity?: {total?: number}} | undefined
    const document = context.document as {capacity?: {total?: number}} | undefined
    try { validatePromotions(value, parent?.price, parent?.capacity?.total ?? document?.capacity?.total); return true }
    catch (error) { return error instanceof Error ? error.message : 'Tarifas reducidas inválidas' }
  }),
})
