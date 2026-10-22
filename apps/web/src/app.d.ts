declare global {
  namespace App {
    interface PageData {
      /** Page title, without the site name suffix */
      title: string
      description?: string
    }
  }
}

export {}
