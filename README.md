# Google Drive Clone

A modern, responsive Google Drive  minimal clone built with Next.js, featuring file management, folder organization, and a beautiful user interface.

## Live Demo

Check out the live demo: [Google Drive Clone](https://google-drive-clone-coral.vercel.app/)

## Features

- 🔐 **Authentication**
  - Secure user authentication using Clerk
  - Protected routes and API endpoints
  - User profile management

- 📁 **File Management**
  - Upload files with size and type validation
  - Create and organize folders
  - Rename files and folders
  - Delete files and folders
  - File preview support for images and PDFs
  - File size formatting

- 🎨 **Modern UI/UX**
  - Responsive design for all devices
  - Dark/Light mode support
  - Beautiful animations and transitions
  - Intuitive folder navigation
  - Drag and drop file upload
  - Loading states and error handling

- 🔒 **Security**
  - User-specific file access
  - Secure file storage
  - Protected API routes
  - Input validation

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Authentication:** Clerk
- **Database:** Neon (PostgreSQL)
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with shadcn/ui
- **Icons:** Lucide Icons
- **File Storage:** Uploadthing (Cloud Storage)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Neon account)
- Clerk account for authentication

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dzemenu/google-drive-clone.git
   cd google-drive-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   DATABASE_URL=your_database_url
   UPLOADTHING_SECRET=your_uploadthing_secret
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## File Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   ├── upload-modal.tsx  # File upload modal
│   └── file-preview.tsx  # File preview component
├── lib/                   # Utility functions
│   ├── db/               # Database configuration
│   └── utils.ts          # Helper functions
└── types/                # TypeScript types
```

## Features in Detail

### File Upload
- Maximum file size: 10MB
- Supported file types:
  - Images (jpg, jpeg, png, gif, webp)
  - Documents (pdf, txt, doc, docx, xls, xlsx)
- Drag and drop support
- Progress indication
- Error handling

### Folder Management
- Create new folders
- Rename folders
- Delete folders (with confirmation)
- Nested folder structure
- Empty folder states

### File Operations
- Upload to specific folders
- Rename files
- Delete files
- Preview images and PDFs
- File size display
- File type icons

### User Interface
- Responsive sidebar
- Dark/Light mode toggle
- Loading states
- Error messages
- Success notifications
- Confirmation modals

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)

## Deployment

This project is deployed on Vercel. You can deploy your own version by:

1. Fork this repository
2. Create a new project on [Vercel](https://vercel.com)
3. Import your forked repository
4. Add your environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`
5. Deploy!
