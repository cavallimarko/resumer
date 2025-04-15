import {defineField, defineType} from 'sanity'
import {DesktopIcon, LinkIcon} from '@sanity/icons'

export const headerType = defineType({
  name: 'header',
  title: 'Header',
  type: 'document',
  icon: DesktopIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'A subtitle to display below the main title',
    }),
    defineField({
      name: 'mainNavigation',
      title: 'Main Navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'link',
          title: 'Link',
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'title',
              title: 'Link Title',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Internal page', value: 'internal'},
                  {title: 'External URL', value: 'external'},
                ],
                layout: 'radio',
              },
              initialValue: 'internal',
            }),
            defineField({
              name: 'internalLink',
              title: 'Internal Link',
              description: 'Select a document to link to',
              type: 'reference',
              to: [
                {type: 'post'},
                {type: 'category'},
                {type: 'bio'},
                {type: 'model3d'},
              ],
              hidden: ({parent}) => parent?.linkType !== 'internal',
            }),
            defineField({
              name: 'url',
              title: 'External URL',
              description: 'Used for external links (must start with "http://" or "https://")',
              type: 'url',
              hidden: ({parent}) => parent?.linkType !== 'external',
              validation: Rule => Rule.uri({
                scheme: ['http', 'https', 'mailto', 'tel']
              }),
            }),
            defineField({
              name: 'isExternal',
              title: 'Open in new tab',
              type: 'boolean',
              initialValue: false,
              hidden: ({parent}) => parent?.linkType !== 'external',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              linkType: 'linkType',
              internalLink: 'internalLink.title',
              url: 'url',
            },
            prepare({title, linkType, internalLink, url}) {
              return {
                title,
                subtitle: linkType === 'internal' 
                  ? `→ ${internalLink || 'Select a document'}` 
                  : `→ ${url || 'Add URL'}`,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'showStudioLink',
      title: 'Show Studio Link',
      description: 'Toggle the settings/studio icon in the header',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'Site Header',
      }
    },
  },
}) 