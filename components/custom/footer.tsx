export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
        © {new Date().getUTCFullYear()} Digital Repair . All rights reserved.
      </div>
    </footer>
  )
}
