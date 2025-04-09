import {defineType, defineArrayMember} from 'sanity'
import {ImageIcon, CubeIcon} from '@sanity/icons'

/**
 * This is the schema type for block content used in the post document type
 * Importing this type into the studio configuration's `schema` property
 * lets you reuse it in other document types with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */

export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      // Styles let you define what blocks can be marked up as. The default
      // set corresponds with HTML tags, but you can set any title or value
      // you want, and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [{title: 'Bullet', value: 'bullet'}],
      // Marks let you mark up inline text in the Portable Text Editor
      marks: {
        // Decorators usually describe a single property – e.g. a typographic
        // preference or highlighting
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    }),
    // You can add additional types here. Note that you can't use
    // primitive types such as 'string' and 'number' in the same array
    // as a block type.
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
    // Add 3D model support
    defineArrayMember({
      name: 'model3d',
      type: 'object',
      title: '3D Model',
      icon: CubeIcon,
      fields: [
        {
          name: 'modelFile',
          type: 'reference',
          to: [{type: 'model3d'}],
          title: '3D Model',
          validation: Rule => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
        {
          name: 'height',
          type: 'number',
          title: 'Viewer Height',
          description: 'Height in pixels',
          initialValue: 400,
        }
      ],
      preview: {
        select: {
          title: 'caption',
          modelFileRef: 'modelFile',
        },
        prepare(selection) {
          const { title, modelFileRef } = selection;
          // More defensive check that doesn't try to access nested properties directly
          return {
            title: title || (modelFileRef ? '3D Model selected' : 'No Model Selected'),
            subtitle: '3D Model',
            media: CubeIcon
          }
        }
      }
    }),
  ],
})
