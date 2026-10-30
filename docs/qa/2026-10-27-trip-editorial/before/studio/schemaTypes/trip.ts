import {defineArrayMember, defineField, defineType} from 'sanity'
import {promotionsField} from './promotions'

export const trip = defineType({
  name: 'trip',
  title: 'Viajes de surf',
  type: 'document',
  groups: [
    {name: 'content', title: 'Destino', default: true},
    {name: 'departures', title: 'Fechas y nivel'},
    {name: 'program', title: 'Programa'},
  ],
  fields: [
    defineField({
      name: 'name', title: 'Nombre del destino', type: 'string', group: 'content',
      description: 'Da un nombre propio a cada viaje, por ejemplo «Marruecos» o «Marruecos avanzado». Cada viaje tiene un rango de nivel y un único programa.',
      validation: (rule) => rule.required().custom(value => !value || !/\b(?:nivel(?:es)?|rookies|aprendices|riders|supercracks)\b/i.test(value) || 'El nombre del viaje no puede incluir el nivel. Usa el rango de nivel del viaje.'),
    }),
    defineField({
      name: 'slug', title: 'URL del destino', type: 'slug', group: 'content',
      description: 'Conserva la URL de los destinos ya publicados.',
      options: {source: 'name', maxLength: 96}, validation: (rule) => rule.required().custom(value => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || 'Usa minúsculas, números y guiones'),
    }),
    defineField({name: 'place', title: 'Lugar / región', type: 'string', group: 'content'}),
    defineField({name: 'tagline', title: 'Titular', type: 'string', group: 'content'}),
    defineField({name: 'intro', title: 'Presentación', type: 'text', rows: 4, group: 'content'}),
    defineField({
      name: 'hero', title: 'Foto de portada', type: 'image', group: 'content', options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Descripción de la imagen', type: 'string', validation: (rule) => rule.required()})],
    }),
    defineField({
      name: 'state', title: 'Estado del viaje', type: 'string', group: 'departures', initialValue: 'upcoming',
      options: {list: [{title: 'Próximas fechas por anunciar', value: 'upcoming'}, {title: 'Con fechas', value: 'confirmed'}], layout: 'radio'},
      description: 'Tener fechas no confirma la disponibilidad de plazas. Verifica los datos antes de publicar.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'availability', title: 'Disponibilidad', type: 'string', group: 'departures', initialValue: 'available', options: {list: [{title: 'Plazas disponibles', value: 'available'}, {title: 'Últimas plazas', value: 'last_places'}, {title: 'Completo', value: 'full'}, {title: 'Consultar disponibilidad', value: 'enquiry'}], layout: 'radio'}, description: 'Estado manual sin contador de plazas. Publica para actualizar la web.'}),
    defineField({
      name: 'levels', title: 'Rango de nivel del viaje', type: 'array', group: 'departures',
      description: 'Rango fijo para todas las fechas de este viaje. Si cambia el nivel o el programa, crea otro viaje con su propia URL.',
      of: [defineArrayMember({type: 'number', options: {list: [
        {title: 'I · Rookies', value: 1}, {title: 'II · Aprendices', value: 2},
        {title: 'III · Riders', value: 3}, {title: 'IV · Supercracks', value: 4},
      ]}, validation: (rule) => rule.integer().min(1).max(4)})],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({name: 'levelRequirement', title: 'Requisito de autonomía', type: 'string', group: 'departures', description: 'Requisito común a todas las fechas del viaje.'}),
    defineField({
      name: 'departures', title: 'Salidas', type: 'array', group: 'departures',
      description: 'Añade fechas solo si comparten el rango de nivel y exactamente el mismo programa. Puedes variar precio, disponibilidad, capacidad y dossier. Para otro nivel o itinerario, crea un viaje independiente.',
      of: [defineArrayMember({
        name: 'departure', title: 'Salida', type: 'object',
        fields: [
          defineField({name: 'start', title: 'Fecha de inicio', type: 'date', validation: (rule) => rule.required()}),
          defineField({name: 'end', title: 'Fecha de fin', type: 'date', validation: (rule) => rule.required().min(rule.valueOfField('start'))}),
          defineField({name: 'brevoValue', title: 'Valor VIAJE_SURF en Brevo (opcional)', type: 'number', description: 'ID numérico de la opción de esta fecha en el formulario Brevo. Debe existir allí antes de publicar. Las ocho salidas del formulario inicial ya están vinculadas por destino y fechas exactas. Rellena este campo para nuevas fechas o si cambia el ID.', validation: rule => rule.integer().min(1)}),
          defineField({name: 'duration', title: 'Duración (p. ej., 7 noches)', type: 'string'}),
          defineField({name: 'availability', title: 'Disponibilidad de esta salida (opcional)', type: 'string', options: {list: [{title: 'Plazas disponibles', value: 'available'}, {title: 'Últimas plazas', value: 'last_places'}, {title: 'Completo', value: 'full'}, {title: 'Consultar disponibilidad', value: 'enquiry'}], layout: 'radio'}, description: 'Vacío = hereda la disponibilidad general del viaje. Estado manual para esta fecha.'}),
          defineField({name: 'capacity', title: 'Capacidad de esta salida (opcional)', type: 'object', description: 'Vacío = hereda la capacidad general del viaje.', fields: [
            defineField({name: 'total', title: 'Capacidad total', type: 'number', validation: r => r.integer().min(1)}),
          ]}),
          defineField({name: 'price', title: 'Precio general por persona (€)', type: 'number', description: 'Tarifa general sin descuento. Vacío = por confirmar. Las tarifas reducidas se configuran debajo; no se cambia este importe al activar un early bird.', validation: (rule) => rule.greaterThan(0).precision(2)}),
          promotionsField,
          defineField({name: 'dossierFile', title: 'PDF de esta salida (opcional)', type: 'file', options: {accept: 'application/pdf'}, description: 'PDF específico de esta fecha. Tiene prioridad sobre la URL de esta salida. Sin PDF ni URL propios, se usa el dossier general del viaje.'}),
          defineField({name: 'dossier', title: 'URL del dossier de esta salida (opcional)', type: 'url', description: 'URL específica de esta fecha si no adjuntas un PDF propio. Vacío = usa el dossier general del viaje.', validation: (rule) => rule.uri({scheme: ['https']})}),
          defineField({name: 'message', title: 'Mensaje de consulta por WhatsApp', type: 'text', rows: 3}),
        ],
        preview: {select: {title: 'start', subtitle: 'duration'}},
      })],
    }),
    defineField({name: 'priceNote', title: 'Condiciones de la tarifa', type: 'text', group: 'departures'}),
    defineField({name: 'notice', title: 'Aviso de disponibilidad', type: 'text', rows: 2, group: 'departures'}),
    defineField({
      name: 'includes', title: 'Incluye', type: 'array', group: 'program',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'excludes', title: 'No incluye', type: 'array', group: 'program',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'faqs', title: 'Preguntas frecuentes', type: 'array', group: 'program',
      of: [defineArrayMember({
        name: 'faq', title: 'Pregunta', type: 'object',
        fields: [
          defineField({name: 'question', title: 'Pregunta', type: 'string', validation: (rule) => rule.required()}),
          defineField({name: 'answer', title: 'Respuesta', type: 'text', validation: (rule) => rule.required()}),
        ],
        preview: {select: {title: 'question'}},
      })],
    }),
    defineField({name: 'dossierFile', title: 'PDF del viaje', type: 'file', group: 'program', options: {accept: 'application/pdf'}, description: 'Sube o sustituye el PDF aprobado. Este archivo tiene prioridad sobre la URL anterior.'}),
    defineField({name: 'dossier', title: 'URL anterior del dossier (opcional)', type: 'url', group: 'program', validation: (rule) => rule.uri({scheme: ['https']})}),
    defineField({name: 'storyTitle', title: 'Título del programa', type: 'string', group: 'program'}),
    defineField({name: 'storyLabel', title: 'Antetítulo del programa', type: 'string', group: 'program'}),
    defineField({name: 'storyIntro', title: 'Introducción del programa', type: 'text', group: 'program'}),
    defineField({name: 'story', title: 'Programa', type: 'array', group: 'program', of: [defineArrayMember({
      name: 'storyItem', type: 'object', fields: [
        defineField({name: 'title', title: 'Título', type: 'string', validation: r => r.required()}),
        defineField({name: 'text', title: 'Contenido', type: 'text', validation: r => r.required()}),
      ],
    })]}),
    defineField({name: 'inclusionsNote', title: 'Aclaración de inclusiones', type: 'text', group: 'program'}),
    defineField({name: 'levelText', title: 'Explicación del nivel', type: 'text', group: 'departures'}),
    defineField({name: 'levelChecks', title: 'Requisitos del nivel', type: 'array', group: 'departures', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'gallery', title: 'Fotos del viaje', type: 'array', group: 'content', of: [defineArrayMember({
      type: 'image', options: {hotspot: true}, fields: [
        defineField({name: 'alt', title: 'Descripción de la imagen', type: 'string', validation: r => r.required()}),
        defineField({name: 'caption', title: 'Pie de foto', type: 'string'}),
      ],
    })]}),
    defineField({name: 'stay', title: 'Alojamiento', type: 'object', group: 'program', fields: [
      defineField({name: 'title', title: 'Título', type: 'string'}),
      defineField({name: 'name', title: 'Nombre', type: 'string'}),
      defineField({name: 'text', title: 'Descripción', type: 'text'}),
      defineField({name: 'note', title: 'Condiciones', type: 'text'}),
      defineField({name: 'image', title: 'Foto', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Descripción de la foto', type: 'string'})]}),
    ]}),
    defineField({name: 'team', title: 'Acompañamiento', type: 'object', group: 'program', fields: [
      defineField({name: 'title', title: 'Título', type: 'string'}),
      defineField({name: 'text', title: 'Descripción', type: 'text'}),
    ]}),
    defineField({name: 'payment', title: 'Señal y condiciones', type: 'object', group: 'departures', fields: [
      defineField({name: 'depositAmount', title: 'Señal fija (€)', type: 'number', description: 'Importe manual. No se calcula desde porcentajes o tarifas.', validation: r => r.greaterThan(0).precision(2)}),
      defineField({name: 'terms', title: 'Condiciones de pago', type: 'text', description: 'Texto editorial aprobado; aclarar contradicciones antes de publicar.'}),
    ]}),
    defineField({name: 'capacity', title: 'Capacidad y disponibilidad manual', type: 'object', group: 'departures', fields: [
      defineField({name: 'total', title: 'Capacidad total', type: 'number', validation: r => r.integer().min(1)}),
    ]}),
    defineField({name: 'editorialNotes', title: 'Fuentes y pendientes internos', type: 'text', group: 'program', description: 'Solo Studio; no se publica en la web.'}),
    defineField({name: 'source', title: 'Fuente de los datos', type: 'url', group: 'program', validation: r => r.uri({scheme: ['https']})}),
    defineField({name: 'checkedAt', title: 'Fecha de revisión de los datos', type: 'date', group: 'program'}),
  ],
  preview: {select: {title: 'name', subtitle: 'place', media: 'hero'}},
})
