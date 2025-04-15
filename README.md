# Sanity and Next.js Portfolio Project

This is a full-featured [Sanity.io](https://sanity.io) and [Next.js](https://nextjs.org) portfolio website project. It includes 3D model viewing capabilities, project showcases, content management, and more.

## Features

- **Content Management**: Fully integrated Sanity Studio
- **Portfolio Projects**: Display and filter your work
- **3D Model Viewer**: Interactive viewer with multiple visualization modes
- **Responsive Design**: Works on desktop and mobile devices
- **Bio/About Page**: Showcase your skills and experience

## Setup Instructions

### 1. Prerequisites

- Node.js (latest LTS version recommended)
- npm package manager
- A Sanity.io account

### 2. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

You can get your project ID by creating a new project on [sanity.io/manage](https://sanity.io/manage).

### 3. Installation

Install the required dependencies:

```bash
npm install
```

### 4. Development Server

Run the development server:

```bash
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000) with your browser to see the frontend.
- Open [http://localhost:3000/studio](http://localhost:3000/studio) to access the Sanity Studio.

## Content Management Guide

### Sanity Studio

The Sanity Studio is accessible at `/studio` and allows you to manage all content:

1. **Posts**: Portfolio projects or blog posts
2. **Categories**: For organizing your posts
3. **Authors**: Information about content creators
4. **Bio**: Your personal or company information
5. **3D Models**: Upload and manage 3D assets
6. **Header**: Configure site navigation

### Creating and Managing Content

#### Header/Navigation

The site header can be configured in Sanity Studio under the "Header" document:
- Set the site title and subtitle
- Create navigation links to internal pages or external URLs

#### Posts/Projects

To create a new portfolio item:
1. Go to "Posts" in the Sanity Studio
2. Create a new document with title, images, and content
3. Assign categories for filtering
4. Use the rich text editor to add text, images, and even 3D models

#### Bio/About Section

Customize your profile or about section:
1. Edit the "Bio" document
2. Add a profile image, title, and subtitle
3. Write your bio using the block content editor
4. Add relevant skills as tags

#### 3D Models

To work with 3D models:
1. Upload GLB/GLTF files in the "3D Model" document type
2. Add thumbnails and descriptions
3. Reference models in your content or create dedicated model showcase pages

## Development Information

### Project Structure

- `/src/app`: Next.js App Router structure
- `/src/components`: Reusable React components
- `/src/sanity`: Sanity configuration, schemas and queries
- `/studio`: Sanity Studio configuration

### Key Files

- `src/sanity/schemaTypes/index.ts`: All content schemas
- `src/sanity/lib/queries.ts`: GROQ queries for fetching content
- `src/sanity/structure.ts`: Custom Sanity Studio structure
- `src/components/Header.tsx`: Site navigation component
- `src/components/ModelViewer`: 3D model viewing functionality

## Deployment

Deploy your project to your preferred hosting service (Vercel recommended for Next.js):

1. Push your repository to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy

## Customization

You can customize the project by:
- Modifying the TailwindCSS styles
- Adding new schema types in the Sanity configuration
- Creating new page templates and components
- Extending the 3D viewer capabilities

## Troubleshooting

If you encounter issues:
1. Check your environment variables
2. Ensure Sanity project ID and dataset are correct
3. Verify that your Sanity project has the required schemas
4. Check the browser console for errors

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity Community](https://slack.sanity.io)