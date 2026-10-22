declare global {
  namespace App {
    interface PageData {
      /** Page title, without the site name suffix */
      title: string
      description?: string
      /** Set on paginated pages; pages after the first get a "(page N)" suffix */
      pageNumber?: number
    }
  }
}

export {}
