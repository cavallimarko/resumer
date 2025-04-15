import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Blog')
    .items([
      // Singleton for Header
      S.listItem()
        .title('Header')
        .id('header')
        .child(
          S.document()
            .schemaType('header')
            .documentId('header')
        ),
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('bio').title('Bio'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'category', 'author', 'bio', 'header'].includes(item.getId()!),
      ),
    ])
