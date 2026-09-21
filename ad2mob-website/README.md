# tauri-plugin-ad2mob website

Static documentation site for [tauri-plugin-ad2mob](https://github.com/marrionesa/tauri-plugin-ad2mob).

## Local development

```bash
bun install
bun run dev
```

The production build is a static export for GitHub Pages:

```bash
bun run build
```

The generated site is written to `out/`.

## GitHub Pages

The repository workflow at `.github/workflows/pages.yml` builds this directory
on pushes to `master` and deploys it through GitHub Pages. The expected URL is:

<https://marrionesa.github.io/tauri-plugin-ad2mob/>

To update the repository's GitHub Homepage field and short description
automatically, add a repository secret named `REPO_SETTINGS_TOKEN` containing
a fine-grained token with repository administration metadata write permission.
Without that optional secret, the Pages deployment still works and the metadata
can be set once manually in the repository Settings.
