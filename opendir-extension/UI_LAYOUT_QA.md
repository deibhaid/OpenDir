# OpenDir — UI Layout Acceptance Checklist

Load `dist/` in Chrome on a directory index page with mixed files.

## Shell

- [ ] No stats/count chips row below header
- [ ] No Sort by dropdown in header
- [ ] Selection bar always 48px tall; no jump when selecting first item
- [ ] Default view is list

## Header row 1

- [ ] Breadcrumb left; Settings gear right only
- [ ] Settings opens 3-column horizontal panel (Theme | Thumbnails | Multi-file download)
- [ ] Theme options show selected checkmark

## Header row 2

- [ ] Search spans available width with clear button
- [ ] Filter icon filled when filter active
- [ ] Grid/List icon pair; active view filled

## List

- [ ] Five columns with checkbox; parent row shows `../` first even when sorting Size desc
- [ ] Column header click sorts; indicators match name vs other column rules
- [ ] Footer says "Showing all N items" unfiltered, "Showing N items" when search/filter active
- [ ] Row name links navigate (no preview modal from list)

## Grid

- [ ] Responsive 2–6 columns
- [ ] Media card click opens preview; folder navigates

## Preview

- [ ] Image/video/audio only in carousel; arrow keys work

See `UI_ORGANIZATION_PROMPTS.md` for full UI specification.
